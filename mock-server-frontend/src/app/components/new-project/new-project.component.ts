import { DialogRef } from '@angular/cdk/dialog';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { ProjectsEffects } from 'src/app/app-state/projects/projects.effects';
import { isGettingProjects } from 'src/app/app-state/projects/projects.selectors';
import { tap } from 'rxjs/operators'
import { CREATE_PROJECT } from 'src/app/app-state/projects/projects.actions';

@Component({
  selector: 'fe-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.scss']
})
export class NewProjectComponent implements OnInit {

  form = this.fb.group({
    projectName: this.fb.control('', [Validators.required, Validators.pattern('^[A-Za-z-]*$')])
  });
  loading$ = this.store.pipe(select(isGettingProjects));

  constructor(
    private fb: FormBuilder,
    public dialogRef: DialogRef<string>,
    private store: Store,
    private projectsEffects: ProjectsEffects
  ) { }

  ngOnInit(): void {
    this.projectsEffects.createProject$
      .pipe(
        tap(_ => this.onClose())
      ).subscribe();
  }

  onClose() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.dispatch(CREATE_PROJECT({ projectName: this.form.value.projectName }))
  }

  invalidCtrl(control: AbstractControl) {
    return control.invalid && control.touched;
  }

}
