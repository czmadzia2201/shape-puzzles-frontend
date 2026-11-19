import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GameType, GameTypeSummary } from '../models/game-type';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GameService {

  private readonly apiUrl = environment.apiUrl + '/game-types';

  constructor(private readonly http: HttpClient) {}

  getGameTypes(): Observable<GameTypeSummary[]> {
    return this.http.get<GameTypeSummary[]>(this.apiUrl);
  }

  getGameType(gameTypeName: string): Observable<GameType> {
    return this.http.get<GameType>(`${this.apiUrl}/${gameTypeName}`);
  }

}
