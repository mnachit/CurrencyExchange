import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl + '/user';

  constructor(private http: HttpClient) { }

  getListUser(): Observable<{ message: string, result: User[], errors: string, errorMap: string[] }> {
    return this.http.get<{ message: string, result: User[], errors: string, errorMap: string[] }>(`${this.apiUrl}/getList`);
  }

  saveUser(user: User): Observable<{ message: string, result: User, errors: string, errorMap: string[] }> {
    return this.http.post<{ message: string, result: User, errors: string, errorMap: string[] }>(`${this.apiUrl}/save`, user);
  }

  updateUser(user: User): Observable<{ message: string, result: User, errors: string, errorMap: string[] }> {
    return this.http.post<{ message: string, result: User, errors: string, errorMap: string[] }>(`${this.apiUrl}/updateUser`, user);
  }

  changeStatus(id : number[], role: string): Observable<{ message: string, result: User, errors: string, errorMap: string[] }> {
    return this.http.post<{ message: string, result: User, errors: string, errorMap: string[] }>(`${this.apiUrl}/changeStatus/${role}`, id);
  }

  deleteUser(id: number[]): Observable<{ message: string, result: User, errors: string, errorMap: string[] }> {
    return this.http.delete<{ message: string, result: User, errors: string, errorMap: string[] }>(`${this.apiUrl}/delete/`+ id);
  }
}
