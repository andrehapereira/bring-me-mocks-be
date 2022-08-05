import { createAction, props } from "@ngrx/store";

export interface ProjectsSuccessAction {
    projects: string[]
}

export interface DeleteProjectAction {
    projectName: string
}

export type CreateProjectAction = DeleteProjectAction;

export interface ImportProjectsAction {
    file: File
}

export const GET_PROJECTS = createAction(
    "GET_PROJECTS"
)

export const GET_PROJECTS_SUCCESS = createAction(
    "GET_PROJECTS_SUCCESS",
    props<ProjectsSuccessAction>()
)

export const GET_PROJECTS_ERROR = createAction(
    "GET_PROJECTS_ERROR"
)

export const CREATE_PROJECT = createAction(
    "CREATE_PROJECT",
    props<CreateProjectAction>()
)

export const DELETE_PROJECT = createAction(
    "DELETE_PROJECT",
    props<DeleteProjectAction>()
)

export const END_ACTION = createAction(
    "END_ACTION"
)

export const EXPORT_PROJECTS = createAction(
    "EXPORT_PROJECTS"
)

export const IMPORT_PROJECTS = createAction(
    "IMPORT_PROJECTS",
    props<ImportProjectsAction>()
)