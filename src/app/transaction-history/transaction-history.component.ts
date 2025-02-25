import { Component, OnInit } from '@angular/core';
import { Transaction } from '../models/transaction.model';

@Component({
  selector: 'app-transaction-history',
  standalone: false,
  templateUrl: './transaction-history.component.html',
  styleUrl: './transaction-history.component.css'
})
export class TransactionHistoryComponent implements OnInit {
  // Sidebar state
  sidebarVisible: boolean = true;
  
  // Live rate data
  liveRates: any[] = [
    { pair: 'USD/EUR', value: 0.92, change: -0.02 },
    { pair: 'USD/GBP', value: 0.78, change: 0.01 },
    { pair: 'USD/SAR', value: 3.75, change: 0 },
    { pair: 'USD/AED', value: 3.67, change: -0.01 }
  ];

  // Transaction data
  transactions: Transaction[] = [
    {
      id: 'TX123456',
      date: new Date(2025, 1, 24, 11, 42),
      customerName: 'Ahmed Mohammed',
      fromCurrency: 'USD',
      fromAmount: 2000,
      toCurrency: 'EUR',
      toAmount: 1842.5,
      status: 'completed',
      customerID: 'CUS001',
      exchangeRate: 0.9212,
      fee: 15.00,
      notes: 'Business travel purposes'
    },
    {
      id: 'TX123455',
      date: new Date(2025, 1, 24, 10, 28),
      customerName: 'Sara Abdullah',
      fromCurrency: 'EUR',
      fromAmount: 1150,
      toCurrency: 'GBP',
      toAmount: 985.2,
      status: 'completed',
      customerID: 'CUS002',
      exchangeRate: 0.8567,
      fee: 10.50,
      notes: 'Personal transfer'
    },
    {
      id: 'TX123454',
      date: new Date(2025, 1, 24, 9, 15),
      customerName: 'Khalid Omar',
      fromCurrency: 'SAR',
      fromAmount: 8812.5,
      toCurrency: 'USD',
      toAmount: 2350,
      status: 'completed',
      customerID: 'CUS003',
      exchangeRate: 0.2667,
      fee: 20.25,
      notes: 'Investment'
    },
    {
      id: 'TX123453',
      date: new Date(2025, 1, 23, 16, 32),
      customerName: 'Fatima Al-Saud',
      fromCurrency: 'AED',
      fromAmount: 1835,
      toCurrency: 'USD',
      toAmount: 500,
      status: 'completed',
      customerID: 'CUS004',
      exchangeRate: 0.2724,
      fee: 5.75,
      notes: 'Tuition payment'
    },
    {
      id: 'TX123452',
      date: new Date(2025, 1, 23, 15, 17),
      customerName: 'Mohammed Al-Harbi',
      fromCurrency: 'USD',
      fromAmount: 5000,
      toCurrency: 'SAR',
      toAmount: 18750,
      status: 'pending',
      customerID: 'CUS005',
      exchangeRate: 3.75,
      fee: 25.00,
      notes: 'Requires compliance review'
    },
    {
      id: 'TX123451',
      date: new Date(2025, 1, 23, 12, 17),
      customerName: 'Layla Mahmoud',
      fromCurrency: 'GBP',
      fromAmount: 3000,
      toCurrency: 'USD',
      toAmount: 3840,
      status: 'canceled',
      customerID: 'CUS006',
      exchangeRate: 1.28,
      fee: 18.50,
      notes: 'Customer canceled - high amount'
    }
  ];

  // Filtered transactions
  filteredTransactions: Transaction[] = [];
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  // Filters
  searchTerm: string = '';
  statusFilter: string = 'all';
  dateFilter: string = '';
  
  // Statistics
  totalTransactions: number = 0;
  completedTransactions: number = 0;
  pendingTransactions: number = 0;
  canceledTransactions: number = 0;
  todayVolume: number = 0;
  
  // Notifications
  notifications: any[] = [
    { type: 'rate', message: 'USD to EUR rate has dropped by 0.5%', time: '10 minutes ago', icon: 'chart-line', bgClass: 'bg-primary' },
    { type: 'transaction', message: 'Transaction TX123457 completed', time: '35 minutes ago', icon: 'check-circle', bgClass: 'bg-success' },
    { type: 'compliance', message: 'Compliance review required for TX123452', time: '1 hour ago', icon: 'exclamation-triangle', bgClass: 'bg-warning' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.calculateStatistics();
    this.applyFilters();
  }

  calculateStatistics(): void {
    this.totalTransactions = this.transactions.length;
    this.completedTransactions = this.transactions.filter(t => t.status === 'completed').length;
    this.pendingTransactions = this.transactions.filter(t => t.status === 'pending').length;
    this.canceledTransactions = this.transactions.filter(t => t.status === 'canceled').length;
    
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

    // Apply date filter (simple implementation)
    if (this.dateFilter) {
      const filterDate = new Date(this.dateFilter);
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === filterDate.getFullYear() &&
          transactionDate.getMonth() === filterDate.getMonth() &&
          transactionDate.getDate() === filterDate.getDate();
      });
    }

    // Pagination
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);

    // Get items for current page
    const startItem = (this.currentPage - 1) * this.itemsPerPage;
    const endItem = startItem + this.itemsPerPage;
    this.filteredTransactions = filtered.slice(startItem, endItem);
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

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  formatAmount(amount: number | undefined, currency: string): string {
    // Provide a default value of 0 if amount is undefined
    const safeAmount = amount ?? 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(safeAmount);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'badge bg-success';
      case 'pending': return 'badge bg-warning text-dark';
      case 'canceled': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  viewTransaction(transaction: Transaction): void {
    // In a real application, this would show a modal with transaction details
    console.log('View transaction', transaction);
  }

  editTransaction(transaction: Transaction): void {
    // In a real application, this would navigate to edit page or show edit modal
    console.log('Edit transaction', transaction);
  }

  deleteTransaction(transaction: Transaction): void {
    // In a real application, this would show a confirmation dialog
    if (confirm(`Are you sure you want to delete transaction ${transaction.id}?`)) {
      // Remove the transaction from the array
      this.transactions = this.transactions.filter(t => t.id !== transaction.id);
      this.calculateStatistics();
      this.applyFilters();
    }
  }

  exportTransactions(format: string = 'csv'): void {
    // In a real application, this would generate a file for download based on format
    alert(`Exporting transactions in ${format.toUpperCase()} format...`);
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  showRateCalculator(): void {
    // In a real application, this would open a rate calculator modal
    alert('Opening rate calculator...');
  }

  newTransaction(): void {
    // In a real application, this would navigate to new transaction page or show a modal
    alert('Creating new transaction...');
  }

  getExchangeRate(fromCurrency: string, toCurrency: string): number {
    // This would typically be a call to an API or service in a real application
    const rates: {[key: string]: {[key: string]: number}} = {
      'USD': { 'EUR': 0.92, 'GBP': 0.78, 'SAR': 3.75, 'AED': 3.67 },
      'EUR': { 'USD': 1.09, 'GBP': 0.85, 'SAR': 4.08, 'AED': 4.00 },
      'GBP': { 'USD': 1.28, 'EUR': 1.18, 'SAR': 4.80, 'AED': 4.70 },
      'SAR': { 'USD': 0.27, 'EUR': 0.25, 'GBP': 0.21, 'AED': 0.98 },
      'AED': { 'USD': 0.27, 'EUR': 0.25, 'GBP': 0.21, 'SAR': 1.02 }
    };
    
    return rates[fromCurrency]?.[toCurrency] || 1;
  }

  calculateConvertedAmount(amount: number, fromCurrency: string, toCurrency: string): number {
    const rate = this.getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  }

  getTransactionFee(amount: number, fromCurrency: string, toCurrency: string): number {
    // Simple fee calculation (in a real app would be more complex)
    const basePercentage = 0.5; // 0.5% base fee
    let fee = amount * (basePercentage / 100);
    
    // Minimum fee
    const minFee = 5;
    if (fee < minFee) {
      fee = minFee;
    }
    
    return Math.round(fee * 100) / 100;
  }

  getTotalCost(amount: number, fee: number): number {
    return amount + fee;
  }

  getRateChange(currency1: string, currency2: string): number {
    // In a real app, this would calculate the change from historical data
    const pair = `${currency1}/${currency2}`;
    const rateInfo = this.liveRates.find(r => r.pair === pair);
    return rateInfo ? rateInfo.change : 0;
  }

  markAsFavorite(transaction: Transaction): void {
    // In a real app, would mark a transaction as favorite for quick access
    alert(`Transaction ${transaction.id} marked as favorite`);
  }

  printReceipt(transaction: Transaction): void {
    // In a real app, would generate a printable receipt
    alert(`Printing receipt for transaction ${transaction.id}`);
  }

  sendNotification(transaction: Transaction): void {
    // In a real app, would send email/SMS notification to customer
    alert(`Sending notification to ${transaction.customerName} for transaction ${transaction.id}`);
  }
}