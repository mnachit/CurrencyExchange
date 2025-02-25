import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Loan } from '../models/loan.model';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = 'api/loans'; // This would be the actual API URL in a real application

  constructor(private http: HttpClient) { }

  // In a real application, these methods would make actual HTTP requests
  // For now, we'll use mock data

  getLoans(): Observable<Loan[]> {
    // Mock data
    const loans: Loan[] = [
      {
        id: 'L78901',
        customerName: 'Abdul Rahman',
        amount: 5000,
        currency: 'USD',
        issueDate: new Date(2025, 0, 15), // Jan 15, 2025
        dueDate: new Date(2025, 2, 15), // Mar 15, 2025
        status: 'active'
      },
      {
        id: 'L78900',
        customerName: 'Layla Mahmoud',
        amount: 10000,
        currency: 'SAR',
        issueDate: new Date(2025, 0, 10), // Jan 10, 2025
        dueDate: new Date(2025, 1, 10), // Feb 10, 2025
        status: 'repaid'
      },
      {
        id: 'L78899',
        customerName: 'Omar Khalid',
        amount: 3500,
        currency: 'EUR',
        issueDate: new Date(2024, 11, 28), // Dec 28, 2024
        dueDate: new Date(2025, 1, 28), // Feb 28, 2025
        status: 'overdue'
      }
    ];

    return of(loans);
  }

  getLoan(id: string): Observable<Loan | undefined> {
    return this.getLoans().pipe(
      map(loans => loans.find(loan => loan.id === id))
    );
  }

  addLoan(loan: Omit<Loan, 'id' | 'status'>): Observable<Loan> {
    const newLoan: Loan = {
      ...loan,
      id: 'L' + Math.floor(Math.random() * 100000).toString().padStart(5, '0'),
      status: 'active'
    };

    // In a real application, this would make an API call
    return of(newLoan);
  }

  updateLoan(id: string, loan: Partial<Loan>): Observable<boolean> {
    // In a real application, this would make an API call
    return of(true);
  }

  deleteLoan(id: string): Observable<boolean> {
    // In a real application, this would make an API call
    return of(true);
  }

  markAsRepaid(id: string): Observable<boolean> {
    // In a real application, this would make an API call
    return of(true);
  }
}