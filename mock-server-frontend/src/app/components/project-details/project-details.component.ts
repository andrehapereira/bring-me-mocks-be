import { ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Subject } from 'rxjs';
import { map, reduce, takeUntil, tap } from 'rxjs/operators';
import { DELETE_ENDPOINT, EXPORT_ENDPOINT, GET_ENDPOINTS, IMPORT_ENDPOINT } from 'src/app/app-state/endpoints/endpoints.actions';
import { endpointsList, isGettingEndpoints, noEndpoints } from 'src/app/app-state/endpoints/endpoints.selectors';
import { EndpointItem } from 'src/app/services/project/models/endpoints';
import { EndpointManagerService } from '../../services/project/endpoint-manager.service';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { EditEndpointComponent } from '../edit-endpoint/edit-endpoint.component';

@Component({
  selector: 'fe-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss']
})
export class ProjectDetailsComponent implements OnInit, OnDestroy {

  @ViewChild('uploadEndpointBtn', { static: false, read: ElementRef })
  uploadBtn: ElementRef;

  project = '';

  endpointGroups = this.store.pipe(select(endpointsList));

  isEmpty$ = this.store.pipe(select(noEndpoints));

  isLoading$ = this.store.pipe(select(isGettingEndpoints));

  selectedEndpoint$ = new BehaviorSubject<EndpointItem | null>(null);

  destroy$ = new Subject<void>();

  constructor(
    private router: Router, 
    private route: ActivatedRoute, 
    public dialog: MatDialog,
    private store: Store
  ) { }

  ngOnInit(): void {
    this.project = this.route.snapshot.params?.projectName || '';
    this.store.dispatch(GET_ENDPOINTS({ projectName: this.project }))
  }

  btnClass(method: string) {
    switch(method) {
      case 'GET':
        return 'bg-success';
      case 'POST':
        return 'bg-warning';
      case 'PUT':
        return 'bg-info';
      case 'DELETE':
        return 'bg-danger';
      default:
        return 'bg-success';
    }
  }

  onGoBack() {
    this.router.navigate(['..']);
  }

  onSelectEndpoint(endpoint: EndpointItem | null, serviceName: string) {
    const dialogClosed$ = new Subject();

    this.selectedEndpoint$.next(endpoint);
    const dialogRef = this.dialog.open(EditEndpointComponent, {
      disableClose: true,
      minWidth: 750,
      data: {
        endpoint,
        serviceName,
        method: 'EDIT',
        project: this.project
      }
    });
    dialogRef.afterClosed()
      .pipe(
        takeUntil(dialogClosed$)
      ).subscribe(result => {
        this.selectedEndpoint$.next(null);
        dialogClosed$.next();
        dialogClosed$.complete();
      })
  }

  addNewEndpoint() {
    const dialogClosed$ = new Subject();
    const ref = this.dialog.open(EditEndpointComponent, {
      disableClose: true,
      minWidth: 750,
      data: {
        method: 'NEW',
        project: this.project
      }
    });
    ref.afterClosed()
      .pipe(
        takeUntil(dialogClosed$)
      ).subscribe(result => {
        dialogClosed$.next();
        dialogClosed$.complete();
      })
  }

  onDelete(id: string) {
    const dialogClosed$ = new Subject();
    const ref = this.dialog.open(DeleteDialogComponent, {
      disableClose: true,
      minWidth: 300,
    });
    ref.afterClosed()
      .pipe(
        takeUntil(dialogClosed$)
      ).subscribe(result => {
        if (result) {
          this.store.dispatch(DELETE_ENDPOINT({ projectName: this.project, id }))
        }
      })
  }

  importEndpoints() {
    this.uploadBtn?.nativeElement.click();
  }

  exportEndpoints() {
    this.store.dispatch(EXPORT_ENDPOINT({ projectName: this.project }));
  }

  onFileUpload() {
    const file: File = this.uploadBtn.nativeElement.files?.item(0);
    if (file) {
      this.store.dispatch(IMPORT_ENDPOINT({ file, projectName: this.project }))
    }
    this.uploadBtn.nativeElement.value = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
