import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-unregister-dialog',
  imports: [],
  templateUrl: './unregister-dialog.html',
  styleUrl: '../dialogs.css',
})
export class UnregisterDialog {

  @ViewChild('dialog')
  dialog!: ElementRef<HTMLDialogElement>;

  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);

  open(): void {
    this.dialog.nativeElement.showModal();
  }

  close(): void {
    this.dialog.nativeElement.close();
  }

  deleteAccount(): void {
    this.userService.deleteAccount().subscribe(() => {
      this.authService.clearStorageData();
      this.close();
    })
  }

}
