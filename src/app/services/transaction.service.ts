import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Transaction } from '../models/transaction.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = environment.apiUrl + '/transaction';

  constructor(private http: HttpClient) { }

  // In a real application, these methods would make actual HTTP requests
  // For now, we'll use mock data

  getTransactions(): Observable<{message: string, result: string, errors: string, errorMap: string[]}>{
    return this.http.get<{message: string, result: string, errors: string, errorMap: string[]}>(this.apiUrl+'/getList');
  }

  // getTransaction(id: string): Observable<Transaction | undefined> {
  //   return this.getTransactions().pipe(
  //     map(transactions => transactions.find(transaction => transaction.id === id))
  //   );
  // }

  addTransaction(transaction: Transaction): Observable<{message: string, result: string, errors: string, errorMap: string[]}>{
    console.log(transaction);
    
    return this.http.post<{message: string, result: string, errors: string, errorMap: string[]}>(this.apiUrl+'/save', transaction);
  }

  updateTransaction(id: string, transaction: Partial<Transaction>): Observable<boolean> {
    // In a real application, this would make an API call
    return of(true);
  }

  deleteTransaction(id: string): Observable<boolean> {
    // In a real application, this would make an API call
    return of(true);
  }

  exportTransactions(format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    // In a real application, this would make an API call to get export data
    // For now, we'll return a mock Blob
    const mockData = 'Transaction ID,Date,Customer,From Currency,From Amount,To Currency,To Amount,Status\nTX123456,2025-02-24 11:42,Ahmed Mohammed,USD,2000,EUR,1842.5,completed';
    const blob = new Blob([mockData], { type: 'text/csv;charset=utf-8;' });
    return of(blob);
  }
}