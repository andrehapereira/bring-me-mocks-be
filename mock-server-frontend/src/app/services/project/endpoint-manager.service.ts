import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { BehaviorSubject, defer } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { CreateEndpointPostBody, Endpoint } from './models/endpoints';

@Injectable({
  providedIn: 'root'
})
export class EndpointManagerService {

  constructor(private http: HttpClient) { }


  getProjectEndpoints(projectName: string) {
    if (!projectName) {
      throw new Error('Project Name is missing.')
    }
    return this.http.get(`${environment.apiRoot}/projects/${projectName}/endpoints`, {observe: 'body'})
      .pipe(
        map((endpoints: any[]) => {
          return this.endpointMapper(endpoints)
        }),
      )
  }

  createProjectEndpoint(projectName: string, body: CreateEndpointPostBody) {
    return this.http.post(`${environment.apiRoot}/projects/${projectName}/create-endpoint`, body, {observe: 'body'})
  }
  
  updateProjectEndpoint(projectName: string, body: CreateEndpointPostBody, id: string) {
    return this.http.put(`${environment.apiRoot}/projects/${projectName}/update-endpoint/${id}`, body, {observe: 'body'})
  }

  deleteProjectEndpoint(projectName: string, id: string) {
    return this.http.delete(`${environment.apiRoot}/projects/${projectName}/delete-endpoint/${id}`, { observe: 'body' })
  }

  importEndpoints(file: File, project: string) {
    return defer(() => file.arrayBuffer()).pipe(
      map(buffer => this.arrayBufferToBase64(buffer)),
      switchMap((base64: string) => {
        return this.http.post(`${environment.apiRoot}/projects/import-endpoints/${project}`, { data: base64 }, { observe: 'body'});
      })
    )
  }

  exportEndpoints(project: string) {
    window.open(`${environment.apiRoot}/projects/export-endpoints/${project}`, '_self')
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array( buffer );
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return `${window.btoa(binary)}`
    //return `data:${file.type};base64,${window.btoa(binary)}`
  }

  private endpointMapper(endpoints: any[]): Endpoint[] {
    let filteredEndpoints = endpoints;
    const grouped = [{
      serviceName: 'Others',
      items: filteredEndpoints.filter(item => !item.serviceName).map(item => ({
        ...item.mock,
        id: item.id
      }))
    }];
    filteredEndpoints = filteredEndpoints.filter(item => item.serviceName);

    const filter = (endpointToFilter) => {
      if (!endpointToFilter.length) {
        return;
      }
      const group = {
        serviceName: endpointToFilter[0].serviceName,
        items: endpointToFilter.filter(item => item.serviceName === endpointToFilter[0].serviceName).map(item => ({
          ...item.mock,
          id: item.id
        }))
      }
      grouped.push(group);
      filter(endpointToFilter.filter(item => item.serviceName !== endpointToFilter[0].serviceName));
    }
    filter(filteredEndpoints);
    return grouped.filter(group => group.items.length);
  }

}
