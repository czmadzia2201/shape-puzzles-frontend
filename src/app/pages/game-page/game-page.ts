import { Component, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth-service';
import { GameService } from '../../services/game-service';
import { UserService } from '../../services/user-service';
import { GuestProgressService } from '../../services/guest-progress-service';

import { GameType } from '../../models/game-type';
import { Task } from '../../models/task';

@Component({
  selector: 'app-game-page',
  imports: [RouterLink],
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
  selectedTask: Task | null = null;
  username = this.authService.username;
  solvedTasks: Task[] = [];

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

  setSelectedTask(task: Task): void {
    this.selectedTask = task;
  }

  isUserSolvedTask(task: Task): boolean {
    return this.solvedTasks.some(solvedTask => solvedTask.id === task.id);
  }

  markAsSolved(): void {
    if (!this.selectedTask) {
      return;
    }
    this.userService.validateAndSaveSolution(this.selectedTask.id).subscribe(response =>{
      if (response && !this.isUserSolvedTask(this.selectedTask!)) {
        this.solvedTasks.push(this.selectedTask!);
      }
      if (response && !this.username()) {
        this.guestProgressService.addToSolvedTasks(this.selectedTask!.id);
      }
    });
  }

  private loadSolvedTasks(): void {
    if (!this.gameTypeName) {
      this.solvedTasks = [];
      return;
    }

    if (!this.username()) {
      if (this.gameType) {
        const allSolvedTaskIds = this.guestProgressService.getSolvedTasks();
        this.solvedTasks = this.gameType.tasks
          .filter(task => allSolvedTaskIds.has(task.id));
      }
      return;
    }

    this.userService.findUserSolvedTasks(this.gameTypeName).subscribe(response => {
      this.solvedTasks = response;
    });

  }

}
