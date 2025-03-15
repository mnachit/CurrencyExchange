import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Bureau de Change Al Jazira';
  constructor(public authService: AuthService) {}
  login(): void {
    this.authService.Islogin();
  }
}
