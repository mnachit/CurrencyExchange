import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { User } from '../models/funds.mode';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/rest/auth/';

  private loggedIn = false;

  constructor(private http : HttpClient, private tokenService : TokenService) { }



  isLoggedIn(): boolean {
    if(this.tokenService.getToken()) {
      this.loggedIn = true;
    }
    return this.loggedIn;
  }

  login1(user : User): Observable<{ message: string, result: any, errors: string, errorMap: string[] }> {
    return this.http.post<{ message: string, result: any, errors: string, errorMap: string[]}>(this.apiUrl + 'login', user);
  }

  Islogin(): void {
  }

  logout(): void {
    this.tokenService.removeToken();
    this.loggedIn = false;
  }
}
