import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
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

  // transaction.service.ts
  getTransactions(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getList?page=${page}&size=${size}`);
  }

  getRecentTransactions(): Observable<{ message: string, result: Transaction[], errors: string, errorMap: string[] }> {
    return this.http.get<{ message: string, result: Transaction[], errors: string, errorMap: string[] }>(`${this.apiUrl}/getRecentTransactions`);
  }

  getFilteredTransactionss(page: number = 0, size: number = 10, filters?: any): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    // Add filters if they exist
    if (filters) {
      if (filters.searchTerm) params = params.append('searchTerm', filters.searchTerm);
      if (filters.status) params = params.append('status', filters.status);
      if (filters.date) params = params.append('date', filters.date);
      if (filters.currency) params = params.append('currency', filters.currency);
    }
    
    return this.http.get<any>(`${this.apiUrl}/getList`, { params });
  }

  getFilteredTransactions(page: number = 0, size: number = 10, filters?: any): Observable<{ message: string, result: { content: any[] }, errors: any[], errorMap: string[], status: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // Add filters if they exist
    if (filters) {
      if (filters.searchTerm) params = params.set('searchTerm', filters.searchTerm);
      if (filters.status && filters.status !== 'all') params = params.set('status', filters.status);
      if (filters.dateFilter) params = params.set('date', filters.dateFilter);
      if (filters.currencyFilter && filters.currencyFilter !== 'all') params = params.set('currency', filters.currencyFilter);
    }

    return this.http.get<{ message: string, result: { content: any[] }, errors: any[], errorMap: string[], status: number }>(
      `${this.apiUrl}/getList`, { params }
    );
  }

  // getTransaction(id: string): Observable<Transaction | undefined> {
  //   return this.getTransactions().pipe(
  //     map(transactions => transactions.find(transaction => transaction.id === id))
  //   );
  // }

  addTransaction(transaction: Transaction): Observable<{ message: string, result: string, errors: [status: number, message: string], errorMap: string[], status: number }> {
    console.log(transaction);

    return this.http.post<{ message: string, result: string, errors: [status: number, message: string], errorMap: string[], status: number }>(this.apiUrl + '/save', transaction);
  }

  updateTransaction(id: string, transaction: Partial<Transaction>): Observable<boolean> {
    // In a real application, this would make an API call
    return of(true);
  }

  deleteTransaction(id: string): Observable<boolean> {
    // In a real application, this would make an API call
    return of(true);
  }

  deleteTransactions(ids: string[]): Observable<{ message: string, result: string, errors: [status: number, message: string], errorMap: string[], status: number }> {

    return this.http.post<{ message: string, result: string, errors: [status: number, message: string], errorMap: string[], status: number }>(this.apiUrl + '/deleteTransactions',ids);    
  }

  exportExcel(ids: number[]): Observable<Blob> {
    return this.http.post(this.apiUrl + '/exportExcel', ids, {
      responseType: 'blob'  // Importante: esto indica que esperamos un archivo binario
    });
  }

  

  exportTransactions(format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    // In a real application, this would make an API call to get export data
    // For now, we'll return a mock Blob
    const mockData = 'Transaction ID,Date,Customer,From Currency,From Amount,To Currency,To Amount,Status\nTX123456,2025-02-24 11:42,Ahmed Mohammed,USD,2000,EUR,1842.5,completed';
    const blob = new Blob([mockData], { type: 'text/csv;charset=utf-8;' });
    return of(blob);
  }

  importTransactions(formData: FormData): Observable<HttpEvent<any>> {
    const req = new HttpRequest('POST', `${this.apiUrl}/import`, formData, {
      reportProgress: true,
      responseType: 'json'
    });
    
    return this.http.request(req);
  }

  /**
   * Export transactions to different formats
   * @param type Export type ('csv', 'excel', 'pdf')
   */
  exportTransactions1(type: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${type}`, {
      responseType: 'blob'
    });
  }

  calculateStatistics(): Observable<{ message: string, result: any, errors: string, errorMap: string[] }> {
    return this.http.get<{ message: string, result: any, errors: string, errorMap: string[] }>(`${this.apiUrl}/calculateStatistics`);
  }
}