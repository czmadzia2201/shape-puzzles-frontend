import { Component, inject } from '@angular/core';

import { AuthService } from '../../services/auth-service';
import { LoginDialog } from '../../modals/login-dialog/login-dialog';
import { LogoutDialog } from '../../modals/logout-dialog/logout-dialog';
import { UnregisterDialog } from '../../modals/unregister-dialog/unregister-dialog';
import { RegisterDialog } from '../../modals/register-dialog/register-dialog';

@Component({
  selector: 'app-header',
  imports: [LoginDialog, LogoutDialog, UnregisterDialog, RegisterDialog],
  templateUrl: './app-header.html',
  styleUrl: './app-header.css',
})
export class AppHeader {

  private readonly authService = inject(AuthService);

  username = this.authService.username;

}
