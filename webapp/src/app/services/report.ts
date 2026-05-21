import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private base = `${environment.apiUrl}/reports`;
  constructor(private http: HttpClient) {}

  getSummary(): Observable<any> {
    return this.http.get<any>(`${this.base}/summary`);
  }

  getAgingReport(days: number = 30): Observable<any> {
    return this.http.get<any>(`${this.base}/aging`, { params: { days: days.toString() } });
  }

  getByProgram(): Observable<any> {
    return this.http.get<any>(`${this.base}/by-program`);
  }
}
