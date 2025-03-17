import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { recentReports } from './models/recentReports';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  private apiUrl = environment.apiUrl + '/reports';

  constructor(private http: HttpClient) { }

  /**
   * Generate and download transaction report
   */
  generateTransactionReport(
    format: string, 
    startDate?: string, 
    endDate?: string, 
    currency?: string, 
    status?: string
  ): Observable<Blob> {
    let params = new HttpParams()
      .set('format', format);
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (currency && currency !== 'all') params = params.set('currency', currency);
    if (status && status !== 'all') params = params.set('status', status);
    
    return this.http.get(this.apiUrl + '/transactions', {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Generate and download funds management report
   */
  generateFundsReport(
    format: string, 
    startDate?: string, 
    endDate?: string, 
    currency?: string
  ): Observable<Blob> {
    let params = new HttpParams()
      .set('format', format);
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (currency && currency !== 'all') params = params.set('currency', currency);
    
    return this.http.get(this.apiUrl + '/funds', {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Generate and download currency rates report
   */
  generateCurrencyRatesReport(
    format: string, 
    startDate?: string, 
    endDate?: string, 
    currency?: string
  ): Observable<Blob> {
    let params = new HttpParams()
      .set('format', format);
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (currency && currency !== 'all') params = params.set('currency', currency);
    
    return this.http.get(this.apiUrl + '/rates', {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Generate and download loans report
   */
  generateLoansReport(
    format: string, 
    startDate?: string, 
    endDate?: string, 
    currency?: string,
    status?: string
  ): Observable<Blob> {
    let params = new HttpParams()
      .set('format', format);
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (currency && currency !== 'all') params = params.set('currency', currency);
    if (status && status !== 'all') params = params.set('status', status);
    
    return this.http.get(this.apiUrl + '/loans', {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Generate and download profit & loss report
   */
  generateProfitLossReport(
    format: string, 
    startDate?: string, 
    endDate?: string,
    currency?: string
  ): Observable<Blob> {
    let params = new HttpParams()
      .set('format', format);
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (currency && currency !== 'all') params = params.set('currency', currency);
    
    return this.http.get(this.apiUrl + '/profit-loss', {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Generate and download customer activity report
   */
  generateCustomerReport(
    format: string, 
    startDate?: string, 
    endDate?: string,
    status?: string
  ): Observable<Blob> {
    let params = new HttpParams()
      .set('format', format);
    
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (status && status !== 'all') params = params.set('status', status);
    
    return this.http.get(this.apiUrl + '/customers', {
      params,
      responseType: 'blob'
    });
  }

  getRecentReports(): Observable<{ message: string, result: recentReports[], errors: string, errorMap: string[] }> {
    return this.http.get<{ message: string, result: recentReports[], errors: string, errorMap: string[] }>(this.apiUrl + '/recentReports');
  }
}
