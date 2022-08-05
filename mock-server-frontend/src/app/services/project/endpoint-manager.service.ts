import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { BehaviorSubject } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
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
