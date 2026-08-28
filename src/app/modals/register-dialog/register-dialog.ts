import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user-service';
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

  private readonly userService = inject(UserService);

  registerRequest: RegisterUserRequest = this.createEmptyRegisterRequest();
  registerError: string | null = null;
  repeatPassword: string = '';

  open(): void {
    this.dialog.nativeElement.showModal();
  }

  close(): void {
    this.registerRequest = this.createEmptyRegisterRequest();
    this.registerError = null;
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
        this.close();
      },
      error: error => {
        this.registerError = 'Register error. Please try again.';
      }
    });
  }
}
