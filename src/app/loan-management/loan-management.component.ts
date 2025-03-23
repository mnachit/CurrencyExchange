import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoanService } from '../services/loan.service';
import { Loan } from '../models/loan.model';
import { Currency } from '../models/funds.mode';
import { finalize } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { ReportsService } from '../reports.service';

// Register all Chart.js components
Chart.register(...registerables);

declare var bootstrap: any;

// Interface for activity log
interface ActivityLog {
  id: string;
  description: string;
  timestamp: Date;
  type: 'create' | 'update' | 'delete' | 'status' | 'export' | 'other';
  userId: string;
}

// Interface for saved search
interface SavedSearch {
  name: string;
  description: string;
  filters: {
    searchTerm: string;
    statusFilter: string;
    dateFilter: string;
    currencyFilter: string;
    issueDateStart?: string;
    issueDateEnd?: string;
    dueDateStart?: string;
    dueDateEnd?: string;
    amountMin?: number;
    amountMax?: number;
  };
}

// Interface for payment schedule
interface PaymentScheduleItem {
  date: Date;
  amount: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

@Component({
  selector: 'app-loan-management',
  standalone: false,
  templateUrl: './loan-management.component.html',
  styleUrls: ['./loan-management.component.css']
})
export class LoanManagementComponent implements OnInit, AfterViewInit, OnDestroy {
  // Loans data
  loans: Loan[] = [];
  filteredLoans: Loan[] = [];

  // Pagination
  currentPage: number = 0; // Spring Boot uses 0-indexed pages
  itemsPerPage: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;

  // Filters
  searchTerm: string = '';
  statusFilter: string = 'all';
  dateFilter: string = '';
  currencyFilter: string = 'all';
  showAdvancedFilters: boolean = false;

  // Advanced filters
  issueDateStart: string = '';
  issueDateEnd: string = '';
  dueDateStart: string = '';
  dueDateEnd: string = '';
  amountMin: number | null = null;
  amountMax: number | null = null;

  // Today and this week for filter shortcuts
  today: string = new Date().toISOString().split('T')[0];
  thisWeek: string = '';

  // Loading state
  loading: boolean = false;

  // Toast notification
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  private toast: any;

  // Stats for the dashboard cards
  totalLoansAmount: number = 0;
  activeLoansCount: number = 0;
  overdueLoansCount: number = 0;
  repaidLoansCount: number = 0;

  // Forms
  loanForm: FormGroup;
  savedSearchForm: FormGroup;
  reportForm: FormGroup;
  formMode: 'add' | 'edit' = 'add';
  editingLoanId: number | null = null;

  // Array of available currencies
  currencies = Object.values(Currency);

  // Toggle for confidential/sensitive mode
  confidentialMode: boolean = false;

  // Saved searches
  savedSearches: SavedSearch[] = [];

  // Activity log
  activityLog: any[] = [];

  // Chart
  loanPerformanceChart: Chart | null = null;
  chartPeriod: 'monthly' | 'quarterly' | 'yearly' = 'monthly';

  // Payment schedule
  enablePaymentSchedule: boolean = false;
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly' = 'monthly';
  firstPaymentDate: string = '';
  numberOfPayments: number = 12;
  paymentSchedule: PaymentScheduleItem[] = [];

  // Subscriptions
  private subscriptions: Subscription = new Subscription();

  @ViewChild('modalElement') modalElement!: ElementRef;
  loanModal: any;

  // Modal properties
  modalTitle: string = '';
  modalBody: string = '';
  modalConfirmText: string = 'Confirm';
  modalCancelText: string = 'Cancel';
  modalAction: 'add' | 'delete' | 'change' | null = null;

  constructor(private fb: FormBuilder, private loanService: LoanService, private reportsService: ReportsService) {
    this.loanForm = this.fb.group({
      customerName: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      currency: ['USD', Validators.required],
      issueDate: [new Date().toISOString().split('T')[0], Validators.required],
      dueDate: ['', Validators.required],
      notes: [''],
      interestRate: [5, [Validators.required, Validators.min(0), Validators.max(100)]],
      collateral: [''],
      isConfidential: [false]
    });

    this.savedSearchForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });

    this.reportForm = this.fb.group({
      reportType: ['summary', Validators.required],
      dateRange: ['thisMonth', Validators.required],
      startDate: [''],
      endDate: [''],
      format: ['pdf', Validators.required],
      includePaymentSchedule: [false],
      includeNotes: [false],
      includeConfidential: [false]
    });

    // Calculate "this week" date range for filter
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    this.thisWeek = startOfWeek.toISOString().split('T')[0];

    // Set first payment date default
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    this.firstPaymentDate = nextMonth.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadLoans();
    this.loadSavedSearches();
    this.loadActivityLog();
  }

  ngAfterViewInit(): void {
    // Initialize Bootstrap modal
    if (this.modalElement) {
      this.loanModal = new bootstrap.Modal(this.modalElement.nativeElement);
    }

    // Initialize toast
    const toastEl = document.getElementById('loanToast');
    if (toastEl) {
      this.toast = new bootstrap.Toast(toastEl);
    }

    // Initialize chart
    this.initializeChart();
  }

  ngOnDestroy(): void {
    // Clean up chart
    if (this.loanPerformanceChart) {
      this.loanPerformanceChart.destroy();
    }

    // Unsubscribe from all subscriptions
    this.subscriptions.unsubscribe();
  }

  /**
   * Initialize performance chart
   */
  initializeChart(): void {
    const ctx = document.getElementById('loanPerformanceChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.loanPerformanceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'New Loans',
            data: [65, 72, 78, 66, 80, 82, 90, 95, 85, 92, 100, 110],
            borderColor: '#5e72e4',
            backgroundColor: 'rgba(94, 114, 228, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Repaid Loans',
            data: [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95],
            borderColor: '#2dce89',
            backgroundColor: 'rgba(45, 206, 137, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Overdue Loans',
            data: [10, 12, 8, 7, 10, 11, 9, 8, 7, 6, 8, 10],
            borderColor: '#f5365c',
            backgroundColor: 'rgba(245, 54, 92, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              // drawBorder: false,
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  /**
   * Update chart based on period selection
   */
  updateChartPeriod(period: 'monthly' | 'quarterly' | 'yearly'): void {
    this.chartPeriod = period;

    let labels: string[] = [];
    let newLoanData: number[] = [];
    let repaidLoanData: number[] = [];
    let overdueLoanData: number[] = [];

    switch (period) {
      case 'monthly':
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        newLoanData = [65, 72, 78, 66, 80, 82, 90, 95, 85, 92, 100, 110];
        repaidLoanData = [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
        overdueLoanData = [10, 12, 8, 7, 10, 11, 9, 8, 7, 6, 8, 10];
        break;
      case 'quarterly':
        labels = ['Q1', 'Q2', 'Q3', 'Q4'];
        newLoanData = [215, 228, 270, 302];
        repaidLoanData = [135, 180, 225, 270];
        overdueLoanData = [30, 28, 24, 24];
        break;
      case 'yearly':
        labels = ['2020', '2021', '2022', '2023', '2024', '2025'];
        newLoanData = [550, 650, 800, 950, 1015, 915];
        repaidLoanData = [400, 500, 600, 700, 810, 860];
        overdueLoanData = [50, 45, 40, 35, 30, 25];
        break;
    }

    if (this.loanPerformanceChart) {
      this.loanPerformanceChart.data.labels = labels;
      this.loanPerformanceChart.data.datasets[0].data = newLoanData;
      this.loanPerformanceChart.data.datasets[1].data = repaidLoanData;
      this.loanPerformanceChart.data.datasets[2].data = overdueLoanData;
      this.loanPerformanceChart.update();
    }
  }

  /**
   * Show toast notification
   */
  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    if (this.toast) {
      this.toast.show();
    }
  }

  /**
   * Load loans from the backend with filters
   */
  loadLoans(): void {
    this.loading = true;

    const advancedFilters = {
      issueDateStart: this.issueDateStart,
      issueDateEnd: this.issueDateEnd,
      dueDateStart: this.dueDateStart,
      dueDateEnd: this.dueDateEnd,
      amountMin: this.amountMin,
      amountMax: this.amountMax
    };

    this.subscriptions.add(
      this.loanService.getLoans(
        this.currentPage,
        this.itemsPerPage,
        this.searchTerm,
        this.statusFilter,
        this.dateFilter,
        this.currencyFilter,
        advancedFilters
      )
        .pipe(
          finalize(() => this.loading = false)
        )
        .subscribe({
          next: (response) => {
            this.loans = response.loans;
            this.filteredLoans = response.loans;
            this.totalPages = response.totalPages;
            this.totalElements = response.totalElements;
            this.calculateStats();
          },
          error: (error) => {
            console.error('Error loading loans:', error);
            this.showToast('Failed to load loans. Please try again later.', 'error');
          }
        })
    );
  }

  /**
   * Calculate stats based on loaded loans
   */
  calculateStats(): void {
    // Calculate total amount of all loans
    this.totalLoansAmount = this.loans.filter(loan =>
      loan.status.toLowerCase() === 'active' || loan.status.toLowerCase() === 'overdue'
    ).reduce((sum, loan) => sum + loan.amount, 0);

    // Count loans by status
    this.activeLoansCount = this.loans.filter(loan => loan.status.toLowerCase() === 'active').length;
    this.overdueLoansCount = this.loans.filter(loan => loan.status.toLowerCase() === 'overdue').length;
    this.repaidLoansCount = this.loans.filter(loan => loan.status.toLowerCase() === 'repaid').length;
  }

  onSearch(): void {
    this.currentPage = 0; // Reset to first page on new search
    this.loadLoans();
  }

  onStatusChange(status: string): void {
    this.statusFilter = status;
    this.currentPage = 0; // Reset to first page
    this.loadLoans();
  }

  onDateChange(date: string): void {
    this.dateFilter = date;
    this.currentPage = 0; // Reset to first page
    this.loadLoans();
  }

  onCurrencyChange(currency: string): void {
    this.currencyFilter = currency;
    this.currentPage = 0; // Reset to first page
    this.loadLoans();
  }

  onItemsPerPageChange(): void {
    this.currentPage = 0; // Reset to first page
    this.loadLoans();
  }

  /**
   * Toggle advanced filters visibility
   */
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  /**
   * Apply advanced filters
   */
  applyAdvancedFilters(): void {
    this.currentPage = 0; // Reset to first page
    this.loadLoans();
  }

  /**
   * Reset all filters to default values
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.dateFilter = '';
    this.currencyFilter = 'all';
    this.issueDateStart = '';
    this.issueDateEnd = '';
    this.dueDateStart = '';
    this.dueDateEnd = '';
    this.amountMin = null;
    this.amountMax = null;
    this.currentPage = 0;
    this.loadLoans();
  }

  /**
   * Get pagination range for pagination controls
   */
  getPaginationRange(): number[] {
    const range: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than maxPagesToShow
      for (let i = 0; i < this.totalPages; i++) {
        range.push(i);
      }
    } else {
      // Show a subset of pages centered around current page
      let start = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
      let end = Math.min(this.totalPages - 1, start + maxPagesToShow - 1);

      // Adjust start if we're near the end
      if (end === this.totalPages - 1) {
        start = Math.max(0, end - maxPagesToShow + 1);
      }

      for (let i = start; i <= end; i++) {
        range.push(i);
      }
    }

    return range;
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadLoans();
    }
  }

  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': return 'badge bg-primary';
      case 'repaid': return 'badge bg-success';
      case 'overdue': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  /**
   * Load saved searches from local storage
   */
  loadSavedSearches(): void {
    const savedSearchesJson = localStorage.getItem('savedSearches');
    if (savedSearchesJson) {
      try {
        this.savedSearches = JSON.parse(savedSearchesJson);
      } catch (e) {
        console.error('Failed to parse saved searches from localStorage', e);
        this.savedSearches = [];
      }
    }
  }

  /**
   * Save current search filters
   */
  saveSearchFilters(): void {
    // Show modal to get name and description
    const modal = new bootstrap.Modal(document.getElementById('newSavedSearchModal'));
    modal.show();
  }

  /**
   * Confirm save search from modal
   */
  confirmSaveSearch(): void {
    if (this.savedSearchForm.valid) {
      const newSearch: SavedSearch = {
        name: this.savedSearchForm.value.name,
        description: this.savedSearchForm.value.description,
        filters: {
          searchTerm: this.searchTerm,
          statusFilter: this.statusFilter,
          dateFilter: this.dateFilter,
          currencyFilter: this.currencyFilter,
          issueDateStart: this.issueDateStart,
          issueDateEnd: this.issueDateEnd,
          dueDateStart: this.dueDateStart,
          dueDateEnd: this.dueDateEnd,
          amountMin: this.amountMin || undefined,
          amountMax: this.amountMax || undefined
        }
      };

      this.savedSearches.push(newSearch);
      this.saveSavedSearchesToStorage();
      this.savedSearchForm.reset();
      this.showToast('Search saved successfully', 'success');

      // Add to activity log
      this.addToActivityLog(`Saved search filter: ${newSearch.name}`, 'other');
    }
  }

  /**
   * Apply a saved search
   */
  applySavedSearch(index: number): void {
    if (index >= 0 && index < this.savedSearches.length) {
      const search = this.savedSearches[index];

      this.searchTerm = search.filters.searchTerm;
      this.statusFilter = search.filters.statusFilter;
      this.dateFilter = search.filters.dateFilter;
      this.currencyFilter = search.filters.currencyFilter;
      this.issueDateStart = search.filters.issueDateStart || '';
      this.issueDateEnd = search.filters.issueDateEnd || '';
      this.dueDateStart = search.filters.dueDateStart || '';
      this.dueDateEnd = search.filters.dueDateEnd || '';
      this.amountMin = search.filters.amountMin || null;
      this.amountMax = search.filters.amountMax || null;

      this.currentPage = 0;
      this.loadLoans();

      // Add to activity log
      this.addToActivityLog(`Applied saved search: ${search.name}`, 'other');
    }
  }

  /**
   * Delete a saved search
   */
  deleteSavedSearch(index: number): void {
    if (index >= 0 && index < this.savedSearches.length) {
      const searchName = this.savedSearches[index].name;
      this.savedSearches.splice(index, 1);
      this.saveSavedSearchesToStorage();

      // Add to activity log
      this.addToActivityLog(`Deleted saved search: ${searchName}`, 'other');
    }
  }

  /**
   * Save searches to local storage
   */
  saveSavedSearchesToStorage(): void {
    localStorage.setItem('savedSearches', JSON.stringify(this.savedSearches));
  }

  /**
   * Load activity log
   */
  // this.activityLog = [
  loadActivityLog(): void {
    this.reportsService.recentReportsWithType("User").subscribe(
      (res) => {
        this.activityLog = res.result;
        console.log("sssssssssssssssssss", this.activityLog);

      },
      (err) => {
        console.error(err);
      }
    );
  }

  /**
   * Refresh activity log
   */
  refreshActivityLog(): void {
    // In a real app, this would fetch fresh data
    this.loadActivityLog();
    this.showToast('Activity log refreshed', 'success');
  }

  /**
   * Add new entry to activity log
   */
  addToActivityLog(description: string, type: 'create' | 'update' | 'delete' | 'status' | 'export' | 'other'): void {
    const newActivity: ActivityLog = {
      id: Date.now().toString(),
      description,
      timestamp: new Date(),
      type,
      userId: 'admin' // In a real app, this would be the current user
    };

    this.activityLog.unshift(newActivity);

    // Keep only the most recent 20 activities
    if (this.activityLog.length > 20) {
      this.activityLog = this.activityLog.slice(0, 20);
    }

    // In a real app, this would be sent to the backend
  }

  /**
   * Get icon class for activity log item
   */
  getActivityIcon(type: string): string {
    switch (type) {
      case 'primary': return 'fa-plus';
      case 'info': return 'fa-edit';
      case 'danger': return 'fa-trash';
      case 'success': return 'fa-check-circle';
      case 'warning': return 'fa-file-export';
      default: return 'fa-circle';
    }
  }

  /**
   * Get background color class for activity log icon
   */
  getActivityIconClass(type: string): string {
    switch (type) {
      case 'primary': return 'bg-primary';
      case 'info': return 'bg-info';
      case 'danger': return 'bg-danger';
      case 'success': return 'bg-success';
      case 'warning': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  openNewLoanForm(): void {
    this.resetForm();
    this.formMode = 'add';
    this.loanModal?.show();
  }

  resetForm(): void {
    this.loanForm.reset({
      customerName: '',
      amount: '',
      currency: 'USD',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      notes: '',
      interestRate: 5,
      collateral: '',
      isConfidential: false
    });
    this.editingLoanId = null;
    this.enablePaymentSchedule = false;
    this.paymentSchedule = [];
  }

  /**
   * Generate payment schedule
   */
  generatePaymentSchedule(): void {
    if (!this.loanForm.valid || !this.firstPaymentDate || this.numberOfPayments <= 0) {
      return;
    }

    const loanAmount = this.loanForm.value.amount;
    const interestRate = this.loanForm.value.interestRate / 100; // Convert percentage to decimal

    let monthlyRate: number;
    let intervalDays: number;

    switch (this.paymentFrequency) {
      case 'monthly':
        monthlyRate = interestRate / 12;
        intervalDays = 30;
        break;
      case 'bi-weekly':
        monthlyRate = interestRate / 26;
        intervalDays = 14;
        break;
      case 'weekly':
        monthlyRate = interestRate / 52;
        intervalDays = 7;
        break;
    }

    // Calculate payment amount (PMT formula)
    const paymentAmount = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -this.numberOfPayments));

    this.paymentSchedule = [];
    let remainingBalance = loanAmount;
    let currentDate = new Date(this.firstPaymentDate);

    for (let i = 0; i < this.numberOfPayments; i++) {
      // Calculate interest and principal for this payment
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = paymentAmount - interestPayment;

      // Update remaining balance
      remainingBalance -= principalPayment;

      // Add to payment schedule
      this.paymentSchedule.push({
        date: new Date(currentDate),
        amount: paymentAmount,
        principal: principalPayment,
        interest: interestPayment,
        remainingBalance: remainingBalance > 0 ? remainingBalance : 0
      });

      // Move to next payment date
      currentDate.setDate(currentDate.getDate() + intervalDays);
    }
  }

  saveLoan(): void {
    if (this.loanForm.valid) {
      const formValues = this.loanForm.value;
      this.loading = true;

      if (this.formMode === 'add') {
        const newLoan: Loan = {
          id: 0, // Backend will generate the ID
          customerName: formValues.customerName,
          customerId: '',
          amount: formValues.amount,
          currency: formValues.currency,
          issueDate: new Date(formValues.issueDate),
          dueDate: new Date(formValues.dueDate),
          status: 'ACTIVE', // Match Java enum
          interestRate: formValues.interestRate,
          collateral: formValues.collateral,
          isConfidential: formValues.isConfidential,
          notes: formValues.notes
        };

        this.subscriptions.add(
          this.loanService.saveLoan(newLoan)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
              next: (response) => {
                // Response contains result property
                this.loadLoans();
                this.loanModal?.hide();
                this.showToast('Loan created successfully!', 'success');

                // Add to activity log
                this.addToActivityLog(`Created new loan for ${newLoan.customerName}`, 'create');
              },
              error: (error) => {
                console.error('Error saving loan:', error);
                this.showToast('Failed to create loan. Please try again.', 'error');
              }
            })
        );
      } else if (this.editingLoanId) {
        const updatedLoan: Loan = {
          id: Number(this.editingLoanId), // Convert to number for Java Long
          customerName: formValues.customerName,
          customerId: '',
          amount: formValues.amount,
          currency: formValues.currency,
          issueDate: new Date(formValues.issueDate),
          dueDate: new Date(formValues.dueDate),
          status: this.loans.find(l => l.id === Number(this.editingLoanId))?.status || 'ACTIVE',
          interestRate: formValues.interestRate,
          collateral: formValues.collateral,
          isConfidential: formValues.isConfidential,
          notes: formValues.notes
        };

        this.subscriptions.add(
          this.loanService.updateLoan(updatedLoan)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
              // Rest of the code...
            })
        );
      }
    } else {
      // Mark all form controls as touched to trigger validation messages
      Object.keys(this.loanForm.controls).forEach(key => {
        this.loanForm.get(key)?.markAsTouched();
      });
    }
  }

  viewLoan(loan: Loan): void {
    // In a real application, this might open a detailed view page or modal
    // For now, let's show a simple alert
    alert(`Loan Details for ID: ${loan.id}\nCustomer: ${loan.customerName}\nAmount: ${this.formatAmount(loan.amount, loan.currency)}\nStatus: ${loan.status}`);

    // Add to activity log
    this.addToActivityLog(`Viewed loan details for ${loan.customerName}`, 'other');
  }

  editLoan(loan: Loan): void {
    this.formMode = 'edit';
    this.editingLoanId = loan.id;

    // Reset payment schedule data

    if (this.enablePaymentSchedule && this.paymentSchedule.length > 0) {
      // Determine payment frequency based on dates
      const firstDate = this.paymentSchedule[0].date;
      const secondDate = this.paymentSchedule[1]?.date;

      if (secondDate) {
        const diffDays = Math.round((secondDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) {
          this.paymentFrequency = 'weekly';
        } else if (diffDays <= 14) {
          this.paymentFrequency = 'bi-weekly';
        } else {
          this.paymentFrequency = 'monthly';
        }
      }

      this.firstPaymentDate = this.paymentSchedule[0].date.toISOString().split('T')[0];
      this.numberOfPayments = this.paymentSchedule.length;
    }

    // Get additional properties with defaults if they don't exist
    const interestRate = loan.interestRate || 5;
    const collateral = loan.collateral || '';
    const isConfidential = loan.isConfidential || false;
    const notes = loan.notes || '';

    this.loanForm.setValue({
      customerName: loan.customerName,
      amount: loan.amount,
      currency: loan.currency,
      issueDate: loan.issueDate.toISOString().split('T')[0],
      dueDate: loan.dueDate.toISOString().split('T')[0],
      notes: notes,
      interestRate: interestRate,
      collateral: collateral,
      isConfidential: isConfidential
    });

    // Show the modal using Bootstrap's modal API
    this.loanModal?.show();
  }

  showNewLoan(): void {
    this.formMode = 'add';
    this.resetForm();
  }

  deleteLoan(loan: Loan): void {
    this.modalTitle = 'Delete Loan';
    this.modalBody = `Are you sure you want to delete the loan for ${loan.customerName}?`;
    this.modalConfirmText = 'Delete';
    this.modalCancelText = 'Cancel';
    this.modalAction = 'delete';
    this.editingLoanId = loan.id;

    const modal = new bootstrap.Modal(document.getElementById('genericModal'));
    modal.show();
  }

  handleModalConfirm(): void {
    if (this.modalAction === 'delete' && this.editingLoanId) {
      this.loading = true;

      this.subscriptions.add(
        this.loanService.deleteLoan(Number(this.editingLoanId)) // Convert to number for API call
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            // Rest of the code...
          })
      );
    }

    if (this.modalAction === 'change' && this.editingLoanId) {
      this.loading = true;

      this.subscriptions.add(
        this.loanService.changeStatus(Number(this.editingLoanId), 'REPAID') // Match Java enum
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            // Rest of the code...
          })
      );
    }
  }

  handleModalCancel(): void {
    // Reset modal action and editing loan ID
    this.modalAction = null;
    this.editingLoanId = null;
  }

  markAsRepaid(loan: Loan): void {
    this.modalTitle = 'Mark Loan as Repaid';
    this.modalBody = `Are you sure you want to mark the loan for ${loan.customerName} as repaid?`;
    this.modalConfirmText = 'Confirm';
    this.modalCancelText = 'Cancel';
    this.modalAction = 'change';
    this.editingLoanId = (loan.id); // Convert number to string for component use

    const modal = new bootstrap.Modal(document.getElementById('genericModal'));
    modal.show();
  }

  exportLoans(): void {
    // In a real application, this would generate a CSV/Excel file for download
    this.showToast('Exporting loans data...', 'success');

    setTimeout(() => {
      this.showToast('Loans data exported successfully!', 'success');

      // Add to activity log
      this.addToActivityLog('Exported loans data', 'export');
    }, 1500);
  }

  /**
   * Generate report based on form settings
   */
  generateReport(): void {
    if (!this.reportForm.valid) {
      return;
    }

    this.loading = true;

    // In a real application, this would call a service method to generate the report
    setTimeout(() => {
      this.loading = false;

      const modal = bootstrap.Modal.getInstance(document.getElementById('reportModal'));
      modal?.hide();

      this.showToast(`${this.reportForm.value.reportType} report generated successfully!`, 'success');

      // Add to activity log
      this.addToActivityLog(`Generated ${this.reportForm.value.reportType} report`, 'export');
    }, 2000);
  }

  // Calculate if a loan is overdue
  isOverdue(dueDate: Date): boolean {
    return new Date() > dueDate;
  }

  // Check for loans that will be due soon (within the next 7 days)
  isDueSoon(dueDate: Date): boolean {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    return dueDate > today && dueDate <= sevenDaysFromNow;
  }
}