import { Application } from "express";
import { MocksManager } from "../database/mocks-manager";
import * as fs from 'fs';
import { v4 as id } from 'uuid';
import { Sender } from "../models/responses";
import { ErrorCodes } from "../models/error-codes";
import { Mock, MocksItemResponse, projectsExport } from "../models/mock";
export class ImportExportManager {
    constructor(private _app: Application, private PROJECTS_API_ROOT, private PROJECTS_BASE_PATH: string, private mocksManager: MocksManager) {
    }

    start() { 
        this.onExportAllProjects();
        this.onImportProjects();
    }

    private onImportProjects() {
        return this._app.post(`${this.PROJECTS_API_ROOT}/import-project`, (req, res) => {
            const sender = new Sender(res);
            const file = req.body.data;
            const data = Buffer.from(file, 'base64').toString('ascii');
            try {
                const parsedData = JSON.parse(data);
                console.log(parsedData);
                this.compliesWithSchema(parsedData);
                return sender.send(200, ErrorCodes.CREATED);
            } catch(e) {
                return sender.sendCustom(500, ErrorCodes.SOMETHING_WENT_WRONG);
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

    private compliesWithSchema(data: any[]) {
        if (!Array.isArray(data)) {
            throw new Error('Invalid JSON.')
        }
        data.forEach(item => {
            if (!item['projectName'] || typeof item['projectName'] === 'string') {

            }
        })
        console.log(Array.isArray(data))
        console.log(projectsExport)
        return true;
    }

    private isNotString(item: any) {
        return !item || typeof item !== 'string';
    }
}