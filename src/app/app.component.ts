// app.component.ts (avec service)
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isAuthenticated = false;
  isWelcomePage = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // S'abonner à l'état d'authentification
    this.authService.isAuthenticated().subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });

    // S'abonner aux changements de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.authService.checkAuthState();
      this.isWelcomePage = this.router.url === '/' || this.router.url === '';
    });
  }
}