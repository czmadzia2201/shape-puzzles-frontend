import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GameType, GameTypeSummary } from '../models/game-type';

@Injectable({
  providedIn: 'root',
})
export class GameService {

  private readonly apiUrl = 'http://localhost:8080/shape-puzzles/game-types';

  constructor(private readonly http: HttpClient) {}

  getGameTypes(): Observable<GameTypeSummary[]> {
    return this.http.get<GameTypeSummary[]>(this.apiUrl);
  }

  getGameType(gameTypeName: string): Observable<GameType> {
    return this.http.get<GameType>(`${this.apiUrl}/${gameTypeName}`);
  }

}
