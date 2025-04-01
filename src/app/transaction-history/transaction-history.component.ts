import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Transaction } from '../models/transaction.model';
import { TransactionService } from '../services/transaction.service';
import { DashboardService } from '../services/dashboard.service';
import { CurrencyService } from '../services/currency.service';
import { Router } from '@angular/router';
import { Currency } from '../models/currency.model';
import { HttpParams } from '@angular/common/http';
import { AlertService } from '../services/alert.service';
import { ConfirmationService } from '../services/confirmation.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize as rxjsFinalize } from 'rxjs/operators';
import { ReportsService } from '../reports.service';
import { TokenService } from '../services/token.service';
declare var bootstrap: any;

interface Statistics {
  totalExchanges : number;
  completedTransactions : number;
  pendingTransactions : number;
  canceledTransactions : number;
}

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
  nameCompany: string = '';
  addressCompany: string = '';
  phoneCompany: string = '';
  emailCompany: string = '';

  // Currencies
  currencies: Currency[] = [];

  // Recent activities log
  recentActivities: any[] = [];
  recentReportsWithType() {
    this.reportsService.recentReportsWithType("transaction").subscribe(
      (res) => {
        this.recentActivities = res.result;
      },
      (err) => {
        console.error(err);
      }
    );
  }

  constructor(
    private transactionService: TransactionService,
    private dashboardService: DashboardService,
    private currencyService: CurrencyService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private reportsService: ReportsService,
    private token: TokenService
  ) { }

  getNameCompany(): string {
    const company = this.token.getCompanyWithToken();
    return company?.name ?? '';
  }

  getAddressCompany(): string {
    const company = this.token.getCompanyWithToken();
    return company?.address ?? '';
  }

  getPhoneCompany(): string {
    const company = this.token.getCompanyWithToken();
    return company?.phone ?? '';
  }

  getEmail(): string{
    const company = this.token.getCompanyWithToken();
    return company?.email ?? '';
  }

  showSuccess: boolean = false;
  showReceipt: boolean = false;

  generateReceipt(): void {
    this.showSuccess = false;
    this.showReceipt = true;
  }

  ngOnInit(): void {
    this.loading = true;
    this.loadTransactions();
    this.loadCurrencies();
    this.recentReportsWithType();

    this.nameCompany = this.getNameCompany();
    this.addressCompany = this.getAddressCompany();
    this.phoneCompany = this.getPhoneCompany();
    this.emailCompany = this.getEmail();

    // For opening modals when viewing transaction details
    document.addEventListener('DOMContentLoaded', () => {
      const modalEl = document.getElementById('transactionDetailModal');
      if (modalEl) {
        new bootstrap.Modal(modalEl);
      }
    });
  }
  loading: boolean = true;
  loading1: boolean = true;

  // Modified loadTransactions method
  loadTransactions(): void {
    this.loading = true;

    this.transactionService.getTransactions().subscribe({
      next: (data: any) => {
        if (data && data.result) {
          // Set the transactions from the content array
          this.transactions = data.result.content || [];

          // Ensure totalPages is set correctly
          this.totalPages = data.result.totalPages || 1;

          this.calculateStatistics();
          this.applyFilters();

          this.loadFilteredTransactions();
        }

        // Always set loading to false regardless of condition
        this.loading = false;
      },
      error: (e) => {
        console.error("Error loading transactions:", e);
        this.loading = false;
      }
    });
  }

  loadCurrencies(): void {
    this.loading1 = true;
    this.currencyService.getCurrencies().subscribe({
      next: (response) => {
        if (response && response.result) {
          this.currencies = response.result;
          console.log("Currencies loaded:", this.currencies);

          // Only proceed if we have currencies
          if (this.currencies && this.currencies.length > 0) {
            // Set default currencies if they exist in the loaded data
            const usdCurrency = this.currencies.find(c => c.code === 'USD');
            const madCurrency = this.currencies.find(c => c.code === 'MAD');
          }
        } else {
          console.error("No currencies returned from API");
        }
        this.loading1 = false;
      },
      error: (err) => {
        console.error("Error loading currencies:", err);
        this.loading1 = false;
      },
      complete: () => {
        this.loading1 = false;
      }
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

  statics : Statistics = {
    totalExchanges : 0,
    completedTransactions : 0,
    pendingTransactions : 0,
    canceledTransactions : 0
  }

  calculateStatistics(): void {
    // this.totalTransactions = this.transactions.length;
    // this.completedTransactions = this.transactions.filter(t => t.status === 'COMPLETED').length;
    // this.pendingTransactions = this.transactions.filter(t => t.status === 'PENDING').length;
    // this.canceledTransactions = this.transactions.filter(t => t.status === 'CANCELED').length;
    this.transactionService.calculateStatistics().subscribe(
      (res) => {
        this.statics = res.result;
      },
      (err) => {
        console.error(err);
      }
    );


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
    this.loadFilteredTransactions();
  }

  onStatusChange(status: string): void {
    this.statusFilter = status;
    this.currentPage = 1;
    this.loadFilteredTransactions();
  }

  onDateChange(): void {
    this.currentPage = 1;
    this.loadFilteredTransactions();
  }

  onCurrencyChange(): void {
    this.currentPage = 1;
    this.loadFilteredTransactions();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.dateFilter = '';
    this.currencyFilter = 'all';
    this.currentPage = 1;
    this.loadTransactions();
  }

  loadFilteredTransactions(): void {
    this.loading = true;

    // Build query parameters for the API
    const params = new HttpParams()
      .set('page', (this.currentPage - 1).toString()) // Convert to 0-based for backend
      .set('size', this.itemsPerPage.toString());

    // Add filters if they exist
    const filters: any = {};
    let hasFilters = false;

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      filters.searchTerm = this.searchTerm;
      hasFilters = true;
    }

    if (this.statusFilter && this.statusFilter !== 'all') {
      filters.status = this.statusFilter;
      hasFilters = true;
    }

    if (this.dateFilter) {
      filters.date = this.dateFilter;
      hasFilters = true;
    }

    if (this.currencyFilter && this.currencyFilter !== 'all') {
      filters.currency = this.currencyFilter;
      hasFilters = true;
    }

    // Call transaction service with filters
    this.transactionService.getFilteredTransactionss(this.currentPage - 1, this.itemsPerPage, filters)
      .subscribe({
        next: (response) => {
          // Update component with paginated data
          const pageData = response.result;

          this.transactions = pageData.content || [];
          this.filteredTransactions = pageData.content || [];

          // Update pagination info
          this.totalPages = pageData.totalPages || 1;
          this.paginationInfo = {
            from: pageData.numberOfElements > 0 ? pageData.number * pageData.size + 1 : 0,
            to: Math.min((pageData.number + 1) * pageData.size, pageData.totalElements),
            total: pageData.totalElements || 0
          };

          this.loading = false;
          this.calculateStatistics();
        },
        error: (error) => {
          console.error('Error loading filtered transactions:', error);
          this.loading = false;
          // Optionally show error message to user
        }
      });
  }

  // Update your goToPage method
  goToPage(page: number | string): void {
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;

    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= this.totalPages) {
      this.currentPage = pageNum;

      // Check if filters are applied
      if (this.searchTerm || this.statusFilter !== 'all' || this.dateFilter || this.currencyFilter !== 'all') {
        this.loadFilteredTransactions();
      } else {
        this.loadTransactions();
      }
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

  downloadExcel(list: any[]): void {
    this.transactionService.exportExcel(list).subscribe({
      next: (response: Blob) => {
        // Crear URL del objeto Blob
        const url = window.URL.createObjectURL(response);

        // Crear un elemento de enlace temporal
        const a = document.createElement('a');
        a.href = url;

        // Generar nombre de archivo con timestamp
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
        a.download = `transactions_${date}.xlsx`;

        // Anexar al documento, hacer clic y luego eliminar
        document.body.appendChild(a);
        a.click();

        // Limpiar
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Opcional: Mostrar un mensaje de éxito
        // this.showSuccessMessage('Excel file downloaded successfully');
        // alert('Excel file downloaded successfully');
      },
      error: (error) => {
        console.error('Error downloading Excel file:', error);
        // this.showErrorMessage('Failed to download Excel file');
        alert('Failed to download Excel');
      }
    });
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
        this.downloadExcel(this.selectedTransactions.map(t => t.id))
        break;
      case 'delete':
        this.confirmationService.confirm({
          title: 'Confirm Delete',
          message: `Are you sure you want to delete ${this.selectedTransactions.length} transaction(s)?`,
          type: 'danger',
          confirmText: 'Delete',
          cancelText: 'Cancel'
        }).then(confirmed => {
          if (confirmed) {  // Solo procede si el usuario confirma
            this.transactionService.deleteTransactions(this.selectedTransactions.map(t => t.id)).subscribe({
              next: (response) => {
                if (response) {
                  // Remove the transactions from the array
                  this.transactions = this.transactions.filter(t => !this.selectedTransactions.includes(t));
                  this.calculateStatistics();
                  this.applyFilters();
                  this.alertService.success('Transactions deleted successfully');
                  this.selectedTransactions = []; // Clear selection
                }
              },
              error: (error) => {
                console.error('Error deleting transactions', error);
                this.alertService.error('Failed to delete transactions');
              }
            });
          }
        }).catch(error => {
          console.error('Confirmation error', error);
        });
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

  // In your transaction-history.component.ts file

  // Add this property to store the receipt data
  receiptData: any = null;

  // Updated printReceipt method
  printReceipt(transaction: Transaction): void {
    // Prepare receipt data from the transaction
    this.receiptData = {
      receiptId: transaction.id,
      date: transaction.createdAt || transaction.date,
      customerName: transaction.customerName,
      idNumber: transaction.customerID || 'N/A',
      fromCurrency: transaction.fromCurrency,
      toCurrency: transaction.toCurrency,
      exchangeRate: transaction.exchangeRate,
      fromAmount: transaction.fromAmount,
      toAmount: transaction.toAmount,
      fee: transaction.fee || 0,
      serviceCharge: 0,
      // totalPaid: transaction.fromAmount + (transaction.fee || 0) + (transaction.serviceCharge || 0)
    };

    // Show the receipt modal
    this.showReceipt = true;
  }

  // Add this method to close the receipt
  closeReceipt(): void {
    this.showReceipt = false;
  }

  // Add print functionality
  printReceiptDocument(): void {
    // Create a copy of the receipt for printing
    const printContents = document.querySelector('.receipt')?.innerHTML;
    if (printContents) {
      const originalContents = document.body.innerHTML;
      this.closeReceipt()

      // Open a new window with just the receipt
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(`
        <html>
          <head>
            <title>Transaction Receipt</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
            <style>
              body { padding: 20px; }
              .receipt { max-width: 400px; margin: 0 auto; }
              .border-dashed { border-style: dashed !important; }
              @media print {
                body { padding: 0; }
                .btn { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="receipt">${printContents}</div>
              <div class="text-center mt-4">
                <button class="btn btn-primary" onclick="window.print();">Print</button>
              </div>
            </div>
          </body>
        </html>
      `);
        printWindow.document.close();
      }
    }
  }



  printReceipt1(transaction: Transaction): void {
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


  selectedFile?: File | null = null;
  importing: boolean = false;
  uploadProgress: number = 0;
  uploadMessage: string = '';
  uploadSuccess: boolean = false;
  importModal: any;

  openImportModal(): void {

    this.resetImportState();
    if (this.importModal) {
      this.importModal.show();
    } else {
      // Fallback if modal isn't initialized yet
      this.importModal = new bootstrap.Modal(this.modalElement.nativeElement);
      this.importModal.show();
    }
  }

  resetImportState(): void {
    this.selectedFile = null;
    this.importing = false;
    this.uploadProgress = 0;
    this.uploadMessage = '';
    this.uploadSuccess = false;
  }

  @ViewChild('importModal') modalElement!: ElementRef;

  ngAfterViewInit(): void {
    // Initialize modal after view is initialized and DOM element is available
    setTimeout(() => {
      this.importModal = new bootstrap.Modal(this.modalElement.nativeElement);
    });
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      this.selectedFile = files[0];

      // Validate file type
      const fileExt = this.selectedFile?.name.split('.').pop()?.toLowerCase();
      if (fileExt !== 'xlsx' && fileExt !== 'xls') {
        this.uploadMessage = 'Please select an Excel file (.xlsx or .xls)';
        this.uploadSuccess = false;
        this.selectedFile = null;
      } else {
        this.uploadMessage = '';
      }
    }
  }

  importTransactions(): void {
    if (!this.selectedFile) {
      this.alertService.error('Please select a file to import');
      return;
    }

    this.importing = true;
    this.uploadProgress = 0;
    this.uploadMessage = '';

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.transactionService.importTransactions(formData)
      .pipe(
        finalize(() => {
          this.importing = false;
          this.loadTransactions();
          this.resetImportState()
        })
      )
      .subscribe(
        (event: any) => {
          // Handle progress events if your backend supports it
          if (event.type === 'progress') {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          } else if (event.type === 'response') {
            this.uploadProgress = 100;
            this.uploadSuccess = true;
            this.uploadMessage = `Successfully imported ${event.body.count} transactions`;

            // Refresh the transactions list
            setTimeout(() => {
              this.refreshTransactions();
              this.importModal.hide();
              this.alertService.success(this.uploadMessage);
            }, 1500);
          }
        },
        (error) => {
          this.uploadSuccess = false;
          this.uploadMessage = error.error?.message || 'Error importing transactions';
          this.alertService.error(this.uploadMessage);
        }
      );
  }
}
function finalize(callback: () => void) {
  return rxjsFinalize(callback);
}
