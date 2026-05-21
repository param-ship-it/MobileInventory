import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'inv_token';
  private readonly USER_KEY  = 'inv_user';
  private userSubject = new BehaviorSubject<User | null>(this.storedUser);

  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get storedUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  get token(): string | null { return localStorage.getItem(this.TOKEN_KEY); }

  get currentUser(): User | null { return this.userSubject.value; }

  isLoggedIn(): boolean { return !!this.token; }

  hasRole(...roles: string[]): boolean {
    return roles.includes(this.currentUser?.role ?? '');
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        this.userSubject.next(res.user);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
