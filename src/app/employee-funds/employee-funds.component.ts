import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '../pipe/translate.pipe';
import { EmployeeFundsService, EmployeeFunds, FundsSummary } from '../services/employee-funds.service';
import { finalize } from 'rxjs/operators';
import { Currency } from '../models/funds.mode';
import { FundsManagementService } from '../services/funds-management.service';
import { LanguageService } from '../services/language.service';
import { AlertService } from '../services/alert.service';

interface FundHistory {
  currency: string;
  amount: number;
  notes?: string;
  createdAt?: string;
  createdBy?: any;
}

interface CurrencyFund {
  currency: string;
  amount: number;
}

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

  // Selected employee for detail modal
  selectedEmployee: EmployeeFunds | null = null;
  selectedEmployeeHistory: any[] = [];

  // Form groups
  allocationForm: FormGroup;
  filterForm: FormGroup;

  // Modal Templates
  @ViewChild('allocationModalTemplate') allocationModalTemplate!: TemplateRef<any>;
  @ViewChild('withdrawalModalTemplate') withdrawalModalTemplate!: TemplateRef<any>;
  @ViewChild('employeeDetailModalTemplate') employeeDetailModalTemplate!: TemplateRef<any>;
  
  // Modal references
  private allocationModalRef: any;
  private withdrawalModalRef: any;
  private employeeDetailModalRef: any;

  constructor(
    private fb: FormBuilder,
    private employeeFundsService: EmployeeFundsService,
    private fundsManagementService: FundsManagementService,
    public languageService: LanguageService,
    private alertService: AlertService,
    private modalService: NgbModal
  ) {
    // Initialize allocation form
    this.allocationForm = this.fb.group({
      id: ['', Validators.required],
      fullName: [{ value: '', disabled: true }],
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
    this.employeeFundsService.getEmployeeFunds()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response && response.result) {
            // Process and ensure all required fields are present
            this.employeeFunds = (response.result as EmployeeFunds[]).map((fund: EmployeeFunds) => {
              // Ensure department is always defined
              return {
                ...fund,
                department: fund.department || 'General',
                position: fund.position || 'Employee',
                currency: fund.currency || Currency.MAD
              };
            });

            // Extract unique departments
            this.departments = Array.from(
              new Set(this.employeeFunds
                .filter(fund => fund.department) // Filter out any undefined/null departments
                .map(fund => fund.department))
            ).sort(); // Sort the departments alphabetically

            this.applyFilters();
          } else {
            // Handle empty results
            this.employeeFunds = [];
            this.departments = [];
            this.applyFilters();
          }
        },
        error: (error) => {
          console.error('Error loading employee funds:', error);
          this.alertService.error('Failed to load employee funds data');
          // Initialize with empty arrays in case of error
          this.employeeFunds = [];
          this.departments = [];
          this.loading = false;
        }
      });
  }

  /**
   * Load funds summary data
   */
  loadFundsSummary(): void {
    this.employeeFundsService.getFundsSummary()
      .subscribe({
        next: (response) => {
          if (response && response.result) {
            this.fundsSummary = response.result;
          }
        },
        error: (error) => {
          console.error('Error loading funds summary:', error);
          this.fundsSummary = null;
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

    // Make a copy of the original array to avoid mutating it
    let filtered = [...this.employeeFunds];

    // Apply department filter if not 'all' and the department exists
    if (department !== 'all') {
      filtered = filtered.filter(fund => fund.department === department);
    }

    // Apply currency filter if not 'all' and the currency exists
    if (currency !== 'all') {
      filtered = filtered.filter(fund => fund.currency === currency);
    }

    // Apply search filter if there's a search term
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(fund =>
        (fund.fullName && fund.fullName.toLowerCase().includes(searchLower)) ||
        (fund.position && fund.position.toLowerCase().includes(searchLower)) ||
        (fund.department && fund.department.toLowerCase().includes(searchLower))
      );
    }

    // Store total count before pagination
    const totalCount = filtered.length;
    
    // Update pagination
    this.totalPages = Math.ceil(totalCount / this.itemsPerPage) || 1; // Ensure at least 1 page
    
    // Ensure current page is within valid range
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    
    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, totalCount);
    
    this.filteredEmployeeFunds = filtered.slice(startIndex, endIndex);
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
    if (employee && employee.id) {
      this.allocationForm.patchValue({
        id: employee.id,
        fullName: employee.fullName,
        currency: employee.currency || Currency.MAD,
        amount: 0,
        notes: ''
      });
    } else {
      this.allocationForm.reset({
        currency: Currency.MAD,
        amount: 0
      });
    }

    // Close any open modals first
    this.closeAllModals();

    // Open allocation modal
    this.allocationModalRef = this.modalService.open(this.allocationModalTemplate, {
      centered: true,
      backdrop: 'static'
    });
  }

  /**
   * Close the allocation modal
   */
  closeAllocationModal(): void {
    if (this.allocationModalRef) {
      this.allocationModalRef.close();
      this.allocationModalRef = null;
    }
  }

  /**
   * Open withdrawal modal for a specific employee
   */
  openWithdrawalModal(employee?: EmployeeFunds): void {
    if (employee && employee.id) {
      this.allocationForm.patchValue({
        id: employee.id,
        fullName: employee.fullName,
        currency: employee.currency || Currency.MAD,
        amount: 0,
        notes: ''
      });
    } else {
      this.allocationForm.reset({
        currency: Currency.MAD,
        amount: 0
      });
    }

    // Close any open modals first
    this.closeAllModals();
    
    // Open withdrawal modal
    this.withdrawalModalRef = this.modalService.open(this.withdrawalModalTemplate, {
      centered: true,
      backdrop: 'static'
    });
  }

  /**
   * Close the withdrawal modal
   */
  closeWithdrawalModal(): void {
    if (this.withdrawalModalRef) {
      this.withdrawalModalRef.close();
      this.withdrawalModalRef = null;
    }
  }

  /**
   * Close all open modals
   */
  closeAllModals(): void {
    this.closeAllocationModal();
    this.closeWithdrawalModal();
    this.closeEmployeeDetailModal();
  }

  /**
   * Open employee detail modal
   */
  viewEmployeeDetails(employee: EmployeeFunds): void {
    if (!employee) {
      this.alertService.error('Employee data is not available');
      return;
    }

    this.selectedEmployee = {
      ...employee,
      department: employee.department || 'General',
      position: employee.position || 'Employee'
    };
    
    this.loading = true;

    // Close any open modals first
    this.closeAllModals();

    // Fetch employee fund history
    this.fundsManagementService.generateHistory(employee)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response && response.result) {
            this.selectedEmployeeHistory = response.result;
            
            // Open the modal after data is loaded
            this.employeeDetailModalRef = this.modalService.open(this.employeeDetailModalTemplate, {
              centered: true,
              size: 'lg'
            });
          } else {
            // Handle empty history
            this.selectedEmployeeHistory = [];
            
            // Still open the modal even with empty history
            this.employeeDetailModalRef = this.modalService.open(this.employeeDetailModalTemplate, {
              centered: true,
              size: 'lg'
            });
          }
        },
        error: (error) => {
          console.error('Error loading employee history:', error);
          this.alertService.error('Failed to load employee fund history');
          this.selectedEmployeeHistory = [];
          
          // Still open the modal even with error
          this.employeeDetailModalRef = this.modalService.open(this.employeeDetailModalTemplate, {
            centered: true,
            size: 'lg'
          });
        }
      });
  }

  /**
   * Close the employee detail modal
   */
  closeEmployeeDetailModal(): void {
    if (this.employeeDetailModalRef) {
      this.employeeDetailModalRef.close();
      this.employeeDetailModalRef = null;
    }
  }

  /**
   * Save fund allocation or withdrawal
   */
  saveAllocation(operationType: string): void {
    if (this.allocationForm.valid) {
      this.loading = true;
  
      const allocation = {
        idUser: this.allocationForm.value.id,
        amount: this.allocationForm.value.amount,
        currency: this.allocationForm.value.currency,
        notes: this.allocationForm.value.notes || '',
        operationFunds: operationType
      };
  
      this.fundsManagementService.saveEmployeeFunds(allocation)
        .pipe(
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe({
          next: (response) => {
            const operationText = operationType === 'add' ? 'allocated' : 'withdrawn';
            this.alertService.success(`Funds successfully ${operationText}`);
            
            // Close the appropriate modal
            if (operationType === 'add') {
              this.closeAllocationModal();
            } else {
              this.closeWithdrawalModal();
            }
            
            // Reload data
            this.loadEmployeeFunds();
            this.loadFundsSummary();
          },
          error: (error) => {
            console.error(`Error ${operationType === 'add' ? 'allocating' : 'withdrawing'} funds:`, error);
            this.alertService.error(`Failed to ${operationType === 'add' ? 'allocate' : 'withdraw'} funds`);
          }
        });
    } else {
      // Mark form controls as touched to show validation errors
      Object.keys(this.allocationForm.controls).forEach(key => {
        const control = this.allocationForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      
      this.alertService.error('Please fill all required fields correctly');
    }
  }

  /**
   * Get minimum of two values (for pagination display)
   */
  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
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
    if (!currency) return 'MAD'; // Default if currency is undefined
    
    switch (currency) {
      case Currency.USD: return '$';
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
    if (!currency) return 'secondary'; // Default if currency is undefined
    
    switch (currency) {
      case Currency.USD: return 'primary';
      case Currency.EUR: return 'info';
      case Currency.GBP: return 'purple';
      case Currency.MAD: return 'success';
      case Currency.SAR: return 'warning';
      case Currency.AED: return 'danger';
      default: return 'secondary';
    }
  }

  /**
   * Get initials for avatar
   */
  getInitials(name: string): string {
    if (!name) return 'N/A';
    
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

    if (this.totalPages > 1) {
      pages.push(this.totalPages);
    }
    
    return pages;
  }
}