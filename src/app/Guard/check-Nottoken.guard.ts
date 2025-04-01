import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class checkNotTokenGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(): boolean {
    const token = localStorage.getItem('token');

    // Si l'utilisateur est connecté, redirigez-le vers le tableau de bord
    if (token && token.length > 0) {
      this.router.navigate(['dashboard']);
      return false;
    }

    // Sinon, permettez l'accès à la page (login)
    return true;
  }
}