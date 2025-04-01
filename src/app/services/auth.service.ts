
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/funds.mode';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/rest/auth/';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  
  constructor(private http : HttpClient) {}
  
  // Vérifier si l'utilisateur est authentifié
  public isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }
  
  // Mettre à jour l'état d'authentification
  public checkAuthState(): void {
    this.isAuthenticatedSubject.next(this.hasToken());
  }
  
  // Vérifier si un token existe
  private hasToken(): boolean {
    const token = localStorage.getItem('token');
    return !!token && token.length > 0;
  }

  login1(user : User): Observable<{ message: string, result: any, errors: string, errorMap: string[] }> {
    return this.http.post<{ message: string, result: any, errors: string, errorMap: string[]}>(this.apiUrl + 'login', user);
  }
  
  // Méthode de déconnexion
  public logout(): void {
    localStorage.removeItem('token');
    this.isAuthenticatedSubject.next(false);
  }
}
