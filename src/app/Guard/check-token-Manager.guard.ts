import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class checkTokenMangerGuard implements CanActivate {

  constructor(private router: Router, private tokenSerive: TokenService ) { }



  administrator: boolean = false;
  manager: boolean = false;
  role?: string;

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    this.role = this.tokenSerive.getRoleUserWithToken() ?? undefined;

    if (this.role === 'ADMIN') {
      this.administrator = true;
    } else if (this.role === 'MANAGER') {
      this.manager = true;
      this.administrator = true;
    }

    // Si l'utilisateur est connecté, permettez l'accès
    if (token && token.length > 0 && this.manager) {
      return true;
    }

    else if (this.role === 'MANAGER') {
        this.router.navigate(['dashboard']);
        return false;
    }

    if (this.role === 'NACHIT') {
      this.router.navigate(['welcome-admin']);
      return false;
    }

    // Sinon, redirigez-le vers la page de login
    this.router.navigate(['login']);
    return false;
  }
}