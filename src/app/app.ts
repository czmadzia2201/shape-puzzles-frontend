import { Component, signal } from '@angular/core';
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
  protected readonly title = signal('shape-puzzles-frontend');

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
      error: () => {
        // do nothing, we just need 401 for the interceptor to do its part
      }
    });
  }

}
