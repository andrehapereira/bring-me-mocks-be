import { state } from "@angular/animations";
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { Features, ProjectsState } from "../models/app-state";

const projectState = createFeatureSelector<ProjectsState>(Features.PROJECTS);

export const projectsList = createSelector(projectState, (state) => state.list);

export const isGettingProjects = createSelector(projectState, (state) => state.isLoading);

export const hasProjectsError = createSelector(projectState, (state) => state.hasError);

export const noProjects = createSelector(projectState, (state) => !state.list.length)