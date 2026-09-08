import { Component, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth-service';
import { GameService } from '../../services/game-service';
import { UserService } from '../../services/user-service';
import { GuestProgressService } from '../../services/guest-progress-service';
import { PuzzleBoard } from '../../components/puzzle-board/puzzle-board'

import { GameType } from '../../models/game-type';
import { Task } from '../../models/task';

@Component({
  selector: 'app-game-page',
  imports: [RouterLink, PuzzleBoard],
  templateUrl: './game-page.html',
  styleUrl: './game-page.css',
})
export class GamePage {
  private route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly gameService = inject(GameService);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly guestProgressService = inject(GuestProgressService);

  gameTypeName: string | null = null;
  gameType: GameType | null = null;
  errorMessage: string | null = null;
  username = this.authService.username;
  solvedTaskIds = new Set<string>();
  taskFinished = false;

  constructor() {
    effect(() => {
      const username = this.username();
      if (!username && this.gameType) {
        this.loadSolvedTasks();
      }
    });
  }

  ngOnInit(): void {
    this.userService.solvedTasksChanged$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadSolvedTasks());

    this.gameTypeName = this.route.snapshot.paramMap.get('name');
    if (this.gameTypeName) {
      this.gameService.getGameType(this.gameTypeName).subscribe({
        next: response => {
          this.gameType = response;
          this.loadSolvedTasks();
        },
        error: error => {
          this.errorMessage = error.error.message;
        }
      });
    }
  }

  markAsSolved(selectedTask: Task): void {
    this.userService.validateAndSaveSolution(selectedTask.id).subscribe(response =>{
      if (response && !this.solvedTaskIds.has(selectedTask.id)) {
        this.solvedTaskIds = new Set(this.solvedTaskIds);
        this.solvedTaskIds.add(selectedTask.id);
        this.taskFinished = true;
      }
      if (response && !this.username()) {
        this.guestProgressService.addToSolvedTasks(selectedTask.id);
        this.taskFinished = true;
      }
    });
  }

  startTask(): void {
    this.taskFinished = false;
  }

  private loadSolvedTasks(): void {
    if (!this.gameTypeName) {
      this.solvedTaskIds = new Set<string>();
      return;
    }

    if (!this.username()) {
      if (this.gameType) {
        const allSolvedTaskIds = this.guestProgressService.getSolvedTasks();

        this.solvedTaskIds = new Set(
          this.gameType.tasks
            .filter(task => allSolvedTaskIds.has(task.id))
            .map(task => task.id)
        );
      }
      return;
    }

    this.userService.findUserSolvedTasks(this.gameTypeName).subscribe(response => {
      this.solvedTaskIds = new Set(response.map(task => task.id));
    });

  }

}
