import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'api/transactions'; // This would be the actual API URL in a real application

  constructor(private http: HttpClient) { }

  // In a real application, these methods would make actual HTTP requests
  // For now, we'll use mock data

  getTransactions(): Observable<Transaction[]> {
    // Mock data
    const transactions: Transaction[] = [
      {
        id: 'TX123456',
        date: new Date(2025, 1, 24, 11, 42),
        customerName: 'Ahmed Mohammed',
        fromCurrency: 'USD',
        fromAmount: 2000,
        toCurrency: 'EUR',
        toAmount: 1842.5,
        status: 'completed'
      },
      {
        id: 'TX123455',
        date: new Date(2025, 1, 24, 10, 28),
        customerName: 'Sara Abdullah',
        fromCurrency: 'EUR',
        fromAmount: 1150,
        toCurrency: 'GBP',
        toAmount: 985.2,
        status: 'completed'
      },
      {
        id: 'TX123454',
        date: new Date(2025, 1, 24, 9, 15),
        customerName: 'Khalid Omar',
        fromCurrency: 'SAR',
        fromAmount: 8812.5,
        toCurrency: 'USD',
        toAmount: 2350,
        status: 'completed'
      },
      {
        id: 'TX123453',
        date: new Date(2025, 1, 23, 16, 32),
        customerName: 'Fatima Al-Saud',
        fromCurrency: 'AED',
        fromAmount: 1835,
        toCurrency: 'USD',
        toAmount: 500,
        status: 'completed'
      },
      {
        id: 'TX123452',
        date: new Date(2025, 1, 23, 15, 17),
        customerName: 'Mohammed Al-Harbi',
        fromCurrency: 'USD',
        fromAmount: 5000,
        toCurrency: 'SAR',
        toAmount: 18750,
        status: 'pending'
      }
    ];

    return of(transactions);
  }

  getTransaction(id: string): Observable<Transaction | undefined> {
    return this.getTransactions().pipe(
      map(transactions => transactions.find(transaction => transaction.id === id))
    );
  }

  addTransaction(transaction: Omit<Transaction, 'id' | 'date'>): Observable<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: 'TX' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
      date: new Date()
    };

    // In a real application, this would make an API call
    return of(newTransaction);
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