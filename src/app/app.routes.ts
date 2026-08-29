import { Routes } from '@angular/router';
import { GamePage } from './pages/game-page/game-page';
import { GameSelectionPage } from './pages/game-selection-page/game-selection-page';
import { NotFoundPage } from './pages/not-found-page/not-found-page';

export const routes: Routes = [
  {
    path: '',
    component: GameSelectionPage
  },
  {
    path: ':name',
    component: GamePage
  },
  {
    path: '**',
    component: NotFoundPage
  }
];
