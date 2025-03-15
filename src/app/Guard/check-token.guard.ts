import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Location } from '@angular/common';

// import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class checkTokenGuard implements CanActivate {

  constructor(private router: Router, private location: Location) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');

    if (token && token.length > 0) {
      return true;
    } else {
      this.router.navigate(['login']); // Redirect to login page if token is not present
      return false; // Prevent navigation 
    }
  }
}