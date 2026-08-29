import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { RegisterUserRequest, RegisterUserResponse } from '../models/register';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private readonly apiUrl = 'http://localhost:8080/shape-puzzles/users';

  constructor(private readonly http: HttpClient) {}

  register(request: RegisterUserRequest): Observable<RegisterUserResponse> {
    return this.http.post<RegisterUserResponse>(this.apiUrl,
      request
    );
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/me`);
  }

  checkCurrentUser(): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/me`);
  }

  isUsernameAvailable(username: string): Observable<boolean> {
    const params = new HttpParams().set('username', username);
    return this.http.get<boolean>(this.apiUrl, { params });
  }

}
