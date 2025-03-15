import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoanService } from '../services/loan.service';
import { Loan } from '../models/loan.model';
import { Currency } from '../models/funds.mode';
import { finalize } from 'rxjs/operators';

declare var bootstrap: any;

@Component({
  selector: 'app-loan-management',
  standalone: false,
  templateUrl: './loan-management.component.html',
  styleUrls: ['./loan-management.component.css']
})
export class LoanManagementComponent implements OnInit, AfterViewInit {
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

  // Form
  loanForm: FormGroup;
  formMode: 'add' | 'edit' = 'add';
  editingLoanId: string | null = null;

  // Array of available currencies
  currencies = Object.values(Currency);

  // Toggle for confidential/sensitive mode
  confidentialMode: boolean = false;

  @ViewChild('modalElement') modalElement!: ElementRef;
  loanModal: any;

  // Modal properties
  modalTitle: string = '';
  modalBody: string = '';
  modalConfirmText: string = 'Confirm';
  modalCancelText: string = 'Cancel';
  modalAction: 'add' | 'delete' | 'change' | null = null;

  constructor(private fb: FormBuilder, private loanService: LoanService) {
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

    // Calculate "this week" date range for filter
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    this.thisWeek = startOfWeek.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadLoans();
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

    this.loanService.getLoans(
      this.currentPage,
      this.itemsPerPage,
      this.searchTerm,
      this.statusFilter,
      this.dateFilter,
      this.currencyFilter
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
      });
  }

  calculateStats(): void {
    // Calculate total amount of all loans
    this.totalLoansAmount = this.loans.reduce((sum, loan) => sum + loan.amount, 0);

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
  }

  saveLoan(): void {
    if (this.loanForm.valid) {
      const formValues = this.loanForm.value;
      this.loading = true;

      if (this.formMode === 'add') {
        const newLoan: Loan = {
          id: '', // The backend will generate the ID
          customerName: formValues.customerName,
          customerId: formValues.customerId,
          amount: formValues.amount,
          currency: formValues.currency,
          issueDate: new Date(formValues.issueDate),
          dueDate: new Date(formValues.dueDate),
          status: 'ACTIVE',
          interestRate: formValues.interestRate,
          collateral: formValues.collateral,
          isConfidential: formValues.isConfidential,
          notes: formValues.notes
        };

        this.loanService.saveLoan(newLoan)
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            next: (response) => {
              // Refresh the loans list
              this.loadLoans();
              this.loanModal?.hide();
              this.showToast('Loan created successfully!', 'success');
            },
            error: (error) => {
              console.error('Error saving loan:', error);
              this.showToast('Failed to create loan. Please try again.', 'error');
            }
          });
      } else if (this.editingLoanId) {
        const updatedLoan: Loan = {
          id: this.editingLoanId,
          customerName: formValues.customerName,
          customerId: formValues.customerId,
          amount: formValues.amount,
          currency: formValues.currency,
          issueDate: new Date(formValues.issueDate),
          dueDate: new Date(formValues.dueDate),
          status: this.loans.find(l => l.id === this.editingLoanId)?.status || 'ACTIVE',
          interestRate: formValues.interestRate,
          collateral: formValues.collateral,
          isConfidential: formValues.isConfidential,
          notes: formValues.notes
        };

        this.loanService.updateLoan(updatedLoan)
          .pipe(finalize(() => this.loading = false))
          .subscribe({
            next: (response) => {
              // Refresh the loans list
              this.loadLoans();
              this.loanModal?.hide();
              this.showToast('Loan updated successfully!', 'success');
            },
            error: (error) => {
              console.error('Error updating loan:', error);
              this.showToast('Failed to update loan. Please try again.', 'error');
            }
          });
      }
    } else {
      // Mark all form controls as touched to trigger validation messages
      Object.keys(this.loanForm.controls).forEach(key => {
        this.loanForm.get(key)?.markAsTouched();
      });
    }
  }

  viewLoan(loan: Loan): void {
    // In a real application, this would show a modal with loan details
    alert(`Loan Details for ID: ${loan.id}\nCustomer: ${loan.customerName}\nAmount: ${this.formatAmount(loan.amount, loan.currency)}\nStatus: ${loan.status}`);
  }

  editLoan(loan: Loan): void {
    this.formMode = 'edit';
    this.editingLoanId = loan.id;

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

    this.loanModal?.show();
  }

  showNewLoan(): void {
    this.formMode = 'add';
    this.resetForm();
    this.loanModal?.show();
  }

  rest(): void {
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
  }

  deleteLoan(loan: Loan): void {
    this.modalTitle = 'Delete Loan';
    this.modalBody = `Are you sure you want to delete loan ${loan.customerId}?`;
    this.modalConfirmText = 'Delete';
    this.modalCancelText = 'Cancel';
    this.modalAction = 'delete';
    this.editingLoanId = loan.customerId;
    const modal = new bootstrap.Modal(document.getElementById('genericModal'));
    modal.show();
  }

  handleModalConfirm(): void {
    if (this.modalAction === 'delete' && this.editingLoanId) {
      this.loading = true;

      this.loanService.deleteLoan(this.editingLoanId)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => {
            // Refresh the loans list
            this.loadLoans();
            this.showToast('Loan deleted successfully!', 'success');
          },
          error: (error) => {
            console.error('Error deleting loan:', error);
            this.showToast('Failed to delete loan. Please try again.', 'error');
          }
        });
    }

    if (this.modalAction === 'change' && this.editingLoanId) {
      this.loanService.changeStatus(this.editingLoanId, 'REPAID')
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          // Refresh the loans list
          this.loadLoans();
          this.showToast('Loan marked as repaid!', 'success');
        },
        error: (error) => {
          console.error('Error updating loan status:', error);
          this.showToast('Failed to update loan status. Please try again.', 'error');
        }
      });
    }
  }

  handleModalCancel(): void {
    // Reset modal action and editing loan ID
    this.modalAction = null;
    this.editingLoanId = null;
  }

  markAsRepaid(loan: Loan): void {

    this.modalTitle = 'Mark Loan as Repaid';
    this.modalBody = `Are you sure you want to mark loan ${loan.customerId} as repaid?`;
    this.modalConfirmText = 'Confirm';
    this.modalCancelText = 'Cancel';
    this.modalAction = 'change';
    this.editingLoanId = loan.customerId;
    const modal = new bootstrap.Modal(document.getElementById('genericModal'));
    modal.show();
  }

  markAsRepaidConfirm(loan: Loan): void {
    this.loading = true;

    
  }

  exportLoans(): void {
    // In a real application, this would generate a CSV/Excel file for download
    alert('Exporting loans data...');
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