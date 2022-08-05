export interface Mock<T> {
    urlPattern: string;
    method: string;
    statusToReturn: number;
    responses: Array<MocksItemResponse<T>>;
    headers?: { [key:string]: string}
}

export interface MocksItemResponse<T> {
    status: number;
    body?: T;
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