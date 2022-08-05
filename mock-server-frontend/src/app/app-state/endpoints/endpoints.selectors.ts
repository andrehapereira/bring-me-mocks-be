import { createFeatureSelector, createSelector } from "@ngrx/store";
import { EndpointsState, Features } from "../models/app-state";

const endpointsState = createFeatureSelector<EndpointsState>(Features.ENDPOINTS);

export const isGettingEndpoints = createSelector(endpointsState, (state) => state.isLoading);

export const endpointsList = createSelector(endpointsState, (state) => state.list);

export const hasEndpointsError = createSelector(endpointsState, (state) => state.hasError);

export const noEndpoints = createSelector(endpointsState, (state) => !state.list.length);
