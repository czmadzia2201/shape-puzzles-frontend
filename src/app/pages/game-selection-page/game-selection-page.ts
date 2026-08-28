import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameService } from '../../services/game-service';
import { GameTypeSummary } from '../../models/game-type';
import { AboutDialog } from '../../modals/about-dialog/about-dialog'

@Component({
  selector: 'app-game-selection-page',
  imports: [RouterLink, AboutDialog],
  templateUrl: './game-selection-page.html',
  styleUrl: './game-selection-page.css',
})
export class GameSelectionPage {

  private readonly gameService = inject(GameService);

  gameTypes: GameTypeSummary[] | null = null;

  ngOnInit(): void {
    this.gameService.getGameTypes().subscribe(response => {
      this.gameTypes = response;
    });
  }

}
