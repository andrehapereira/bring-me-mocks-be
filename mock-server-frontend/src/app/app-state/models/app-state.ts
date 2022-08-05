import { Endpoint } from "src/app/services/project/models/endpoints";

export enum Features {
    ENDPOINTS = 'endpoints',
    PROJECTS = 'projects'
}

export interface EndpointsState {
    list: Endpoint[],
    isLoading: boolean,
    hasError: boolean
}

export interface ProjectsState {
    list: string[],
    isLoading: boolean,
    hasError: boolean
}

export interface AppState {
    [Features.ENDPOINTS]: EndpointsState,
    [Features.PROJECTS]: ProjectsState
}
