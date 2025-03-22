import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private TOKEN_KEY = 'token';
  private ID_KEY = 'id';

  constructor() { }

  // Method to save token in localStorage
  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem('id', this.getIdUserWithToken()!);
  }

  // Method to retrieve token from localStorage
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getID(): string | null {
    return localStorage.getItem(this.ID_KEY);
  }

  // Method to remove token from localStorage
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  checkToken(): boolean {
    return !!this.getToken();
  }

  getIdUserWithToken(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    const payload = token.split('.')[1];
    const payloadDecoded = atob(payload);
    const payloadObject = JSON.parse(payloadDecoded);
    return payloadObject.id;
  }

  getFullNameUserWithToken(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    const payload = token.split('.')[1];
    const payloadDecoded = atob(payload);
    const payloadObject = JSON.parse(payloadDecoded);
    return payloadObject.fullName;
  }

  getRoleUserWithToken(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    const payload = token.split('.')[1];
    const payloadDecoded = atob(payload);
    const payloadObject = JSON.parse(payloadDecoded);
    return payloadObject.role;
  }
}
