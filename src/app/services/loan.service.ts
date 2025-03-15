import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loan } from '../models/loan.model';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface ApiResponse<T> {
  message: string;
  result: T;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = environment.apiUrl + '/loan';

  constructor(private http: HttpClient) { }

  /**
   * Get loans with pagination and optional filtering
   */
  getLoans(
    page: number = 0, 
    size: number = 10, 
    searchTerm?: string, 
    status?: string, 
    date?: string, 
    currency?: string
  ): Observable<{ loans: Loan[], totalPages: number, totalElements: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // Add optional filters if they exist
    if (searchTerm) params = params.set('searchTerm', searchTerm);
    if (status && status !== 'all') params = params.set('status', status);
    if (date) params = params.set('date', date);
    if (currency && currency !== 'all') params = params.set('currency', currency);

    return this.http.get<ApiResponse<PageResponse<Loan>>>(`${this.apiUrl}/getList`, { params })
      .pipe(
        map(response => {
          // Convert dates from strings to Date objects
          const loans = response.result.content.map(loan => ({
            ...loan,
            issueDate: new Date(loan.issueDate),
            dueDate: new Date(loan.dueDate)
          }));

          return {
            loans,
            totalPages: response.result.totalPages,
            totalElements: response.result.totalElements
          };
        })
      );
  }

  /**
   * Save a new loan
   */
  saveLoan(loan: Loan): Observable<ApiResponse<Loan>> {
    return this.http.post<ApiResponse<Loan>>(`${this.apiUrl}/save`, loan);
  }

  /**
   * Update an existing loan
   */
  updateLoan(loan: Loan): Observable<ApiResponse<Loan>> {
    return this.http.put<ApiResponse<Loan>>(`${this.apiUrl}/update/${loan.id}`, loan);
  }

  /**
   * Delete a loan
   */
  deleteLoan(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/delete/${id}`);
  }

  /**
   * Change loan status
   */
  changeStatus(id: string, status: string): Observable<ApiResponse<Loan>> {
    return this.http.post<ApiResponse<Loan>>(`${this.apiUrl}/status/${id}/${status}`, null);
  }
}