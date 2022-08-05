import { ProjectsState } from "../models/app-state";
import { ProjectsSuccessAction } from "./projects.actions";

export const handleGetProjects = (state: ProjectsState) => ({
    ...state,
    isLoading: true,
    hasError: false
});

export const handleGetProjectsSuccess = (state: ProjectsState, action: ProjectsSuccessAction) => ({
    ...state,
    list: [...action.projects].sort((a, b) => a.toLowerCase() > b.toLowerCase() ? 1 : -1),
    isLoading: false
});

export const handleGetProjectsError = (state: ProjectsState) => ({
    ...state,
    isLoading: false,
    hasError: true
});

export const handleCreateProject = (state: ProjectsState) => ({
    ...state,
    isLoading: true
})

export const handleDeleteProject = (state: ProjectsState) => ({
    ...state,
    isLoading: true
})

export const handleEndAction = (state: ProjectsState) => ({
    ...state,
    isLoading: false,
    hasError: false,
})