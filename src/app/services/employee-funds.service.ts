import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Currency } from '../models/funds.mode';

export interface EmployeeFunds {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  position: string;
  currency: Currency;
  amount: number;
  lastUpdated: Date;
  avatar?: string;
}

export interface FundsSummary {
  totalFunds: { [key in Currency]?: number };
  employeeCount: number;
  departmentBreakdown: { [department: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeFundsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get all funds allocated to employees
   */
  getAllEmployeeFunds(): Observable<any> {
    return this.http.get(`${this.apiUrl}/funds/employees`);
  }

  /**
   * Get funds for a specific employee
   */
  getEmployeeFunds(employeeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/funds/employees/${employeeId}`);
  }

  /**
   * Get funds summary across all employees
   */
  getFundsSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/funds/employees/summary`);
  }

  /**
   * Allocate funds to an employee
   */
  allocateFunds(allocation: {
    employeeId: number;
    amount: number;
    currency: Currency;
    notes?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/funds/allocate`, allocation);
  }

  /**
   * Update employee fund allocation
   */
  updateAllocation(id: number, update: {
    amount: number;
    currency: Currency;
    notes?: string;
  }): Observable<any> {
    return this.http.put(`${this.apiUrl}/funds/allocations/${id}`, update);
  }

  /**
   * Remove funds from an employee
   */
  removeFunds(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/funds/allocations/${id}`);
  }

  /**
   * Get funds history for an employee
   */
  getFundsHistory(employeeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/funds/employees/${employeeId}/history`);
  }

  /**
   * Get available currencies with their exchange rates
   */
  getAvailableCurrencies(): Observable<any> {
    return this.http.get(`${this.apiUrl}/funds/currencies`);
  }

  /**
   * Get funds by department
   */
  getFundsByDepartment(): Observable<any> {
    return this.http.get(`${this.apiUrl}/funds/departments`);
  }

  // Fallback method for demo purposes if API is not ready
  getMockEmployeeFunds(): Observable<{ result: EmployeeFunds[] }> {
    const mockData: EmployeeFunds[] = [
      {
        id: 1,
        employeeId: 101,
        employeeName: 'Ahmed Mohammed',
        department: 'Finance',
        position: 'Financial Analyst',
        currency: Currency.MAD,
        amount: 5000,
        lastUpdated: new Date(2023, 3, 15)
      },
      {
        id: 2,
        employeeId: 102,
        employeeName: 'Sara Abdullah',
        department: 'Marketing',
        position: 'Marketing Manager',
        currency: Currency.USD,
        amount: 2500,
        lastUpdated: new Date(2023, 4, 10)
      },
      {
        id: 3,
        employeeId: 103,
        employeeName: 'Khalid Omar',
        department: 'Sales',
        position: 'Sales Representative',
        currency: Currency.EUR,
        amount: 1800,
        lastUpdated: new Date(2023, 4, 5)
      },
      {
        id: 4,
        employeeId: 104,
        employeeName: 'Leila Benmoussa',
        department: 'IT',
        position: 'Software Developer',
        currency: Currency.MAD,
        amount: 6500,
        lastUpdated: new Date(2023, 4, 12)
      },
      {
        id: 5,
        employeeId: 105,
        employeeName: 'Mohammed Alaoui',
        department: 'Operations',
        position: 'Operations Manager',
        currency: Currency.SAR,
        amount: 8000,
        lastUpdated: new Date(2023, 4, 8)
      },
      {
        id: 6,
        employeeId: 106,
        employeeName: 'Fatima Zahra',
        department: 'Human Resources',
        position: 'HR Specialist',
        currency: Currency.AED,
        amount: 4200,
        lastUpdated: new Date(2023, 3, 28)
      },
      {
        id: 7,
        employeeId: 107,
        employeeName: 'Youssef El Mansouri',
        department: 'Finance',
        position: 'Accountant',
        currency: Currency.MAD,
        amount: 4800,
        lastUpdated: new Date(2023, 4, 1)
      },
      {
        id: 8,
        employeeId: 108,
        employeeName: 'Nadia Karim',
        department: 'Marketing',
        position: 'Digital Marketing Specialist',
        currency: Currency.GBP,
        amount: 2000,
        lastUpdated: new Date(2023, 4, 7)
      }
    ];

    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ result: mockData });
        observer.complete();
      }, 500);
    });
  }

  // Mock summary data for demo purposes
  getMockFundsSummary(): Observable<{ result: FundsSummary }> {
    const mockSummary: FundsSummary = {
      totalFunds: {
        [Currency.MAD]: 16300,
        [Currency.USD]: 2500,
        [Currency.EUR]: 1800,
        [Currency.GBP]: 2000,
        [Currency.SAR]: 8000,
        [Currency.AED]: 4200
      },
      employeeCount: 8,
      departmentBreakdown: {
        'Finance': 9800,
        'Marketing': 4500,
        'Sales': 1800,
        'IT': 6500,
        'Operations': 8000,
        'Human Resources': 4200
      }
    };

    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ result: mockSummary });
        observer.complete();
      }, 500);
    });
  }
}