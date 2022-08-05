import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProjectsComponent } from './components/projects/projects.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ProjectDetailsComponent } from './components/project-details/project-details.component';
import { EditEndpointComponent } from './components/edit-endpoint/edit-endpoint.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectivesModule } from './directives/directives.module';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { MaterialModule } from './material.module';
import { StoreModule } from '@ngrx/store';
import { endpointsReducer } from './app-state/endpoints/endpoints.reducer';
import { EffectsModule } from '@ngrx/effects';
import { EndpointsEffects } from './app-state/endpoints/endpoints.effects';
import { DeleteDialogComponent } from './components/delete-dialog/delete-dialog.component';
import { Features } from './app-state/models/app-state';
import { projectsReducer } from './app-state/projects/projects.reducer';
import { ProjectsEffects } from './app-state/projects/projects.effects';
import { NewProjectComponent } from './components/new-project/new-project.component';


@NgModule({
  declarations: [
    AppComponent,
    ProjectsComponent,
    ProjectDetailsComponent,
    EditEndpointComponent,
    DeleteDialogComponent,
    NewProjectComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    DirectivesModule,
    NgJsonEditorModule,
    StoreModule.forRoot({
      [Features.ENDPOINTS]: endpointsReducer,
      [Features.PROJECTS]: projectsReducer
    }),
    EffectsModule.forRoot([
      EndpointsEffects,
      ProjectsEffects
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
