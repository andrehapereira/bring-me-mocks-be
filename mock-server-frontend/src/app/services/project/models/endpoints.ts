export interface Endpoint {
    serviceName: string,
    items: EndpointItem[]
}

export interface EndpointItem {
    id: string,
    urlPattern: string,
    method: string,
    statusToReturn: number,
    headers?: { [key: string]: string }
    responses: any[]
}

export interface CreateEndpointPostBody {
    id: string,
    serviceName: string,
    mock: Mock<any>
}

export interface Mock<T> {
    urlPattern: string;
    method: string;
    statusToReturn: number,
    headers?: { [key: string]: string }
    responses: Array<MocksItemResponse<T>>;
}

export interface MocksItemResponse<T> {
    status: number;
    body?: T;
}

export const Status = {
    OK: 200,
    CREATED: 201,
    FOUND: 302,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500 
}

export const StatusAsArray = Object.values(Status);

export enum METHOD {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH'
}

export const Methods = Object.values(METHOD);