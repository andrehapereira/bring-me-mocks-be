import { Application } from "express";
import * as express from 'express'
import * as cors from 'cors';
import { ProjectManager } from "./project-manager/project-manager";
import { MocksManager } from "./database/mocks-manager";

export class Server {
    private readonly API_ROOT = '/api';

    private readonly _app: Application;

    private readonly projectManager: ProjectManager;

    private readonly mocksManager: MocksManager;

    private defaultHeaders = {
        "Content-Security-Policy-Report-Only": "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'"
    }
    

    constructor(private PORT: string) {
        this._app = express();
        this.projectManager = new ProjectManager(this._app, this.API_ROOT);
        this.mocksManager = new MocksManager();
    }

    start() {
        this._app.listen(this.PORT, () => {
            console.log('LISTENING AT: ', this.PORT)
        })
        this._app.use(express.json({limit: '50mb'}));
        this._app.use(cors({origin: '*'}));
        this._app.use((req, res, next) => {
            Object.entries(this.defaultHeaders).forEach(([header, value]) => {
                res.setHeader(header, value);
            });
            next();
        });

        this._app.get('/', (req, res) => {
            res.status(200).send({ STATUS: 'UP'});
        });

        this.projectManager.start();
    }

}