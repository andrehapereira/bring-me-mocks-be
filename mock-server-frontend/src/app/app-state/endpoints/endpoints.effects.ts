import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { catchError, concatMap, map, share } from "rxjs/operators";
import { EndpointManagerService } from "src/app/services/project/endpoint-manager.service";
import { DeleteEndpointAction, DELETE_ENDPOINT, END_ACTION, ExportEndpointAction, EXPORT_ENDPOINT, GetEndpointAction, GET_ENDPOINTS, GET_ENDPOINTS_ERROR, GET_ENDPOINTS_SUCCESS, ImportEndpointsAction, IMPORT_ENDPOINT, SaveEndpointAction, SAVE_ENDPOINT_DATA } from "./endpoints.actions";

@Injectable()
export class EndpointsEffects {
    constructor(
        private action$: Actions,
        private endpointManager: EndpointManagerService
    ) {}

    getEndpoints$ = createEffect(() => this.action$.pipe(
        ofType(GET_ENDPOINTS),
        concatMap((action: GetEndpointAction) => {
            return this.endpointManager.getProjectEndpoints(action.projectName)
                .pipe(
                    map(endpoints => GET_ENDPOINTS_SUCCESS({ data: endpoints })),
                    catchError(_ => of(GET_ENDPOINTS_ERROR()))
                )
        })
    ))

    saveEndpoint$ = createEffect(() => this.action$.pipe(
        ofType(SAVE_ENDPOINT_DATA),
        concatMap((action: SaveEndpointAction) => {
            if (action.body.id) {
                return this.endpointManager.updateProjectEndpoint(action.projectName, action.body, action.body.id)
                    .pipe(
                        map(_ => GET_ENDPOINTS({ projectName: action.projectName })),
                        catchError(_ => of(END_ACTION()))
                    )
            } else {
                return this.endpointManager.createProjectEndpoint(action.projectName, action.body)
                    .pipe(
                        map(_ => GET_ENDPOINTS({ projectName: action.projectName })),
                        catchError(_ => of(END_ACTION()))
                    )
            }
        }),
        share()
    ))

    deleteEndpoint$ = createEffect(() => this.action$.pipe(
        ofType(DELETE_ENDPOINT),
        concatMap((action: DeleteEndpointAction) => {
            return this.endpointManager.deleteProjectEndpoint(action.projectName, action.id)
                .pipe(
                    map(_ => GET_ENDPOINTS({ projectName: action.projectName})),
                    catchError(_ => of(END_ACTION()))
                )
        })
    ))

    exportEndpoints$ = createEffect(() => this.action$.pipe(
        ofType(EXPORT_ENDPOINT),
        map((action: ExportEndpointAction) => {
            this.endpointManager.exportEndpoints(action.projectName)
            return END_ACTION();
        })
    ))

    importEndpoint$ = createEffect(() => this.action$.pipe(
        ofType(IMPORT_ENDPOINT),
        concatMap((action: ImportEndpointsAction) => {
            return this.endpointManager.importEndpoints(action.file, action.projectName).pipe(
                map(_ => GET_ENDPOINTS({ projectName: action.projectName })),
                catchError(_ => of(END_ACTION()))
            )
        })
    ))
}