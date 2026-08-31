import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import { RegisterUserRequest, RegisterUserResponse } from '../models/register';
import { SyncSolvedTasksRequest } from '../models/sync-solved-tasks';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private solvedTasksChanged = new Subject<void>();
  solvedTasksChanged$ = this.solvedTasksChanged.asObservable();

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

  validateAndSaveSolution(taskId: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/solved-tasks/${taskId}`, {});
  }

  findUserSolvedTasks(gameTypeName: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/me/solved-tasks/${gameTypeName}`);
  }

  syncSolvedTasks(request: SyncSolvedTasksRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/me/solved-tasks/sync`, request);
  }

  notifySolvedTasksChanged(): void {
    this.solvedTasksChanged.next();
  }

}
