import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '../pipe/translate.pipe';
import { EmployeeFundsService, EmployeeFunds, FundsSummary } from '../services/employee-funds.service';
import { finalize } from 'rxjs/operators';
import { Currency } from '../models/funds.mode';
import { FundsManagementService } from '../services/funds-management.service';
import { LanguageService } from '../services/language.service';
import { AlertService } from '../services/alert.service';

declare var bootstrap: any;

@Component({
  selector: 'app-employee-funds',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslatePipe,
    NgbDropdownModule
  ],
  templateUrl: './employee-funds.component.html',
  styleUrls: ['./employee-funds.component.scss']
})
export class EmployeeFundsComponent implements OnInit {
  // UI states
  loading: boolean = false;
  searchTerm: string = '';
  selectedDepartment: string = 'all';
  selectedCurrency: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Data
  employeeFunds: EmployeeFunds[] = [];
  filteredEmployeeFunds: EmployeeFunds[] = [];
  fundsSummary: FundsSummary | null = null;
  departments: string[] = [];
  availableCurrencies: Currency[] = [
    Currency.MAD, Currency.USD, Currency.EUR,
    Currency.GBP, Currency.SAR, Currency.AED
  ];

  // Exchange rates - for converting between currencies
  exchangeRates: { [key in Currency]?: { [key in Currency]?: number } } = {};

  // Selected employee for detail modal
  selectedEmployee: EmployeeFunds | null = null;
  selectedEmployeeHistory: any[] = [];

  // Form groups
  allocationForm: FormGroup;
  filterForm: FormGroup;

  // For modal management
  fundAllocationModal: any;
  employeeDetailModal: any;

  constructor(
    private fb: FormBuilder,
    private employeeFundsService: EmployeeFundsService,
    private fundsService: FundsManagementService,
    public languageService: LanguageService,
    private alertService: AlertService,
  ) {
    // Initialize allocation form
    this.allocationForm = this.fb.group({
      employeeId: ['', Validators.required],
      employeeName: [{ value: '', disabled: true }],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      currency: [Currency.MAD, Validators.required],
      notes: ['']
    });

    // Initialize filter form
    this.filterForm = this.fb.group({
      department: ['all'],
      currency: ['all'],
      search: ['']
    });
  }

  ngOnInit(): void {
    // Load initial data
    this.loading = true;
    this.loadEmployeeFunds();
    this.loadFundsSummary();

    // Initialize modals
    document.addEventListener('DOMContentLoaded', () => {
      const allocationModalElement = document.getElementById('fundAllocationModal');
      if (allocationModalElement) {
        this.fundAllocationModal = new bootstrap.Modal(allocationModalElement);
      }

      const detailModalElement = document.getElementById('employeeDetailModal');
      if (detailModalElement) {
        this.employeeDetailModal = new bootstrap.Modal(detailModalElement);
      }
    });

    // Load saved language preference
    const savedLanguage = this.languageService.getCurrentLanguage();
    this.languageService.setLanguage(savedLanguage);

    // Watch filter form changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  /**
   * Load all employee funds data
   */
  loadEmployeeFunds(): void {
    this.employeeFundsService.getMockEmployeeFunds()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response && response.result) {
            this.employeeFunds = response.result;

            // Extract unique departments
            this.departments = Array.from(
              new Set(this.employeeFunds.map(fund => fund.department))
            );

            this.applyFilters();
          }
        },
        error: (error) => {
          console.error('Error loading employee funds:', error);
          this.alertService.error('Failed to load employee funds data');
        }
      });
  }

  /**
   * Load funds summary data
   */
  loadFundsSummary(): void {
    this.employeeFundsService.getMockFundsSummary()
      .subscribe({
        next: (response) => {
          if (response && response.result) {
            this.fundsSummary = response.result;
          }
        },
        error: (error) => {
          console.error('Error loading funds summary:', error);
        }
      });
  }

  /**
   * Apply filters based on search, department and currency
   */
  applyFilters(): void {
    const { department, currency, search } = this.filterForm.value;
    this.selectedDepartment = department;
    this.selectedCurrency = currency;
    this.searchTerm = search;

    let filtered = [...this.employeeFunds];

    // Apply department filter
    if (department !== 'all') {
      filtered = filtered.filter(fund => fund.department === department);
    }

    // Apply currency filter
    if (currency !== 'all') {
      filtered = filtered.filter(fund => fund.currency === currency);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(fund =>
        fund.employeeName.toLowerCase().includes(searchLower) ||
        fund.position.toLowerCase().includes(searchLower)
      );
    }

    // Update pagination
    this.filteredEmployeeFunds = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.paginateResults();
  }

  /**
   * Handle pagination of results
   */
  paginateResults(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    this.filteredEmployeeFunds = this.filteredEmployeeFunds.slice(startIndex, endIndex);
  }

  /**
   * Go to a specific page of results
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  /**
   * Open fund allocation modal for a specific employee
   */
  openAllocationModal(employee?: EmployeeFunds): void {
    if (employee) {
      this.allocationForm.patchValue({
        employeeId: employee.employeeId,
        employeeName: employee.employeeName,
        currency: employee.currency,
        amount: 0,
        notes: ''
      });
    } else {
      this.allocationForm.reset({
        currency: Currency.MAD
      });
    }

    this.fundAllocationModal.show();
  }

  /**
   * Get minimum of two values (replacement for Math.min in template)
   */
  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  }

  /**
   * Open employee detail modal
   */
  viewEmployeeDetails(employee: EmployeeFunds): void {
    this.selectedEmployee = employee;
    this.loading = true;

    // In a real app, fetch employee fund history
    setTimeout(() => {
      this.selectedEmployeeHistory = this.generateMockHistory(employee);
      this.loading = false;

      this.employeeDetailModal.show();
    }, 500);
  }

  /**
   * Save fund allocation
   */
  saveAllocation(): void {
    if (this.allocationForm.valid) {
      this.loading = true;

      const allocation = {
        employeeId: this.allocationForm.value.employeeId,
        amount: this.allocationForm.value.amount,
        currency: this.allocationForm.value.currency,
        notes: this.allocationForm.value.notes
      };

      // In a real app, call service to save allocation
      setTimeout(() => {
        this.alertService.success(`Funds successfully allocated to employee`);
        this.loading = false;
        this.fundAllocationModal.hide();

        // Reload data
        this.loadEmployeeFunds();
        this.loadFundsSummary();
      }, 1000);
    }
  }

  /**
   * Remove funds from an employee
   */
  removeFunds(employee: EmployeeFunds): void {
    if (confirm(`Are you sure you want to remove funds from ${employee.employeeName}?`)) {
      this.loading = true;

      // In a real app, call service to remove funds
      setTimeout(() => {
        this.alertService.success(`Funds successfully removed from ${employee.employeeName}`);
        this.loading = false;

        // Reload data
        this.loadEmployeeFunds();
        this.loadFundsSummary();
      }, 1000);
    }
  }

  /**
   * Format currency with proper symbol
   */
  formatCurrency(amount: number | null | undefined, currency: string = Currency.MAD): string {
    // Handle null/undefined case
    if (amount === null || amount === undefined) {
      return '0.00';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Get currency symbol
   */
  getCurrencySymbol(currency: string): string {
    switch (currency) {
      case Currency.USD: return 'USD';
      case Currency.EUR: return '€';
      case Currency.GBP: return '£';
      case Currency.MAD: return 'MAD';
      case Currency.SAR: return 'SAR';
      case Currency.AED: return 'AED';
      default: return currency;
    }
  }

  /**
   * Get appropriate class for currency badge
   */
  getCurrencyClass(currency: string): string {
    switch (currency) {
      case Currency.USD: return 'bg-primary';
      case Currency.EUR: return 'bg-info';
      case Currency.GBP: return 'bg-purple';
      case Currency.MAD: return 'bg-success';
      case Currency.SAR: return 'bg-warning';
      case Currency.AED: return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  /**
   * Export employee funds data
   */
  exportData(format: 'pdf' | 'csv' | 'excel'): void {
    this.alertService.info(`Exporting employee funds data as ${format.toUpperCase()}...`);
    // Implementation would depend on your export library
  }

  /**
   * Get initials for avatar
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.filterForm.reset({
      department: 'all',
      currency: 'all',
      search: ''
    });
    this.currentPage = 1;
    this.applyFilters();
  }

  /**
   * Get pagination array for display
   */
  getPaginationArray(): (number | string)[] {
    if (this.totalPages <= 7) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    pages.push(1);

    if (this.currentPage > 3) {
      pages.push('...');
    }

    const startPage = Math.max(2, this.currentPage - 1);
    const endPage = Math.min(this.totalPages - 1, this.currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (this.currentPage < this.totalPages - 2) {
      pages.push('...');
    }

    pages.push(this.totalPages);
    return pages;
  }

  /**
   * Generate mock history for demo purposes
   */
  private generateMockHistory(employee: EmployeeFunds): any[] {
    const transactions = [];
    const now = new Date();

    // Generate 5 random past transactions
    for (let i = 0; i < 5; i++) {
      const daysAgo = Math.floor(Math.random() * 60) + 1;
      const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

      const isAllocation = Math.random() > 0.3;
      const amount = isAllocation ?
        Math.floor(Math.random() * 1000) + 100 :
        Math.floor(Math.random() * 300) + 50;

      transactions.push({
        id: 1000 + i,
        date,
        type: isAllocation ? 'allocation' : 'expense',
        amount,
        currency: employee.currency,
        notes: isAllocation ?
          'Fund allocation for project work' :
          'Expense for project supplies',
        approvedBy: 'Finance Department'
      });
    }

    // Sort by date, newest first
    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}