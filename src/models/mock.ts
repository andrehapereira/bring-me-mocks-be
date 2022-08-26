export interface Mock<T> {
    urlPattern: string;
    method: string;
    statusToReturn: number;
    responses: Array<MocksItemResponse<T>>;
    headers?: { [key:string]: string},
    connector?: { action: ConnectorActions, target: string, by: string }
}

export interface MocksItemResponse<T> {
    status: number;
    body?: T;
}

export enum ConnectorActions {
    UPDATE = 'UPDATE',
    ADD = 'ADD',
    DELETE = 'DELETE',
    GET = 'GET',
    SEARCH = 'SEARCH'

}


export const projectsExport = {
    projectName: '',
    endpoints: [{
        id: '',
        serviceName: '',
        mock: {
            urlPattern: '',
            method: '',
            statusToReturn: 0,
            headers: {
                "item": "item"
            },
            responses: []
        }
    }],
}