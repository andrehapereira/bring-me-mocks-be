import { Application } from "express";
import { MocksManager } from "../database/mocks-manager";
import * as fs from 'fs';
import { v4 as id } from 'uuid';
import { Sender } from "../models/responses";
import { ErrorCodes } from "../models/error-codes";
import { Mock, MocksItemResponse, projectsExport } from "../models/mock";
export class ImportExportManager {

    private projectNamePatter = '^[A-Za-z-]*$';

    constructor(private _app: Application, private PROJECTS_API_ROOT, private PROJECTS_BASE_PATH: string, private mocksManager: MocksManager) {
    }

    start() { 
        this.onExportAllProjects();
        this.onImportProjects();
        this.onEndpointsImport();
        this.onEndpointsExport();
    }

    private onEndpointsImport() {
        return this._app.post(`${this.PROJECTS_API_ROOT}/import-endpoints/:project`, (req, res) => {
            const sender = new Sender(res);
            const file = req.body.data;
            const project = req.params.project;
            const data = Buffer.from(file, 'base64').toString('ascii');
            try {
                const parsedData = JSON.parse(data);
                this.compliesWithEndpointsImportSchema(parsedData, project);
                this.mergeEndpoints(parsedData, project);
                return sender.send(200, ErrorCodes.CREATED);
            } catch(e) {
                return sender.sendCustom(500, { error: e.message });
            }
        })
    }

    private onEndpointsExport() {
        return this._app.get(`${this.PROJECTS_API_ROOT}/export-endpoints/:project`, async (req, res) => {
            const project = req.params.project;
            const storedMocks = await this.mocksManager.getMocksByProject(`${this.PROJECTS_BASE_PATH}/${project}`);
            const data = JSON.stringify(storedMocks, null, 4);
            res.setHeader('Content-disposition', `attachment; filename=${project}-endpoints-${id().substring(0, 5)}.json`);
            res.setHeader('Content-type', 'application/json');
            res.write(data, function (err) {
                res.end();
            })
            
        })
    }

    private onImportProjects() {
        return this._app.post(`${this.PROJECTS_API_ROOT}/import-project`, (req, res) => {
            const sender = new Sender(res);
            const file = req.body.data;
            const data = Buffer.from(file, 'base64').toString('ascii');
            try {
                const parsedData = JSON.parse(data);
                this.compliesWithProjectsImportSchema(parsedData);
                parsedData.forEach(this.createProjectIfNonExistentAndMergeEndpoints.bind(this))
                return sender.send(200, ErrorCodes.CREATED);
            } catch(e) {
                return sender.sendCustom(500, { error: e.message });
            }
        })
    }

    private onExportAllProjects() {
        return this._app.get(`${this.PROJECTS_API_ROOT}/export-all`, async (req, res) => {
            const projectsData = await this.readAllData();
            const data = JSON.stringify(projectsData, null, 4);
            res.setHeader('Content-disposition', `attachment; filename=${id()}.json`);
            res.setHeader('Content-type', 'application/json');
            res.write(data, function (err) {
                res.end();
            })
        })
    }

    private async readAllData() {
        const getDirectories = async source =>
        (await fs.promises.readdir(source, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
        const projects = await getDirectories(this.PROJECTS_BASE_PATH);
        let data = [];
        await Promise.all(
            projects?.map( async (project) => {
            const storedMocks = await this.mocksManager.getMocksByProject(`${this.PROJECTS_BASE_PATH}/` + project);
            const toStore = {
                projectName: project,
                endpoints: [...storedMocks]
            }
            data.push(toStore);
            })
        )
        return data;
    }

    private createProjectIfNonExistentAndMergeEndpoints(project: any) {
        this.createProject(project.projectName);
        this.mergeEndpoints(project.endpoints, project.projectName);
    }

    private createProject(name: string) {
        if (!(new RegExp(this.projectNamePatter).test(name))) {
            throw new Error('Only letters and "-" are allower for projectName')
        }
        const projectDir = `${this.PROJECTS_BASE_PATH}/${name}`;
        if (!fs.existsSync(projectDir)) {
            fs.mkdirSync(projectDir);
        }
    }

    private mergeEndpoints(endpoints: any [], project: string) {
        endpoints.forEach(async endpoint => {
            const storedMocks = await this.mocksManager.getMocksByProject(`${this.PROJECTS_BASE_PATH}/${project}`);
            const belongsToId = storedMocks.find(mock => mock.id === endpoint.id)?.id;
            const alreadyExists = this.mocksManager.alreadyExistsItem(storedMocks, endpoint.mock);
            if (alreadyExists) {
                fs.unlink(`${this.PROJECTS_BASE_PATH}/${project}/${alreadyExists.id}.json`, (err) => {
                    if (err) {
                        throw err;
                    }
  
                })
            }
            const data = JSON.stringify(endpoint, null, 4);
            fs.writeFileSync(`${this.PROJECTS_BASE_PATH}/${project}/${belongsToId || endpoint.id}.json`, data);
            this.mocksManager.publishMock(endpoint, this._app, project);
        })
    }


    private compliesWithEndpointsImportSchema(endpoints: any[], project: string) {
        endpoints.forEach(endpoint => {
            if (this.isNotString(endpoint.id) || this.isNotString(endpoint.serviceName)) {
                throw new Error(`[Project:${project}]id and serviceName are required and must be string`);
            }
            if (!this.isMock(endpoint.mock)) {
                throw new Error(`[Project:${project}]mock property is required and must be of type mock (contain the following: urlPattern[string], method[string], statusToReturn[number], responses[array])`);
            }
            const responses = endpoint.mock.responses;
            responses.forEach(response => {
                if (this.isNotNumber(response.status) || !response.body) {
                    throw new Error(`[Project:${project}]status and body are required. Status must be number`);
                }
            })
        })
    }



    private compliesWithProjectsImportSchema(data: any[]) {
        if (!Array.isArray(data)) {
            throw new Error('Invalid JSON.')
        }
        data.forEach(item => {
            if (this.isNotString(item.projectName)) {
                throw new Error('projectName is required and must be of type string.');
            }
            const endpoints = item.endpoints;
            if (this.isNotArray(endpoints)) {
                throw new Error(`[Project:${item.projectName}]endpoints is required and must be an array.`);
            }
            this.compliesWithEndpointsImportSchema(endpoints, item.projectName);
        })
        return true;
    }

    private isMock(mock: any) {
        return !this.isNotString(mock.urlPattern) && !this.isNotString(mock.method) && !this.isNotArray(mock.responses) && !this.isNotNumber(mock.statusToReturn);
    }

    private isNotString(item: any) {
        return !item || typeof item !== 'string';
    }

    private isNotArray(item: any) {
        return !item || !Array.isArray(item);
    }

    private isNotNumber(item: any) {
        return !item || typeof item !== 'number';
    }
}