import { Component, DestroyRef, effect, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth-service';
import { GameService } from '../../services/game-service';
import { UserService } from '../../services/user-service';
import { GuestProgressService } from '../../services/guest-progress-service';
import { PuzzleBoard } from '../../components/puzzle-board/puzzle-board'

import { GameType } from '../../models/game-type';
import { Task } from '../../models/task';
import { VerifySolutionRequest } from '../../models/verify-solution-request';
import { SolutionResultMessages, SOLUTION_CORRECT, SOLUTION_INCORRECT } from '../../models/solution-result';

import { SolutionResultDialog } from '../../modals/solution-result-dialog/solution-result-dialog';

@Component({
  selector: 'app-game-page',
  imports: [RouterLink, PuzzleBoard, SolutionResultDialog],
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
  solutionResultMessages: SolutionResultMessages | null = null;

  @ViewChild('solutionResultDialog')
  solutionResultDialog!: SolutionResultDialog;

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

  verifyAndSaveSolution(request: VerifySolutionRequest): void {
    this.userService.validateAndSaveSolution(request).subscribe(response =>{
      if (response) {
        if (!this.solvedTaskIds.has(request.taskId)) {
          this.solvedTaskIds = new Set(this.solvedTaskIds);
          this.solvedTaskIds.add(request.taskId);
        }
        if (!this.username()) {
          this.guestProgressService.addToSolvedTasks(request.taskId);
        }
          this.taskFinished = true;
          this.solutionResultMessages = SOLUTION_CORRECT;
      } else {
        this.solutionResultMessages = SOLUTION_INCORRECT;
      }
      this.solutionResultDialog.open();
    });
  }

  startTask(): void {
    this.taskFinished = false;
    this.solutionResultMessages = null;
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
