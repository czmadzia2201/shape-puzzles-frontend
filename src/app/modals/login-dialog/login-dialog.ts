import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { UserService } from '../../services/user-service';
import { GuestProgressService } from '../../services/guest-progress-service';
import { SyncSolvedTasksRequest } from '../../models/sync-solved-tasks'
import { LoginRequest } from '../../models/login'

@Component({
  selector: 'app-login-dialog',
  imports: [FormsModule],
  templateUrl: './login-dialog.html',
  styleUrl: '../dialogs.css',
})
export class LoginDialog {

  @ViewChild('dialog')
  dialog!: ElementRef<HTMLDialogElement>;

  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly guestProgressService = inject(GuestProgressService);

  loginRequest: LoginRequest = this.createEmptyLoginRequest();
  loginError: string | null = null;

  open(): void {
    this.dialog.nativeElement.showModal();
  }

  close(): void {
    this.loginRequest = this.createEmptyLoginRequest();
    this.loginError = null;
    this.dialog.nativeElement.close();
  }

  createEmptyLoginRequest(): LoginRequest {
    return {
      username: '',
      password: ''
    };
  }

  sendLoginRequest(): void {
    this.loginError = null;

    this.authService.login(this.loginRequest).subscribe({
      next: response => {
        this.syncSolvedTasks();
        this.close();
      },
      error: error => {
        this.loginError = 'Invalid username or password.';
      }
    });
  }

  syncSolvedTasks() {
    const solvedTasks = this.guestProgressService.getSolvedTasks();
    if (solvedTasks.size > 0) {
      const request: SyncSolvedTasksRequest = {
        taskIds: [...solvedTasks]
      };
      this.userService.syncSolvedTasks(request).subscribe(() => {
        this.guestProgressService.clearSolvedTasks();
      });
    }
  }

}
