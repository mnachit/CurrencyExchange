import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Currency } from '../models/currency.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = environment.apiUrl + '/currency'; // This would be the actual API URL in a real application
  idUser: string | null = localStorage.getItem('id');
  constructor(private http: HttpClient) { }

  // In a real application, these methods would make actual HTTP requests
  // For now, we'll use mock data

  getCurrencies(): Observable<{ message: string, result: Currency[], errors: string, errorMap: string[] }> {
    return this.http.get<{ message: string, result: Currency[], errors: string, errorMap: string[] }>(this.apiUrl + '/getList/'+this.idUser);
  }

  getCurrency(code: string): Observable<{ message: string, result: Currency[], errors: string, errorMap: string[] }> {
    return this.http.get<{ message: string, result: Currency[], errors: string, errorMap: string[] }>(this.apiUrl + '/getCurrency/' + code+'/'+this.idUser);
  }

  updateRates(): Observable<boolean> {
    // In a real application, this would make an API call to update rates
    return of(true);
  }

  addCurrency(currency: Currency): Observable<Currency> {
    // In a real application, this would make an API call
    return of(currency);
  }

  updateCurrency(code: string, currency: Partial<Currency>): Observable<boolean> {
    // In a real application, this would make an API call
    return of(true);
  }

  deleteCurrency(code: string): Observable<boolean> {
    // In a real application, this would make an API call
    return of(true);
  }
}