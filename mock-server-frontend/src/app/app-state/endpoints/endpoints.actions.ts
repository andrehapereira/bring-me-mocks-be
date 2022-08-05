import { createAction, props } from "@ngrx/store";
import { CreateEndpointPostBody, Endpoint } from "src/app/services/project/models/endpoints";

export interface GetEndpointAction {
    projectName: string
}

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