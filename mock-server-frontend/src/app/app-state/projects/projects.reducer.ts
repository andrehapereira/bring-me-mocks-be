import { Action, createReducer, on } from "@ngrx/store";
import { ProjectsState } from "../models/app-state";
import { CREATE_PROJECT, DELETE_PROJECT, GET_PROJECTS, GET_PROJECTS_ERROR, GET_PROJECTS_SUCCESS, END_ACTION } from "./projects.actions";
import { handleCreateProject, handleDeleteProject, handleGetProjects, handleGetProjectsError, handleGetProjectsSuccess, handleEndAction } from "./projects.handlers";

export const initialValue: ProjectsState = {
    list: [],
    isLoading: false,
    hasError: false
}

const reducer = createReducer(
    initialValue,
    on(GET_PROJECTS, handleGetProjects),
    on(GET_PROJECTS_SUCCESS, handleGetProjectsSuccess),
    on(GET_PROJECTS_ERROR, handleGetProjectsError),
    on(CREATE_PROJECT, handleCreateProject),
    on(DELETE_PROJECT, handleDeleteProject),
    on(END_ACTION, handleEndAction)
)

export function projectsReducer(state: ProjectsState | undefined, action: Action) {
    return reducer(state, action)
}