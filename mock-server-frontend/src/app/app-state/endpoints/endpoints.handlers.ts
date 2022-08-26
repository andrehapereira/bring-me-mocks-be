import { EndpointsState } from "../models/app-state";
import { GetEndpointsSuccessAction } from "./endpoints.actions";

export const handleGetEndpoints = (state: EndpointsState) => ({
    ...state,
    isLoading: true,
    hasError: false
})

export const handleGetEndpointsSuccess = (state: EndpointsState, action: GetEndpointsSuccessAction) => {
    let list = [...action.data].sort((a, b) => a.serviceName.toLowerCase() > b.serviceName.toLowerCase() ? 1 : -1);
    list = list.map(item => {
        return ({
            ...item,
            items: [...item.items].sort((a, b) => a.urlPattern.toLowerCase() > b.urlPattern.toLowerCase() ? 1 : -1)
        })
    })
    return ({
    ...state,
    isLoading: false,
    list
})};

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

export const handleEndAction = (state: EndpointsState) => ({
    ...state,
    isLoading: false,
    hasError: false
})