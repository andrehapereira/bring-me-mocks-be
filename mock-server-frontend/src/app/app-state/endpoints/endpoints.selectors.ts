import { createFeatureSelector, createSelector } from "@ngrx/store";
import { EndpointsState, Features } from "../models/app-state";

const endpointsState = createFeatureSelector<EndpointsState>(Features.ENDPOINTS);

export const isGettingEndpoints = createSelector(endpointsState, (state) => state.isLoading);

export const endpointsList = createSelector(endpointsState, (state) => state.list);

export const hasEndpointsError = createSelector(endpointsState, (state) => state.hasError);

export const noEndpoints = createSelector(endpointsState, (state) => !state.list.length);

export const searchEndpoints = (query: string) => createSelector(endpointsState, (state) => {
    const list = [...state.list].map(item => {
        return ({
            ...item,
            items: item.items.filter(i => i.urlPattern.toLowerCase().includes(query.toLowerCase()) || i.method.toLowerCase().includes(query.toLowerCase()))
        })
    }).filter(item => item.items.length);
    return list;
});
