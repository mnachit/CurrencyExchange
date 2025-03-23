import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Loan } from '../models/loan.model';
import { map, delay } from 'rxjs/operators';
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

// Advanced filters interface
interface AdvancedFilters {
  issueDateStart?: string;
  issueDateEnd?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
  amountMin?: number | null;
  amountMax?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = environment.apiUrl + '/loan';

  // Mock data for development
  // private mockLoans: Loan[] = [
  //   {
  //     id: 'L2023-001',
  //     customerId: 'C1001',
  //     customerName: 'John Smith',
  //     amount: 25000,
  //     currency: 'USD',
  //     issueDate: new Date('2023-01-15'),
  //     dueDate: new Date('2024-01-15'),
  //     status: 'ACTIVE',
  //     interestRate: 5.5,
  //     collateral: 'Vehicle',
  //     isConfidential: false,
  //     notes: 'First-time borrower with good credit history'
  //   },
  //   {
  //     id: 'L2023-002',
  //     customerId: 'C1002',
  //     customerName: 'Jane Williams',
  //     amount: 15000,
  //     currency: 'EUR',
  //     issueDate: new Date('2023-02-20'),
  //     dueDate: new Date('2023-08-20'),
  //     status: 'REPAID',
  //     interestRate: 4.5,
  //     collateral: '',
  //     isConfidential: false,
  //     notes: 'Repaid early'
  //   },
  //   {
  //     id: 'L2023-003',
  //     customerId: 'C1003',
  //     customerName: 'Robert Johnson',
  //     amount: 50000,
  //     currency: 'USD',
  //     issueDate: new Date('2023-03-10'),
  //     dueDate: new Date('2025-03-10'),
  //     status: 'ACTIVE',
  //     interestRate: 6.0,
  //     collateral: 'Property',
  //     isConfidential: true,
  //     notes: 'Business expansion loan'
  //   },
  //   {
  //     id: 'L2023-004',
  //     customerId: 'C1004',
  //     customerName: 'Emily Brown',
  //     amount: 10000,
  //     currency: 'GBP',
  //     issueDate: new Date('2023-04-05'),
  //     dueDate: new Date('2023-02-25'),
  //     status: 'OVERDUE',
  //     interestRate: 5.0,
  //     collateral: '',
  //     isConfidential: false,
  //     notes: 'Second notice sent'
  //   },
  //   {
  //     id: 'L2023-005',
  //     customerId: 'C1005',
  //     customerName: 'Michael Davis',
  //     amount: 35000,
  //     currency: 'USD',
  //     issueDate: new Date('2023-05-12'),
  //     dueDate: new Date('2024-05-12'),
  //     status: 'ACTIVE',
  //     interestRate: 5.25,
  //     collateral: 'Investments',
  //     isConfidential: false,
  //     notes: ''
  //   },
  //   {
  //     id: 'L2023-006',
  //     customerId: 'C1006',
  //     customerName: 'Sarah Martinez',
  //     amount: 20000,
  //     currency: 'USD',
  //     issueDate: new Date('2023-06-18'),
  //     dueDate: new Date('2024-04-23'),
  //     status: 'ACTIVE',
  //     interestRate: 4.75,
  //     collateral: '',
  //     isConfidential: false,
  //     notes: 'Home renovation loan'
  //   },
  //   {
  //     id: 'L2023-007',
  //     customerId: 'C1007',
  //     customerName: 'David Wilson',
  //     amount: 45000,
  //     currency: 'EUR',
  //     issueDate: new Date('2023-01-25'),
  //     dueDate: new Date('2023-03-01'),
  //     status: 'OVERDUE',
  //     interestRate: 5.5,
  //     collateral: 'Business Assets',
  //     isConfidential: true,
  //     notes: 'Legal review in progress'
  //   },
  //   {
  //     id: 'L2023-008',
  //     customerId: 'C1008',
  //     customerName: 'Jennifer Lee',
  //     amount: 12500,
  //     currency: 'USD',
  //     issueDate: new Date('2023-02-10'),
  //     dueDate: new Date('2023-12-10'),
  //     status: 'ACTIVE',
  //     interestRate: 4.0,
  //     collateral: '',
  //     isConfidential: false,
  //     notes: 'Education loan'
  //   },
  //   {
  //     id: 'L2023-009',
  //     customerId: 'C1009',
  //     customerName: 'Daniel Clark',
  //     amount: 30000,
  //     currency: 'USD',
  //     issueDate: new Date('2023-04-15'),
  //     dueDate: new Date('2024-02-15'),
  //     status: 'ACTIVE',
  //     interestRate: 5.0,
  //     collateral: 'Vehicle',
  //     isConfidential: false,
  //     notes: ''
  //   },
  //   {
  //     id: 'L2023-010',
  //     customerId: 'C1010',
  //     customerName: 'Lisa Rodriguez',
  //     amount: 75000,
  //     currency: 'EUR',
  //     issueDate: new Date('2023-03-20'),
  //     dueDate: new Date('2023-11-10'),
  //     status: 'REPAID',
  //     interestRate: 6.5,
  //     collateral: 'Property',
  //     isConfidential: false,
  //     notes: 'Commercial loan'
  //   },
  //   {
  //     id: 'L2023-011',
  //     customerId: 'C1011',
  //     customerName: 'Christopher White',
  //     amount: 8000,
  //     currency: 'GBP',
  //     issueDate: new Date('2023-05-05'),
  //     dueDate: new Date('2023-11-05'),
  //     status: 'REPAID',
  //     interestRate: 3.75,
  //     collateral: '',
  //     isConfidential: false,
  //     notes: 'Personal loan'
  //   },
  //   {
  //     id: 'L2023-012',
  //     customerId: 'C1012',
  //     customerName: 'Amanda Taylor',
  //     amount: 22000,
  //     currency: 'USD',
  //     issueDate: new Date('2023-06-12'),
  //     dueDate: new Date('2024-06-12'),
  //     status: 'ACTIVE',
  //     interestRate: 4.25,
  //     collateral: '',
  //     isConfidential: false,
  //     notes: 'Vehicle loan'
  //   }
  // ];

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
    currency?: string,
    advancedFilters?: AdvancedFilters
  ): Observable<{ loans: Loan[], totalPages: number, totalElements: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
  
    // Add optional filters
    if (searchTerm) params = params.set('searchTerm', searchTerm);
    if (status && status !== 'all') params = params.set('status', status.toUpperCase());
    if (date) params = params.set('date', date);
    if (currency && currency !== 'all') params = params.set('currency', currency);
    
    // Add advanced filters
    if (advancedFilters?.issueDateStart) params = params.set('issueDateStart', advancedFilters.issueDateStart);
    if (advancedFilters?.issueDateEnd) params = params.set('issueDateEnd', advancedFilters.issueDateEnd);
    if (advancedFilters?.dueDateStart) params = params.set('dueDateStart', advancedFilters.dueDateStart);
    if (advancedFilters?.dueDateEnd) params = params.set('dueDateEnd', advancedFilters.dueDateEnd);
    if (advancedFilters?.amountMin) params = params.set('amountMin', advancedFilters.amountMin.toString());
    if (advancedFilters?.amountMax) params = params.set('amountMax', advancedFilters.amountMax.toString());
  
    return this.http.get<ApiResponse<PageResponse<Loan>>>(`${this.apiUrl}/getList`, { params })
      .pipe(
        map(response => {
          // Convert dates from strings to Date objects
          const loans = response.result.content.map(loan => ({
            ...loan,
            issueDate: new Date(loan.issueDate),
            dueDate: new Date(loan.dueDate),
            createdAt: loan.createdAt ? new Date(loan.createdAt) : undefined,
            updatedAt: loan.updatedAt ? new Date(loan.updatedAt) : undefined
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
    // In a production environment:
    return this.http.post<ApiResponse<Loan>>(`${this.apiUrl}/save`, loan);

    // For development, mock the response:
    // const newLoan = {
    //   ...loan,
    //   id: `L2023-${this.mockLoans.length + 1}`.padStart(8, '0'),
    //   customerId: `C${1000 + this.mockLoans.length + 1}`
    // };

    // this.mockLoans.push(newLoan);

    // return of({
    //   message: 'Loan created successfully',
    //   result: newLoan
    // }).pipe(delay(800)); // Simulate network delay
  }

  /**
   * Update an existing loan
   */
  updateLoan(loan: Loan): Observable<ApiResponse<Loan>> {
    // In a production environment:
    return this.http.put<ApiResponse<Loan>>(`${this.apiUrl}/update/${loan.id}`, loan);

    // For development, mock the response:
    // const index = this.mockLoans.findIndex(l => l.id === loan.id);

    // if (index !== -1) {
    //   // Generate customerId if not present in the update
    //   const customerId = loan.customerId || this.mockLoans[index].customerId;

    //   this.mockLoans[index] = {
    //     ...loan,
    //     customerId
    //   };

    //   return of({
    //     message: 'Loan updated successfully',
    //     result: this.mockLoans[index]
    //   }).pipe(delay(800)); // Simulate network delay
    // } else {
    //   throw new Error('Loan not found');
    // }
  }

  /**
   * Delete a loan
   */
  deleteLoan(id: number): Observable<ApiResponse<void>> {
    // In a production environment:
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/delete/${id}`);

    // For development, mock the response:
    // const index = this.mockLoans.findIndex(l => l.id === id);

    // if (index !== -1) {
    //   this.mockLoans.splice(index, 1);

    //   return of({
    //     message: 'Loan deleted successfully',
    //     result: undefined
    //   }).pipe(delay(800)); // Simulate network delay
    // } else {
    //   throw new Error('Loan not found');
    // }
  }

  /**
   * Change loan status
   */
  changeStatus(id: number, status: string): Observable<ApiResponse<Loan>> {
    // In a production environment:
    return this.http.post<ApiResponse<Loan>>(`${this.apiUrl}/status/${id}/${status}`, null);

    // For development, mock the response:
    // const index = this.mockLoans.findIndex(l => l.id === id);

    // if (index !== -1) {
    //   this.mockLoans[index] = {
    //     ...this.mockLoans[index],
    //     status
    //   };

    //   return of({
    //     message: 'Loan status updated successfully',
    //     result: this.mockLoans[index]
    //   }).pipe(delay(800)); // Simulate network delay
    // } else {
    //   throw new Error('Loan not found');
    // }
  }

  /**
   * Get loan statistics
   */
  getLoanStatistics(): Observable<any> {
    // In a production environment:
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/statistics`);

    // For development, mock the response:
    // const activeLoans = this.mockLoans.filter(loan => loan.status.toLowerCase() === 'active');
    // const overdueLoans = this.mockLoans.filter(loan => loan.status.toLowerCase() === 'overdue');
    // const repaidLoans = this.mockLoans.filter(loan => loan.status.toLowerCase() === 'repaid');

    // const totalAmount = activeLoans.reduce((sum, loan) => sum + loan.amount, 0) +
    //   overdueLoans.reduce((sum, loan) => sum + loan.amount, 0);

    // const stats = {
    //   activeLoansCount: activeLoans.length,
    //   overdueLoansCount: overdueLoans.length,
    //   repaidLoansCount: repaidLoans.length,
    //   totalLoansAmount: totalAmount
    // };

    // return of({
    //   message: 'Statistics retrieved successfully',
    //   result: stats
    // }).pipe(delay(500)); // Simulate network delay
  }
}