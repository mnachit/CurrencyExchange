import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private TOKEN_KEY = 'token';
  private ID_KEY = 'id';
  private jwtHelper = new JwtHelperService();

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

  // ...existing code...
  public getCompanyWithToken(): {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    city?: string;
    country?: string;
    street?: string;
  } | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const decoded = this.jwtHelper.decodeToken(token);

    const company = decoded?.company;
    if (!company) return null;

    return {
      name: company.name,
      address: company.address,
      phone: company.phone,
      email: company.email,
      city: company.city,
      country: company.country,
      street: company.street,
    };
  }
}
