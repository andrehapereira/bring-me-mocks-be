import { Application } from 'express';
import * as fs from 'fs';
import { ConnectorActions, Mock } from '../models/mock';
import { v4 as id } from 'uuid';
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
        this.method(mock.method, app)(`/${project}${mock.urlPattern.startsWith("/") ? '' : '/'}${mock.urlPattern}`, async (req, res) => {
            const status = mock.statusToReturn || 200;
            let response = mock.responses.find(r => r.status === status)?.body;
            const headers = mock.headers ? Object.entries(mock.headers) : [];
            headers.forEach(header => {
                res.setHeader(header[0], header[1]);
            })
            if (this.hasConnector(mock)) {
                const connectedSuccessfull = await this.manageConnector(mock.connector, project, req);
                if (connectedSuccessfull && (mock.connector.action === ConnectorActions.GET || mock.connector.action === ConnectorActions.SEARCH)) {
                    response = connectedSuccessfull.mock.responses[0].body;
                }
                if (connectedSuccessfull && mock.connector.action !== ConnectorActions.GET && mock.connector.action !== ConnectorActions.SEARCH) {
                    let data = JSON.stringify(connectedSuccessfull, null, 4);
                    fs.writeFileSync(`./projects/${project}/${connectedSuccessfull.id}.json`, data);
                }
                
            }
            res.status(status).send(response)
        })
    }

    private async manageConnector(connector: any, project: string, req: any) {
        const target = connector.target;
        const action = connector.action;
        const property = connector.by;
        const targetMock = await this.getMocksById('./projects/' + project, target);
        if (targetMock) {
            targetMock.mock.responses.map(response => {
                switch (action) {
                    case ConnectorActions.SEARCH:
                        return this.connectorSearchAction(response, req, property);
                    case ConnectorActions.GET:
                        return this.connectorGetAction(response, req, property);
                    case ConnectorActions.ADD:
                        return this.connectorAddAction(response, req);
                    case ConnectorActions.DELETE:
                        return this.connectorDeleteAction(response, req, property);
                    case ConnectorActions.UPDATE:
                        return this.connectorUpdateAction(response, req, property);
                    default:
                        throw new Error('Something went wrong');
                }
            })
            targetMock.mock.responses[0]
            return targetMock;
        }
        return null;
    }

    private connectorSearchAction(mockResponse: any, req, property) {
        if (mockResponse.status === 200 && Array.isArray(mockResponse.body)) {
            const id = req.body[property || 'id'] || req.query[property || 'id'] || req.params[property || 'id'];
            if (!id) return mockResponse;
            console.log('here')
            mockResponse.body = mockResponse.body.filter(item => {
                const searchQuery = this.asString(id).toLowerCase().trim();
                const itemDataAsString = this.asString(item[property || 'id']).toLowerCase().trim();
                return itemDataAsString.includes(searchQuery);
            });
        } 
        return mockResponse;
    }

    private connectorGetAction(mockResponse: any, req, property) {
        if (mockResponse.status === 200 && Array.isArray(mockResponse.body)) {
            const id = req.body[property || 'id'] || req.query[property || 'id'] || req.params[property || 'id'];
            mockResponse.body = mockResponse.body.find(item => {
                const query = this.asString(id).toLowerCase().trim();
                const itemDataAsString = this.asString(item[property || 'id']).toLowerCase().trim();
                return itemDataAsString === query;
            });
        } 
        return mockResponse;
    }

    private connectorAddAction(mockResponse: any, req) {
        if (mockResponse.status === 200 && Array.isArray(mockResponse.body)) {
            const requestBody = req.body;
            mockResponse.body.push({
                ...requestBody,
                id: requestBody.id || id()
            })
        } 
        return mockResponse;
    }

    private connectorDeleteAction(mockResponse: any, req, property) {
        if (mockResponse.status === 200 && Array.isArray(mockResponse.body)) {
            const id = req.body[property || 'id'] || req.query[property || 'id'] || req.params[property || 'id'];
            mockResponse.body = mockResponse.body.filter(item => {
                const query = this.asString(id).toLowerCase().trim();
                const itemDataAsString = this.asString(item[property || 'id']).toLowerCase().trim();
                return itemDataAsString !== query;
            });
        } 
        return mockResponse;
    }

    private async connectorUpdateAction(mockResponse: any, req, property) {
        if (mockResponse.status === 200 && Array.isArray(mockResponse.body)) {
            const requestBody = req.body;
            const id = req.body[property || 'id'] || req.query[property || 'id'] || req.params[property || 'id'];
            mockResponse.body = mockResponse.body.map(item => {
                const query = this.asString(id).toLowerCase().trim();
                const itemDataAsString = this.asString(item[property || 'id']).toLowerCase().trim();
                if (itemDataAsString === query) {
                    return ({
                        ...item,
                        ...requestBody
                    })
                }
                return item;
            });
        } else if (mockResponse.status === 200 && !Array.isArray(mockResponse.body)) {
            mockResponse.body = { ...mockResponse.body, ...req.body };
        }
        return mockResponse;
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

    public alreadyExistsItem(storedMocks, mockToStore) {
        return storedMocks.find(item => item.mock.urlPattern === mockToStore.urlPattern && item.mock.method === mockToStore.method);
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

    private hasConnector(mock: Mock<any>) {
        return mock.connector && mock.connector.action && mock.connector.target;
    }

    private asString(item: any) {
        return typeof item !== 'string' ? String(item) : item;
    }
    
}