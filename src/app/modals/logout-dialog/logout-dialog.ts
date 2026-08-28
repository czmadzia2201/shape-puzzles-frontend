import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-logout-dialog',
  imports: [],
  templateUrl: './logout-dialog.html',
  styleUrl: '../dialogs.css',
})
export class LogoutDialog {

  @ViewChild('dialog')
  dialog!: ElementRef<HTMLDialogElement>;

  private readonly authService = inject(AuthService);

  open(): void {
    this.dialog.nativeElement.showModal();
  }

  close(): void {
    this.dialog.nativeElement.close();
  }

  logout(): void {
    this.authService.clearStorageData();
    this.close();
  }

}
