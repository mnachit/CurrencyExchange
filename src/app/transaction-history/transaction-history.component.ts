import { Component, OnInit } from '@angular/core';
import { Transaction } from '../models/transaction.model';
import { TransactionService } from '../services/transaction.service';
import { DashboardService } from '../services/dashboard.service';
import { CurrencyService } from '../services/currency.service';
import { Router } from '@angular/router';
import { Currency } from '../models/currency.model';
declare var bootstrap: any;

@Component({
  selector: 'app-transaction-history',
  standalone: false,
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css']
})
export class TransactionHistoryComponent implements OnInit {
  // Transactions data
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  selectedTransaction: Transaction | null = null;
  selectedTransactions: Transaction[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  paginationInfo = {
    from: 0,
    to: 0,
    total: 0
  };

  // Filters
  searchTerm: string = '';
  statusFilter: string = 'all';
  dateFilter: string = '';
  currencyFilter: string = 'all';

  // Statistics
  totalTransactions: number = 0;
  completedTransactions: number = 0;
  pendingTransactions: number = 0;
  canceledTransactions: number = 0;
  todayVolume: number = 0;

  // Currencies
  currencies: Currency[] = [];

  // Recent activities log
  recentActivities: any[] = [
    {
      action: 'Transaction Completed',
      description: 'Ahmed Mohammed exchanged USD to EUR',
      time: new Date(),
      type: 'success',
      icon: 'fa-check-circle'
    },
    {
      action: 'New Transaction',
      description: 'Sara Abdullah created a new transaction',
      time: new Date(new Date().getTime() - 30 * 60000),
      type: 'primary',
      icon: 'fa-plus-circle'
    },
    {
      action: 'Rate Updated',
      description: 'USD to EUR rate changed from 0.92 to 0.91',
      time: new Date(new Date().getTime() - 60 * 60000),
      type: 'info',
      icon: 'fa-sync-alt'
    },
    {
      action: 'Transaction Canceled',
      description: 'Khalid Omar canceled transaction #TX123451',
      time: new Date(new Date().getTime() - 2 * 60 * 60000),
      type: 'danger',
      icon: 'fa-times-circle'
    }
  ];

  constructor(
    private transactionService: TransactionService,
    private dashboardService: DashboardService,
    private currencyService: CurrencyService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadTransactions();
    this.loadCurrencies();

    // For opening modals when viewing transaction details
    document.addEventListener('DOMContentLoaded', () => {
      const modalEl = document.getElementById('transactionDetailModal');
      if (modalEl) {
        new bootstrap.Modal(modalEl);
      }
    });
  }

  loadTransactions(): void {
    this.transactionService.getTransactions().subscribe
    ({
      next: (data: any) => {
        this.transactions = data.result;
        console.log("transactions",this.transactions);
        
        this.calculateStatistics();
        this.applyFilters();
      },
      error: (e) => 
      {
        
      }
    });
  }

  loadCurrencies(): void {
    this.currencyService.getCurrencies().subscribe(data => {
      this.currencies = data;
    });
  }

  refreshTransactions(): void {
    // Show loading state
    this.filteredTransactions = [];

    // Refresh transactions data
    setTimeout(() => {
      this.loadTransactions();

      // Add activity log
      this.recentActivities.unshift({
        action: 'Data Refreshed',
        description: 'Transaction list was refreshed',
        time: new Date(),
        type: 'primary',
        icon: 'fa-sync-alt'
      });

      // Keep only the most recent 10 activities
      if (this.recentActivities.length > 10) {
        this.recentActivities.pop();
      }
    }, 800);
  }

  calculateStatistics(): void {
    this.totalTransactions = this.transactions.length;
    this.completedTransactions = this.transactions.filter(t => t.status === 'COMPLETED').length;
    this.pendingTransactions = this.transactions.filter(t => t.status === 'PENDING').length;
    this.canceledTransactions = this.transactions.filter(t => t.status === 'CANCELED').length;

    // Calculate today's volume (all transactions from today in USD equivalent)
    const today = new Date();
    const todayTransactions = this.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getDate() === today.getDate() &&
        transactionDate.getMonth() === today.getMonth() &&
        transactionDate.getFullYear() === today.getFullYear();
    });

    // Simple conversion to USD for demo purposes
    this.todayVolume = todayTransactions.reduce((total, transaction) => {
      // Convert everything to USD equivalent for simplicity
      let amountInUSD = transaction.fromAmount;

      if (transaction.fromCurrency === 'EUR') {
        amountInUSD = transaction.fromAmount * 1.09;
      } else if (transaction.fromCurrency === 'GBP') {
        amountInUSD = transaction.fromAmount * 1.28;
      } else if (transaction.fromCurrency === 'SAR') {
        amountInUSD = transaction.fromAmount * 0.27;
      } else if (transaction.fromCurrency === 'AED') {
        amountInUSD = transaction.fromAmount * 0.27;
      }

      return total + amountInUSD;
    }, 0);
  }

  applyFilters(): void {
    // Apply search filter
    let filtered = this.transactions;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.customerName.toLowerCase().includes(term) ||
        t.id.toLowerCase().includes(term) ||
        t.fromCurrency.toLowerCase().includes(term) ||
        t.toCurrency.toLowerCase().includes(term) ||
        (t.customerID && t.customerID.toLowerCase().includes(term)) ||
        (t.notes && t.notes.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === this.statusFilter);
    }

    // Apply date filter
    if (this.dateFilter) {
      const filterDate = new Date(this.dateFilter);
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === filterDate.getFullYear() &&
          transactionDate.getMonth() === filterDate.getMonth() &&
          transactionDate.getDate() === filterDate.getDate();
      });
    }

    // Apply currency filter
    if (this.currencyFilter !== 'all') {
      filtered = filtered.filter(t =>
        t.fromCurrency === this.currencyFilter ||
        t.toCurrency === this.currencyFilter
      );
    }

    // Update pagination info
    this.paginationInfo.total = filtered.length;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);

    // Get items for current page
    const startItem = (this.currentPage - 1) * this.itemsPerPage;
    const endItem = Math.min(startItem + this.itemsPerPage, filtered.length);

    this.paginationInfo.from = filtered.length > 0 ? startItem + 1 : 0;
    this.paginationInfo.to = endItem;

    this.filteredTransactions = filtered.slice(startItem, endItem);

    // Clear selection when filters change
    this.selectedTransactions = [];
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

  onDateChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onCurrencyChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.dateFilter = '';
    this.currencyFilter = 'all';
    this.currentPage = 1;
    this.applyFilters();
  }

  goToPage(page: number | string): void {
    // Convert page to number if it's a numeric string
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    
    // Only proceed if pageNum is a valid number
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= this.totalPages) {
      this.currentPage = pageNum;
      this.applyFilters();
    }
  }

  // Creates smart pagination array with ellipsis
  getPaginationArray(): (number | string)[] {
    if (this.totalPages <= 7) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    if (this.currentPage > 3) {
      pages.push('...');
    }

    // Show pages around current page
    const startPage = Math.max(2, this.currentPage - 1);
    const endPage = Math.min(this.totalPages - 1, this.currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (this.currentPage < this.totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    pages.push(this.totalPages);

    return pages;
  }

  formatAmount(amount: number | undefined, currency: string): string {
    // Provide a default value of 0 if amount is undefined
    const safeAmount = amount ?? 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(safeAmount);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'badge-completed';
      case 'PENDING': return 'badge-pending';
      case 'CANCELED': return 'badge-canceled';
      default: return '';
    }
  }

  getStatusIconClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'fa-check-circle';
      case 'PENDING': return 'fa-clock';
      case 'CANCELED': return 'fa-times-circle';
      default: return 'fa-circle';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'bg-success';
      case 'PENDING': return 'bg-warning';
      case 'CANCELED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  // Handle bulk actions on selected transactions
  bulkAction(action: string): void {
    if (this.selectedTransactions.length === 0) {
      return;
    }

    switch (action) {
      case 'print':
        alert(`Printing ${this.selectedTransactions.length} transaction receipts`);
        break;
      case 'export':
        alert(`Exporting ${this.selectedTransactions.length} transactions as CSV`);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${this.selectedTransactions.length} transactions?`)) {
          // In a real app, call service to delete transactions
          this.transactions = this.transactions.filter(
            t => !this.selectedTransactions.includes(t)
          );
          this.calculateStatistics();
          this.applyFilters();

          // Add to activity log
          this.recentActivities.unshift({
            action: 'Bulk Delete',
            description: `${this.selectedTransactions.length} transactions were deleted`,
            time: new Date(),
            type: 'danger',
            icon: 'fa-trash'
          });

          this.selectedTransactions = [];
        }
        break;
    }
  }

  // Selection methods
  toggleSelect(transaction: Transaction): void {
    if (this.isSelected(transaction)) {
      this.selectedTransactions = this.selectedTransactions.filter(t => t.id !== transaction.id);
    } else {
      this.selectedTransactions.push(transaction);
    }
  }

  isSelected(transaction: Transaction): boolean {
    return this.selectedTransactions.some(t => t.id === transaction.id);
  }

  toggleSelectAll(): void {
    if (this.areAllSelected()) {
      this.selectedTransactions = [];
    } else {
      this.selectedTransactions = [...this.filteredTransactions];
    }
  }

  areAllSelected(): boolean {
    return this.filteredTransactions.length > 0 &&
      this.selectedTransactions.length === this.filteredTransactions.length;
  }

  // Get customer initials for avatar
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  viewTransaction(transaction: Transaction): void {
    this.selectedTransaction = transaction;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('transactionDetailModal'));
    modal.show();
  }

  editTransaction(transaction: Transaction): void {
    // In a real application, this would navigate to edit page or show edit modal
    alert(`Editing transaction: ${transaction.id}`);
  }

  deleteTransaction(transaction: Transaction): void {
    // In a real application, this would show a confirmation dialog
    if (confirm(`Are you sure you want to delete transaction ${transaction.id}?`)) {
      // Remove the transaction from the array
      this.transactions = this.transactions.filter(t => t.id !== transaction.id);
      this.calculateStatistics();
      this.applyFilters();

      // Add to activity log
      this.recentActivities.unshift({
        action: 'Transaction Deleted',
        description: `Transaction ${transaction.id} was deleted`,
        time: new Date(),
        type: 'danger',
        icon: 'fa-trash'
      });
    }
  }

  exportTransactions(format: string = 'csv'): void {
    // In a real application, this would generate a file for download
    alert(`Exporting transactions in ${format.toUpperCase()} format...`);

    // Add to activity log
    this.recentActivities.unshift({
      action: 'Report Exported',
      description: `Transactions exported in ${format.toUpperCase()} format`,
      time: new Date(),
      type: 'info',
      icon: 'fa-file-export'
    });
  }

  printReceipt(transaction: Transaction): void {
    // In a real app, would generate a printable receipt
    alert(`Printing receipt for transaction ${transaction.id}`);
  }

  markAsFavorite(transaction: Transaction): void {
    // In a real app, would mark a transaction as favorite for quick access
    alert(`Transaction ${transaction.id} marked as favorite`);
  }

  sendNotification(transaction: Transaction): void {
    // In a real app, would send email/SMS notification to customer
    alert(`Sending notification to ${transaction.customerName} for transaction ${transaction.id}`);
  }

  changeStatus(transaction: Transaction, newStatus: string): void {
    // In a real app, would call a service to update the transaction status

    const index = this.transactions.findIndex(t => t.id === transaction.id);
    if (index !== -1) {
      this.transactions[index] = {
        ...this.transactions[index],
        status: newStatus as 'COMPLETED' | 'PENDING' | 'CANCELED'
      };

      // Update the selected transaction as well
      if (this.selectedTransaction && this.selectedTransaction.id === transaction.id) {
        this.selectedTransaction = this.transactions[index];
      }

      this.calculateStatistics();
      this.applyFilters();

      // Add to activity log
      this.recentActivities.unshift({
        action: 'Status Changed',
        description: `Transaction ${transaction.id} marked as ${newStatus}`,
        time: new Date(),
        type: newStatus === 'COMPLETED' ? 'success' : (newStatus === 'CANCELED' ? 'danger' : 'warning'),
        icon: newStatus === 'COMPLETED' ? 'fa-check-circle' : (newStatus === 'CANCELED' ? 'fa-times-circle' : 'fa-clock')
      });

      alert(`Transaction ${transaction.id} has been marked as ${newStatus}`);
    }
  }
}