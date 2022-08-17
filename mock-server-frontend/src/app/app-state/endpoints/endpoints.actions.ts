import { createAction, props } from "@ngrx/store";
import { CreateEndpointPostBody, Endpoint } from "src/app/services/project/models/endpoints";
import { ImportProjectsAction } from "../projects/projects.actions";

export interface GetEndpointAction {
    projectName: string
}

export type ExportEndpointAction = GetEndpointAction;

export interface GetEndpointsSuccessAction {
    data: Endpoint[]
}

export interface SaveEndpointAction {
    body: CreateEndpointPostBody
    projectName: string,
}

export interface DeleteEndpointAction {
    id: string,
    projectName: string
}

export interface ImportEndpointsAction extends ImportProjectsAction {
    projectName: string;
}

export const GET_ENDPOINTS = createAction(
    "GET_ENDPOINTS",
    props<GetEndpointAction>()
)
export const GET_ENDPOINTS_SUCCESS = createAction(
    "GET_ENDPOINTS_SUCCESS",
    props<GetEndpointsSuccessAction>()
)
export const GET_ENDPOINTS_ERROR = createAction(
    "GET_ENDPOINTS_ERROR"
)

export const SAVE_ENDPOINT_DATA = createAction(
    "SAVE_ENDPOINT_DATA",
    props<SaveEndpointAction>()
)

export const DELETE_ENDPOINT = createAction(
    "DELETE_ENDPOINT",
    props<DeleteEndpointAction>()
)

export const END_ACTION = createAction(
    "END_ACTION"
)

export const EXPORT_ENDPOINT = createAction(
    "EXPORT_ENDPOINT",
    props<ExportEndpointAction>()
)

export const IMPORT_ENDPOINT = createAction(
    "IMPORT_ENDPOINT",
    props<ImportEndpointsAction>()
)