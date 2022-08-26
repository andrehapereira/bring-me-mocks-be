import { DEFAULT_DIALOG_CONFIG, DialogConfig, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { AfterViewInit, Component, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConnectorActions, CreateEndpointPostBody, EndpointItem, Methods, MocksItemResponse, Status, StatusAsArray } from 'src/app/services/project/models/endpoints';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { BehaviorSubject } from 'rxjs';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatTableDataSource } from '@angular/material/table';
import { v4 as id } from 'uuid';
import { EndpointManagerService } from 'src/app/services/project/endpoint-manager.service';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { GET_ENDPOINTS, SAVE_ENDPOINT_DATA } from 'src/app/app-state/endpoints/endpoints.actions';
import { EndpointsEffects } from 'src/app/app-state/endpoints/endpoints.effects';
import { endpointsList, isGettingEndpoints } from 'src/app/app-state/endpoints/endpoints.selectors';

interface EndpointForm {
  urlPattern: FormControl,
  serviceName: FormControl,
  statusToReturn: FormControl,
  method: FormControl,
  headers: FormArray<FormGroup>,
  connector: FormGroup<{ action: FormControl, target: FormControl, by: FormControl}>
  [key: string]: FormControl | FormArray | FormGroup
}

@Component({
  selector: 'fe-edit-endpoint',
  templateUrl: './edit-endpoint.component.html',
  styleUrls: ['./edit-endpoint.component.scss'],
  providers: [
    DialogConfig
  
  ]
})
export class EditEndpointComponent implements OnInit {

  @ViewChild(JsonEditorComponent)
  jsonEditor!: JsonEditorComponent
  jsonEditorOpts = new JsonEditorOptions();

  connectorPanelOpen = false;

  connectorActions = [
    {
      action: ConnectorActions.SEARCH,
      label: 'Search in'
    },  
    {
      action: ConnectorActions.GET,
      label: 'Get from'
    },
    {
      action: ConnectorActions.ADD,
      label: 'Add to'
    },
    {
      action: ConnectorActions.DELETE,
      label: 'Remove from'
    },
    {
      action: ConnectorActions.UPDATE,
      label: 'Update'
    }
  ];

  form = this.fb.group<EndpointForm>({
    urlPattern: this.fb.control('', [Validators.required]),
    serviceName: this.fb.control('', [Validators.required]),
    statusToReturn: this.fb.control(Status.INTERNAL_SERVER_ERROR, [Validators.required]),
    method: this.fb.control('', [Validators.required]),
    headers: this.fb.array<FormGroup>([]),
    connector: this.fb.group({
      action: this.fb.control(null),
      target: this.fb.control(null),
      by: this.fb.control(null)
    })
  })

  headerTable = [
    {
      columnDef: 'header',
      header: 'Header',
      control: (element: FormGroup) => element.get("header"),
    },
    {
      columnDef: 'value',
      header: 'Value',
      control: (element: FormGroup) => element.get("value"),
    },
    {
      columnDef: 'delete',
      header: '',
    },
  ]

  displayedColumns = this.headerTable.map(c => c.columnDef);

  dataSource = new MatTableDataSource(this.headersFormArray.controls)

  activeJSONCtrl$ = new BehaviorSubject<any>(null);

  endpoint: EndpointItem;
  endpoints$ = this.store.pipe(
    select(endpointsList), 
    map(endpoints => endpoints.map(endpoint => endpoint.items)),
    map((endpoints: Array<EndpointItem[]>) => (endpoints as any).flat()),
  );
  serviceName: string;
  project: string;

  loading$ = this.store.pipe(select(isGettingEndpoints));

  constructor(
    @Inject(DIALOG_DATA) public data: { endpoint: EndpointItem, serviceName: string, method: 'NEW' | 'EDIT', project: string },
    public dialogRef: DialogRef<string>,
    private fb: FormBuilder,
    private store: Store,
    private endpointEffects: EndpointsEffects
  ) {
    this.project = data.project;
    if (data.method === 'NEW') {
      this.serviceName = '';
      this.endpoint = {
        id: '',
        urlPattern: '',
        statusToReturn: 500,
        method: '',
        responses: []
      }
      return;
    }
    this.endpoint = data.endpoint;
    this.serviceName = data.serviceName;
   }

  ngOnInit(): void {
    this.patchEndpointToForm();
    this.setupEditorOptions();
    this.endpointEffects.saveEndpoint$.pipe(
      tap(_ => {
        this.onClose()
      })
    )
    .subscribe();
  }

  connectorActionLabel() {
    return this.connectorActions.find(item => item.action === this.form.value.connector.action)?.label;
  }
  
  connectorUrlPattern() {
    return this.endpoints$.pipe(map(endpoints => endpoints.find(endpoint => endpoint.id === this.form.value.connector.target)?.urlPattern));
  }

  hasConnector() {
    return this.form.value.connector.action && this.form.value.connector.target;
  }

  connectorRequiresProperty() {
    return this.form.value.connector && (this.form.value.connector.action === ConnectorActions.DELETE || this.form.value.connector.action === ConnectorActions.UPDATE || this.form.value.connector.action === ConnectorActions.GET || this.form.value.connector.action === ConnectorActions.SEARCH);
  }

  onClose() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const body = this.formToEndpointPostBody();
    this.store.dispatch(SAVE_ENDPOINT_DATA({ body, projectName: this.project }));
  }

  patchEndpointToForm() {
    StatusAsArray.forEach(status => {
      const statusResponse = this.endpoint.responses.find(r => r.status === status)?.body;
      const fallbackResponse = { message: 'No response provided yet.'};
      const control = this.fb.control(statusResponse || fallbackResponse);
      this.form.addControl(status + '', control)
    })
    const headers = Object.entries(this.endpoint.headers || {})?.map(item => ({header: item[0], value: item[1]}));
    headers.forEach(_ => {
      this.headersFormArray.push(this.generateHeaderGroup());
    })
    this.form.patchValue({
      urlPattern: this.endpoint.urlPattern,
      serviceName: this.serviceName,
      method: this.endpoint.method,
      connector: this.endpoint.connector,
      statusToReturn: this.endpoint.statusToReturn || Status.INTERNAL_SERVER_ERROR,
      headers
    });

    this.activeJSONCtrl$.next(this.form.get('200'));
  }

  getAvailableStatus() {
    return StatusAsArray;
  }

  getMethods() {
    return Methods;
  }

  private setupEditorOptions() {
    this.jsonEditorOpts.mode = 'code';
    this.jsonEditorOpts.modes = [];
    this.jsonEditorOpts.statusBar = false;
    this.jsonEditorOpts.enableSort = false;
    this.jsonEditorOpts.indentation = 4;
    this.jsonEditorOpts.enableTransform = false;
  }


  onTabChange(data: MatTabChangeEvent){
    const label = data.tab.textLabel + '';
    this.activeJSONCtrl$.next(this.form.get(label));
  }

  onAddHeader() {
    this.headersFormArray.push(this.generateHeaderGroup());
    this.dataSource.data = this.headersFormArray.controls;
  }

  onDeleteHeader(index: number) {
    this.headersFormArray.removeAt(index);
    this.dataSource.data = this.headersFormArray.controls;
  }

  private generateHeaderGroup() {
    return this.fb.group({ 
      header: this.fb.control('', [Validators.required]), 
      value: this.fb.control('', [Validators.required])
    })
  }

  get hasJSONError() {
    return !!this.jsonEditor.getEditor().lastSchemaErrors.length;
  }

  get headersFormArray() {
    return this.form.get("headers") as FormArray
  }

  get headers() {
    return this.form.get("headers").value;
  }

  invalidCtrl(control: AbstractControl) {
    return control.invalid && control.touched;
  }

  private formToEndpointPostBody(): CreateEndpointPostBody {
    const formValue = this.form.value;
    const headers = this.toHeaderObj(formValue.headers);
    return {
      id: this.endpoint.id,
      serviceName: formValue.serviceName,
      mock: {
        urlPattern: formValue.urlPattern,
        statusToReturn: formValue.statusToReturn,
        method: formValue.method,
        responses: this.statusToMocksItemResponse(),
        connector: formValue.connector as any,
        ...(headers && { headers })
      }
    }
  }

  private statusToMocksItemResponse(): MocksItemResponse<any>[] {
    return StatusAsArray.map(status => ({
      status,
      body: this.form.get(status +'').value
    }))
  }

  private toHeaderObj(headers: any[]): { [key: string]: string } | null {
    let headersAsObj = {};
    headers.map(header => {
      return ({ [header.header]: header.value });
    }).forEach(h => headersAsObj = { ...headersAsObj, ...h})
    return !!Object.keys(headersAsObj).length ? headersAsObj : null;
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

}
