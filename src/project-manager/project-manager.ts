import { Application } from "express";
import { ErrorCodes, ErrorMessages } from "../models/error-codes";
import * as fs from 'fs';
import { Sender } from "../models/responses";
import { Mock } from "../models/mock";
import { MocksManager } from "../database/mocks-manager";
import { v4 as id } from 'uuid';
import { ImportExportManager } from "../import-export-manager/import-export-manager";

export class ProjectManager {

    private PROJECTS_API_ROOT: string;
    private readonly mocksManager: MocksManager 
    private readonly importExportManager: ImportExportManager;

    private readonly PROJECT_BASE_PATH = './projects'

    constructor(private _app: Application, apiRoot: string) {
        this.PROJECTS_API_ROOT = `${apiRoot}/projects`;
        this.mocksManager = new MocksManager();
        this.importExportManager = new ImportExportManager(this._app, this.PROJECTS_API_ROOT, this.PROJECT_BASE_PATH, this.mocksManager);
    }

    start() {
        //GET
        this.onGetProjects();
        this.onGetProjectEndpoints();
        
        //POST
        this.onCreateNewProject();
        this.onCreateProjectEndpoint();

        //PUT
        this.onUpdateProjectEndpoint();

        //DELETE
        this.onDeleteProject();
        this.onDeleteProjectEndpoint();

        this.mocksManager.addMocksToApi(this._app);
        this.importExportManager.start();
    }

    private onGetProjects() {
        return this._app.get(`${this.PROJECTS_API_ROOT}`, async (req, res) => {
            const sender = new Sender(res);
            const getDirectories = async source =>
            (await fs.promises.readdir(source, { withFileTypes: true }))
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);
            const projects = await getDirectories(this.PROJECT_BASE_PATH);
            return sender.sendCustom(200, projects);
        })
    }

    private onCreateNewProject() {
        return this._app.post(`${this.PROJECTS_API_ROOT}/create-project`, (req, res) => {
            const sender = new Sender(res);
            const namePattern = '^[A-Za-z-]*$';
            if (!req.body.projectName) {
                return sender.send(400, ErrorCodes.BAD_REQUEST, 'projectName');
            }
            if (!fs.existsSync(this.PROJECT_BASE_PATH)) {
                fs.mkdirSync(this.PROJECT_BASE_PATH);
            }
            if (!(new RegExp(namePattern).test(req.body.projectName))) {
                return sender.sendCustom(400, { code: 'pattern', message: 'Only letters and "-" are allower for projectName' })
            }
            const projectDir = `${this.PROJECT_BASE_PATH}/${req.body.projectName}`;
            if (!fs.existsSync(projectDir)) {
                fs.mkdirSync(projectDir);
                return sender.send(200, ErrorCodes.CREATED);
            }
            return sender.send(409, ErrorCodes.ALREADY_EXISTS, req.body.projectName);
        });
    }

    private onDeleteProject() {
        this._app.delete(`${this.PROJECTS_API_ROOT}/delete-project/:project`, async (req, res) => {
            const sender = new Sender(res);
            const project = req.params.project;
            if (!fs.existsSync(`${this.PROJECT_BASE_PATH}/${project}`)) {
                return sender.send(404, ErrorCodes.NOT_FOUND, project);
            }
            await this.mocksManager.unpublishProject(`${this.PROJECT_BASE_PATH}/${project}`, this._app, project)
            fs.rmdirSync(`${this.PROJECT_BASE_PATH}/${project}`, { recursive: true })
            return sender.send(200, ErrorCodes.CREATED);
        
        })
    }

    private onCreateProjectEndpoint() {
        return this._app.post(`${this.PROJECTS_API_ROOT}/:project/create-endpoint`, async (req, res) => {
            const sender = new Sender(res)
            const project = req.params.project;
            if (!fs.existsSync(`${this.PROJECT_BASE_PATH}/${project}`)) {
                return sender.send(404, ErrorCodes.NOT_FOUND, project);
            }
            const { serviceName, mock } = req.body;
            if (!serviceName || !mock) {
                return sender.send(400, ErrorCodes.BAD_REQUEST, 'serviceName or mock');
            }
            const currentMocks = await this.mocksManager.getMocksByProject(`${this.PROJECT_BASE_PATH}/${project}`);
            if (this.mocksManager.alreadyExists(currentMocks, mock)) {
                return sender.send(409, ErrorCodes.ALREADY_EXISTS);
            }
            const dataId = id();
            req.body.id = dataId;
            let data = JSON.stringify(req.body, null, 4);
            fs.writeFileSync(`${this.PROJECT_BASE_PATH}/${project}/${dataId}.json`, data);
            this.mocksManager.publishMock(req.body.mock, this._app, project);
            return sender.send(200, ErrorCodes.CREATED);
        })
    }

    private onUpdateProjectEndpoint() {
        return this._app.put(`${this.PROJECTS_API_ROOT}/:project/update-endpoint/:id`, async (req, res) => {
            const sender = new Sender(res);
            const project = req.params.project;
            const id = req.params.id;
            if (!fs.existsSync(`${this.PROJECT_BASE_PATH}/${project}`)) {
                return sender.send(404, ErrorCodes.NOT_FOUND, project);
            }
            const { serviceName, mock } = req.body;
            if (!serviceName || !mock || !id) {
                return sender.send(400, ErrorCodes.BAD_REQUEST, 'serviceName, mock or id');
            }
            const currentMocks = await this.mocksManager.getMocksByProject(`${this.PROJECT_BASE_PATH}/${project}`);
            const mockToUpdate = this.mocksManager.findById(currentMocks, id);
            if (!mockToUpdate) {
                return sender.send(404, ErrorCodes.NOT_FOUND, `Mock with id "${id}"`)
            }
            req.body.id = id;
            let data = JSON.stringify(req.body, null, 4);
            fs.writeFileSync(`${this.PROJECT_BASE_PATH}/${project}/${id}.json`, data);
            this.mocksManager.publishMock(req.body.mock, this._app, project);
            return sender.send(200, ErrorCodes.CREATED);
        })
    }

    private onDeleteProjectEndpoint() {
        return this._app.delete(`${this.PROJECTS_API_ROOT}/:project/delete-endpoint/:id`, async (req, res) => {
            const sender = new Sender(res);
            const project = req.params.project;
            const id = req.params.id;
            if (!fs.existsSync(`${this.PROJECT_BASE_PATH}/${project}`)) {
                return sender.send(404, ErrorCodes.NOT_FOUND, project);
            }
            if (!fs.existsSync(`${this.PROJECT_BASE_PATH}/${project}/${id}.json`)) {
                return sender.send(404, ErrorCodes.NOT_FOUND, `Endpoint with id "${id}",`)
            }
            const storedMock = await this.mocksManager.getMocksById(`${this.PROJECT_BASE_PATH}/${project}`, id);
            fs.unlink(`${this.PROJECT_BASE_PATH}/${project}/${id}.json`, (err) => {
                if (err) {
                    return sender.send(500, ErrorCodes.SOMETHING_WENT_WRONG)
                }
                this.mocksManager.unpublishMock(storedMock.mock.urlPattern, this._app, project)
                return sender.send(200, ErrorCodes.CREATED);
            })
        })
    }

    private onGetProjectEndpoints() {
        return this._app.get(`${this.PROJECTS_API_ROOT}/:project/endpoints`, async (req,res) => {
            const sender = new Sender(res);
            const project = req.params.project;
            if (!project) {
                return sender.send(500, ErrorCodes.SOMETHING_WENT_WRONG)
            }
            const endpoints = await this.mocksManager.getMocksByProject(`${this.PROJECT_BASE_PATH}/${project}`);
            return sender.sendCustom(200, endpoints)
        })
    }
}