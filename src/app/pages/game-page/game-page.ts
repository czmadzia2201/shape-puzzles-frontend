import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { GameService } from '../../services/game-service';
import { GameType } from '../../models/game-type';

@Component({
  selector: 'app-game-page',
  imports: [RouterLink],
  templateUrl: './game-page.html',
  styleUrl: './game-page.css',
})
export class GamePage {
  private route = inject(ActivatedRoute);
  private readonly gameService = inject(GameService);

  gameTypeName: string | null = null;
  gameType: GameType | null = null;

  ngOnInit(): void {
    this.gameTypeName = this.route.snapshot.paramMap.get('name');
    if (this.gameTypeName) {
      this.gameService.getGameType(this.gameTypeName).subscribe(response => {
        this.gameType = response;
      });
    }
  }




}
