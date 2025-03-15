import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { DashboardStats } from './../models/DashboardStats.model';
import { Transaction } from '../models/transaction.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl + '/dashboard';// This would be the actual API URL in a real application

  constructor(private http: HttpClient) { }

  // In a real application, these methods would make actual HTTP requests
  // For now, we'll use mock data

  // getDashboardStats(): Observable<DashboardStats> {
  //   // Mock data
  //   const stats: DashboardStats = {
  //     availableFunds: 124750,
  //     totalExchanges: 432,
  //     activeLoans: 26380,
  //     todayProfit: 2148,
  //     fundsTrend: 12.5,
  //     exchangesTrend: 8.3,
  //     loansTrend: -3.2,
  //     profitTrend: 15.7
  //   };

  //   return of(stats);
  // }

  getDashboardStats(): Observable<{ message: string, result: DashboardStats, errors: string, errorMap: string[] }> {
    return this.http.get<{ message: string, result: DashboardStats, errors: string, errorMap: string[] }>(this.apiUrl + '/getStatistics');
  }
  getRecentTransactions(limit: number = 5): Observable<Transaction[]> {
    // Mock data
    const transactions: Transaction[] = [
      {
        id: 'TX123456',
        date: new Date(),
        customerName: 'Ahmed Mohammed',
        fromCurrency: 'USD',
        fromAmount: 2000,
        toCurrency: 'EUR',
        toAmount: 1842.5,
        status: 'completed'
      },
      {
        id: 'TX123455',
        date: new Date(),
        customerName: 'Sara Abdullah',
        fromCurrency: 'EUR',
        fromAmount: 1150,
        toCurrency: 'GBP',
        toAmount: 985.2,
        status: 'completed'
      },
      {
        id: 'TX123454',
        date: new Date(),
        customerName: 'Khalid Omar',
        fromCurrency: 'SAR',
        fromAmount: 8812.5,
        toCurrency: 'USD',
        toAmount: 2350,
        status: 'completed'
      },
      {
        id: 'TX123453',
        date: new Date(Date.now() - 86400000), // yesterday
        customerName: 'Fatima Al-Saud',
        fromCurrency: 'AED',
        fromAmount: 1835,
        toCurrency: 'USD',
        toAmount: 500,
        status: 'completed'
      }
    ];

    return of(transactions.slice(0, limit));
  }

  getTransactionStats(period: 'day' | 'week' | 'month' | 'year' = 'week'): Observable<any> {
    // Mock data for a bar chart
    let labels: string[] = [];
    let data: number[] = [];

    switch (period) {
      case 'day':
        labels = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];
        data = [12, 19, 13, 15, 22, 18, 14, 21, 17];
        break;
      case 'week':
        labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        data = [65, 85, 45, 70, 90, 65, 75];
        break;
      case 'month':
        labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
        data = Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 30);
        break;
      case 'year':
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        data = [350, 410, 380, 450, 510, 530, 490, 520, 560, 580, 610, 640];
        break;
    }

    return of({ labels, data });
  }

  getRecentCountTransactionsWithDay(day: string): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/getRecentCountTransactionsWithDay/' + day);
  }

  getRecentTransactionsLast3Months(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/getRecentTransactionsLast3Months');
  }

  getRecentTransactionsLast7Days(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/getRecentTransactionsLast7Days');
  }

  getRecentTransactionsLast4Weeks(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/getRecentTransactionsLast4Weeks');
  }

  getRecentTransactionsLast12Months(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/getRecentTransactionsLast12Months');
  }
}