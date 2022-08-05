import { EndpointsState } from "../models/app-state";
import { GetEndpointsSuccessAction } from "./endpoints.actions";

export const handleGetEndpoints = (state: EndpointsState) => ({
    ...state,
    isLoading: true,
    hasError: false
})

export const handleGetEndpointsSuccess = (state: EndpointsState, action: GetEndpointsSuccessAction) => ({
    ...state,
    isLoading: false,
    list: [...action.data].sort((a, b) => a.serviceName.toLowerCase() > b.serviceName.toLowerCase() ? 1 : -1)
})

export const handleGetEndpointsError = (state: EndpointsState) => ({
    ...state,
    isLoading: false,
    hasError: true
})

export const handleSaveEndpointData = (state: EndpointsState) => ({
    ...state,
    isLoading: true,
})

export const handleDeleteEndpoint = (state: EndpointsState) => ({
    ...state,
    isLoading: true
})