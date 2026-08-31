import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { UserService } from '../../services/user-service';
import { GuestProgressService } from '../../services/guest-progress-service';
import { SyncSolvedTasksRequest } from '../../models/sync-solved-tasks'
import { RegisterUserRequest } from '../../models/register'

@Component({
  selector: 'app-register-dialog',
  imports: [FormsModule],
  templateUrl: './register-dialog.html',
  styleUrl: '../dialogs.css',
})
export class RegisterDialog {

  @ViewChild('dialog')
  dialog!: ElementRef<HTMLDialogElement>;

  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly guestProgressService = inject(GuestProgressService);

  registerRequest: RegisterUserRequest = this.createEmptyRegisterRequest();
  registerError: string | null = null;
  repeatPassword: string = '';

  usernameAvailable: boolean | null = null;
  checkingUsername = false;
  private usernameCheckTimeout?: ReturnType<typeof setTimeout>;

  open(): void {
    this.dialog.nativeElement.showModal();
  }

  close(): void {
    this.registerRequest = this.createEmptyRegisterRequest();
    this.repeatPassword = '';
    this.registerError = null;
    this.usernameAvailable = null;
    this.checkingUsername = false;

    if (this.usernameCheckTimeout) {
      clearTimeout(this.usernameCheckTimeout);
      this.usernameCheckTimeout = undefined;
    }
    this.dialog.nativeElement.close();
  }

  createEmptyRegisterRequest(): RegisterUserRequest {
    return {
      username: '',
      password: ''
    };
  }

  sendRegisterRequest(): void {
    this.registerError = null;

    this.userService.register(this.registerRequest).subscribe({
      next: response => {
        this.syncSolvedTasks();
      },
      error: error => {
        this.registerError = 'Register error. Please try again.';
      }
    });
  }

  onUsernameChange(username: string): void {
    this.usernameAvailable = null;

    if (this.usernameCheckTimeout) {
      clearTimeout(this.usernameCheckTimeout);
    }

    if (username.length < 3) {
      return;
    }

    this.usernameCheckTimeout = setTimeout(() => {
      this.checkingUsername = true;

      this.userService.isUsernameAvailable(username).subscribe({
        next: available => {
          this.usernameAvailable = available;
          this.checkingUsername = false;
        },
        error: () => {
          this.usernameAvailable = null;
          this.checkingUsername = false;
        }
      });
    }, 400);
  }

  syncSolvedTasks() {
    const solvedTasks = this.guestProgressService.getSolvedTasks();
    if (solvedTasks.size === 0) {
      this.close();
      return;
    }
    const request: SyncSolvedTasksRequest = {
      taskIds: [...solvedTasks]
    };
    this.userService.syncSolvedTasks(request).subscribe({
      next: () => {
        this.guestProgressService.clearSolvedTasks();
        this.close();
      },
      error: error => {
        this.authService.clearStorageData();
        this.registerError = 'Error syncing solved tasks. Your account was created successfully. Use Login button to log in.';
      }
    });
  }

}
