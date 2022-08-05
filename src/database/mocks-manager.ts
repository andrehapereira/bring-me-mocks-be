import { Application } from 'express';
import * as fs from 'fs';
import { Mock } from '../models/mock';
export class MocksManager {

    public async getMocksById(projectPath: string, id: string) {
        const mock = await fs.promises.readFile(`${projectPath}/${id}.json`, 'utf-8');
        return JSON.parse(mock);
    }


    public async getMocksByProject(projectPath: string) {
        const files = this.getAllFilesFromDir();
        const mockFiles = await files(projectPath);
        const mocks = [];
        await Promise.all(
            mockFiles?.map( async (file) => {
            let content = await fs.promises.readFile(projectPath + '/' + file,'utf-8');
            mocks.push(JSON.parse(content))
            })
        )
        return mocks;    
    }

    public async addMocksToApi(app: Application) {
        const getDirectories = async source =>
        (await fs.promises.readdir(source, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
        const projects = await getDirectories('./projects');
        projects.forEach(async project => {
            const storedMocks = await this.getMocksByProject('./projects/' + project);
            storedMocks?.forEach(item => {
                this.publishMock(item.mock, app, project);
            })
        })
    }
    
    public publishMock(mock: Mock<any>, app: Application, project) {
        this.method(mock.method, app)(`/${project}${mock.urlPattern.startsWith("/") ? '' : '/'}${mock.urlPattern}`, (req, res) => {
            const status = mock.statusToReturn || 200;
            const response = mock.responses.find(r => r.status === status)?.body;
            const headers = mock.headers ? Object.entries(mock.headers) : [];
            headers.forEach(header => {
                res.setHeader(header[0], header[1]);
            })
            res.status(status).send(response)
        })
    }

    public unpublishMock(url: string, app: Application, project) {
        var routes = app._router.stack;
        const routeToRemove = `/${project}${url.startsWith('/') ? '' : '/'}${url}`
        routes.forEach(removeMiddlewares);
        function removeMiddlewares(route, i, routes) {
            const pattern = route.route?.path;
            if (pattern === routeToRemove) {
                routes.splice(i, 1);
            } 
        }
    }

    public async unpublishProject(path: string, app: Application, project: string) {
        const mocksToUnpublish = await this.getMocksByProject(path);
        mocksToUnpublish.forEach(item => {
            this.unpublishMock(item.mock.urlPattern, app, project);
        })
    }

    public findById(storedMocks, id) {
        return storedMocks.find(item => item.id === id);
    }


    public alreadyExists(storedMocks, mockToStore) {
        return !!storedMocks.find(item => item.mock.urlPattern === mockToStore.urlPattern && item.mock.method === mockToStore.method);
    }

    private getAllFilesFromDir() {
        return async source => (await fs.promises.readdir(source, { withFileTypes: true }))
        .filter(dirent => dirent.isFile())
        .map(dirent => dirent.name);
    }

    private method(method: string, app: Application) {
        switch(method) {
            case 'GET':
                return app.get.bind(app);
            case 'POST':
                return app.post.bind(app);
            case 'DELETE':
                return app.delete.bind(app);
            case 'PUT':
                return app.put.bind(app);
            case 'PATCH':
                return app.patch.bind(app)
            default:
                throw new Error('Invalid method');
        }
    }
    
}