import { Action, createReducer } from "@ngrx/store";
import { EndpointsState } from "../models/app-state";
import { GET_ENDPOINTS, GET_ENDPOINTS_SUCCESS, GET_ENDPOINTS_ERROR, SAVE_ENDPOINT_DATA, DELETE_ENDPOINT, END_ACTION } from "./endpoints.actions";
import { on } from '@ngrx/store';
import { handleGetEndpoints, handleGetEndpointsSuccess, handleGetEndpointsError, handleSaveEndpointData, handleEndAction  } from "./endpoints.handlers";

export const initialValue: EndpointsState = {
    list: [],
    isLoading: false,
    hasError: false
}

export const reducer = createReducer(
    initialValue,
    on(GET_ENDPOINTS, handleGetEndpoints),
    on(GET_ENDPOINTS_SUCCESS, handleGetEndpointsSuccess),
    on(GET_ENDPOINTS_ERROR, handleGetEndpointsError),
    on(SAVE_ENDPOINT_DATA, handleSaveEndpointData),
    on(DELETE_ENDPOINT, handleSaveEndpointData),
    on(END_ACTION, handleEndAction),
)

export function endpointsReducer(state: EndpointsState | undefined, action: Action) {
    return reducer(state, action);
}