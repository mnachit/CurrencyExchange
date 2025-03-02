import { Component, OnInit } from '@angular/core';
import { Loan } from '../models/loan.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-loan-management',
  standalone: false,
  templateUrl: './loan-management.component.html',
  styleUrl: './loan-management.component.css'
})
export class LoanManagementComponent implements OnInit {
  loans: Loan[] = [
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

  filteredLoans: Loan[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  searchTerm: string = '';
  statusFilter: string = 'all';

  showNewLoanForm: boolean = false;
  loanForm: FormGroup;
  formMode: 'add' | 'edit' = 'add';
  editingLoanId: string | null = null;

  constructor(private fb: FormBuilder) {
    this.loanForm = this.fb.group({
      customerName: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      currency: ['USD', Validators.required],
      issueDate: [new Date().toISOString().split('T')[0], Validators.required],
      dueDate: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    // Apply search filter
    let filtered = this.loans;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(loan =>
        loan.customerName.toLowerCase().includes(term) ||
        loan.id.toLowerCase().includes(term) ||
        loan.currency.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(loan => loan.status === this.statusFilter);
    }

    // Pagination
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);

    // Get items for current page
    const startItem = (this.currentPage - 1) * this.itemsPerPage;
    const endItem = startItem + this.itemsPerPage;
    this.filteredLoans = filtered.slice(startItem, endItem);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onStatusChange(status: string): void {
    this.statusFilter = status;
    this.currentPage = 1;
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'badge bg-warning text-dark';
      case 'repaid': return 'badge bg-success';
      case 'overdue': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  openNewLoanForm(): void {
    this.resetForm();
    this.formMode = 'add';
    this.showNewLoanForm = true;
  }

  cancelForm(): void {
    this.showNewLoanForm = false;
  }

  resetForm(): void {
    this.loanForm.reset({
      customerName: '',
      amount: '',
      currency: 'USD',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      notes: ''
    });
    this.editingLoanId = null;
  }

  saveLoan(): void {
    if (this.loanForm.valid) {
      const formValues = this.loanForm.value;

      if (this.formMode === 'add') {
        // Generate a new loan ID
        const loanId = 'L' + Math.floor(Math.random() * 100000).toString().padStart(5, '0');

        const newLoan: Loan = {
          id: loanId,
          customerName: formValues.customerName,
          amount: formValues.amount,
          currency: formValues.currency,
          issueDate: new Date(formValues.issueDate),
          dueDate: new Date(formValues.dueDate),
          status: 'active'
        };

        this.loans.unshift(newLoan);
      } else if (this.editingLoanId) {
        // Find and update the existing loan
        const index = this.loans.findIndex(loan => loan.id === this.editingLoanId);
        if (index !== -1) {
          this.loans[index] = {
            ...this.loans[index],
            customerName: formValues.customerName,
            amount: formValues.amount,
            currency: formValues.currency,
            issueDate: new Date(formValues.issueDate),
            dueDate: new Date(formValues.dueDate)
          };
        }
      }

      this.applyFilters();
      this.showNewLoanForm = false;
    } else {
      // Mark all form controls as touched to trigger validation messages
      Object.keys(this.loanForm.controls).forEach(key => {
        this.loanForm.get(key)?.markAsTouched();
      });
    }
  }

  viewLoan(loan: Loan): void {
    // In a real application, this would show a modal with loan details
    console.log('View loan', loan);
  }

  editLoan(loan: Loan): void {
    this.formMode = 'edit';
    this.editingLoanId = loan.id;

    this.loanForm.setValue({
      customerName: loan.customerName,
      amount: loan.amount,
      currency: loan.currency,
      issueDate: loan.issueDate.toISOString().split('T')[0],
      dueDate: loan.dueDate.toISOString().split('T')[0],
      notes: ''
    });

    this.showNewLoanForm = true;
  }

  deleteLoan(loan: Loan): void {
    // In a real application, this would show a confirmation dialog
    if (confirm(`Are you sure you want to delete loan ${loan.id}?`)) {
      // Remove the loan from the array
      this.loans = this.loans.filter(l => l.id !== loan.id);
      this.applyFilters();
    }
  }

  markAsRepaid(loan: Loan): void {
    const index = this.loans.findIndex(l => l.id === loan.id);
    if (index !== -1) {
      this.loans[index] = {
        ...this.loans[index],
        status: 'repaid'
      };
      this.applyFilters();
    }
  }
}