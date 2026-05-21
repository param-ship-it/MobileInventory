import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private base = `${environment.apiUrl}/devices`;
  constructor(private http: HttpClient) {}

  getDevices(params: any = {}): Observable<any> {
    let p = new HttpParams();
    Object.keys(params).forEach(k => { if (params[k]) p = p.set(k, params[k]); });
    return this.http.get<any>(this.base, { params: p });
  }

  getDevice(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/${id}`);
  }

  createDevice(data: any): Observable<any> {
    return this.http.post<any>(this.base, data);
  }

  updateDevice(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.base}/${id}`, data);
  }

  retireDevice(id: string): Observable<any> {
    return this.http.delete<any>(`${this.base}/${id}`);
  }

  // Assignments
  assignDevice(data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/assignments`, data);
  }

  returnDevice(assignmentId: number, notes?: string): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/assignments/${assignmentId}/return`, { notes });
  }

  getActiveAssignments(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/assignments`);
  }

  // Users search for assignment form
  searchUsers(q: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/users/search`, { params: { q } });
  }

  // Programs & Projects
  getPrograms(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/programs`);
  }

  getProjects(programId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/programs/${programId}/projects`);
  }
}
