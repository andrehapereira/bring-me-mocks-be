import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ProjectManagerService } from 'src/app/services/project/project-manager.service';
import { takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { hasProjectsError, isGettingProjects, noProjects, projectsList } from 'src/app/app-state/projects/projects.selectors';
import { DELETE_PROJECT, EXPORT_PROJECTS, GET_PROJECTS, IMPORT_PROJECTS } from 'src/app/app-state/projects/projects.actions';
import { MatDialog } from '@angular/material/dialog';
import { NewProjectComponent } from '../new-project/new-project.component';
import { Subject } from 'rxjs';
import { ProjectsEffects } from 'src/app/app-state/projects/projects.effects';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'fe-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  @ViewChild('uploadBtn', { static: true, read: ElementRef })
  uploadBtn: ElementRef;

  loading$ = this.store.pipe(select(isGettingProjects));
  error$ = this.store.pipe(select(hasProjectsError));
  isEmpty$ = this.store.pipe(select(noProjects));

  projects$ = this.store.pipe(select(projectsList));

  constructor(
    public dialog: MatDialog,
    private router: Router, 
    private route: ActivatedRoute,
    private store: Store,
  ) { }

  ngOnInit(): void {
    this.getProjects()
  }

  addNewProject() {
    this.dialog.open(NewProjectComponent, {
      disableClose: true,
      minWidth: 500
    })
  }

  exportAll() {
    this.store.dispatch(EXPORT_PROJECTS())
  }

  import() {
    this.uploadBtn?.nativeElement.click();
  }

  onFileUpload() {
    const file: File = this.uploadBtn.nativeElement.files?.item(0);
    if (file) {
      this.store.dispatch(IMPORT_PROJECTS({ file }))
    }
    this.uploadBtn.nativeElement.value = '';
  }

  private getProjects() {
    this.store.dispatch(GET_PROJECTS())
  }

  public onDeleteProject(project: string) {
    const dialogClose$ = new Subject();
    const ref = this.dialog.open(DeleteDialogComponent, {
      disableClose: true,
      minWidth: 300
    })

    ref.afterClosed()
    .pipe(
      takeUntil(dialogClose$)
    )
    .subscribe(result => {
      if (result) {
        this.store.dispatch(DELETE_PROJECT({ projectName: project }))
      }
      dialogClose$.next();
      dialogClose$.complete();
    })
  }

  public onSelectingProject(project: string) {
    this.router.navigate([project], { relativeTo: this.route });
  }


}
