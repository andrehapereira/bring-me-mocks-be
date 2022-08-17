import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { BehaviorSubject, defer } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ProjectManagerService {

  constructor(private http: HttpClient) { }

  getProjects() {
    return this.http.get<string[]>(`${environment.apiRoot}/projects`, { observe: 'body' });
  }

  createProject(projectName: string) {
    return this.http.post(`${environment.apiRoot}/projects/create-project`, { projectName } ,{ observe: 'body' });
  }

  deleteProject(projectName: string) {
    return this.http.delete(`${environment.apiRoot}/projects/delete-project/${projectName}`,{ observe: 'body' });
  }

  exportAllProjects() {
    window.open(`${environment.apiRoot}/projects/export-all`, '_self')
  }

  importProjects(file: File) {
    return defer(() => file.arrayBuffer()).pipe(
      map(buffer => this.arrayBufferToBase64(buffer)),
      switchMap(b64file => {
        return this.http.post(`${environment.apiRoot}/projects/import-project`, { data: b64file }, { observe: 'body'});
      })
    )
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

}
