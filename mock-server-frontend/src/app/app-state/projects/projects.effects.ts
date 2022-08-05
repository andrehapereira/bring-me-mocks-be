import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { concatMap, map, catchError, share } from "rxjs/operators";
import { ProjectManagerService } from "src/app/services/project/project-manager.service";
import { CreateProjectAction, CREATE_PROJECT, DeleteProjectAction, DELETE_PROJECT, END_ACTION, EXPORT_PROJECTS, GET_PROJECTS, GET_PROJECTS_ERROR, GET_PROJECTS_SUCCESS, ImportProjectsAction, IMPORT_PROJECTS } from "./projects.actions";

@Injectable()
export class ProjectsEffects {
    constructor(
        private actions$: Actions,
        private projectManager: ProjectManagerService
    ) {}

    getProjects$ = createEffect(() => this.actions$.pipe(
        ofType(GET_PROJECTS),
        concatMap(() => {
            return this.projectManager.getProjects()
                .pipe(
                    map(projects => GET_PROJECTS_SUCCESS({ projects })),
                    catchError(_ => of(GET_PROJECTS_ERROR()))
                )
        })
    ))

    createProject$ = createEffect(() => this.actions$.pipe(
        ofType(CREATE_PROJECT),
        concatMap((action: CreateProjectAction) => {
            return this.projectManager.createProject(action.projectName)
                .pipe(
                    map(_ => GET_PROJECTS()),
                    catchError(_ => of(END_ACTION()))
                )
        }),
        share()
    ))

    deleteProjects$ = createEffect(() => this.actions$.pipe(
        ofType(DELETE_PROJECT),
        concatMap((action: DeleteProjectAction) => {
            return this.projectManager.deleteProject(action.projectName).pipe(
                map(_ => GET_PROJECTS()),
                catchError(_ => of(END_ACTION()))
            )
        })
    ))

    exportProjects$ = createEffect(() => this.actions$.pipe(
        ofType(EXPORT_PROJECTS),
        map(() => {
            this.projectManager.exportAllProjects();
            return END_ACTION();
        })
    )) 

    importProjects$ = createEffect(() => this.actions$.pipe(
        ofType(IMPORT_PROJECTS),
        concatMap((action: ImportProjectsAction) => {
            return this.projectManager.importProjects(action.file).pipe(
                map(_ => GET_PROJECTS()),
                catchError(_ => of(END_ACTION()))
            )
        })
    ))
}