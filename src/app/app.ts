import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';

import { AppHeader } from './components/app-header/app-header';
import { UserService } from './services/user-service';
import { AuthService } from './services/auth-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeader],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {
    this.checkAuthentication();
  }

  private checkAuthentication(): void {
    if (!this.authService.getAccessToken() &&
        !this.authService.getRefreshToken()) {
      this.authService.clearStorageData();
      return;
    }

    this.userService.checkCurrentUser().subscribe({
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.authService.clearStorageData();
        }
      }
    });
  }

}
