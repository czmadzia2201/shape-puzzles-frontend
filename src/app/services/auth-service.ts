import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { LoginRequest, LoginResponse } from '../models/login';
import { RefreshRequest, RefreshResponse } from '../models/refresh';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  readonly username = signal<string | null>(
    localStorage.getItem('username')
  );

  private readonly apiUrl = 'http://localhost:8080/shape-puzzles/auth';

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
     tap(response => {
       localStorage.setItem('accessToken', response.accessToken);
       localStorage.setItem('refreshToken', response.refreshToken);
       this.setLoggedInUser(request.username);
     })
    );
  }

  refresh(request: RefreshRequest): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(`${this.apiUrl}/refresh`, request).pipe(
     tap(response => {
       localStorage.setItem('accessToken', response.accessToken);
     })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearStorageData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    this.username.set(null);
  }

  setLoggedInUser(username: string): void {
    localStorage.setItem('username', username);
    this.username.set(username);
  }

}
