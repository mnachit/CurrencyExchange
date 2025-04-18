import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class checkTokenGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(): boolean {
    const token = localStorage.getItem('token');

    // Si l'utilisateur est connecté, permettez l'accès
    if (token && token.length > 0) {
      return true;
    }

    // Sinon, redirigez-le vers la page de login
    this.router.navigate(['login']);
    return false;
  }
}