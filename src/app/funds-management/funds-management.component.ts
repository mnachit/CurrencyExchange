import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FundsManagementService } from '../services/funds-management.service';
import { finalize } from 'rxjs/operators';
import { Currency, Funds, OperationFunds, User } from '../models/funds.mode';
import { TranslatePipe } from '../pipe/translate.pipe';
import { LanguageService } from '../services/language.service';

// Define currency type to fix index signature errors
type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'MAD' | 'SAR' | 'AED';

const CONVERSION_RATES: Record<CurrencyCode, Record<CurrencyCode, number>> = {
  USD: { USD: 1, EUR: 0.92, GBP: 0.79, MAD: 10.05, SAR: 3.75, AED: 3.67 },
  EUR: { USD: 1.09, EUR: 1, GBP: 0.86, MAD: 10.91, SAR: 4.07, AED: 3.98 },
  GBP: { USD: 1.27, EUR: 1.16, GBP: 1, MAD: 12.69, SAR: 4.73, AED: 4.63 },
  MAD: { USD: 0.10, EUR: 0.09, GBP: 0.08, MAD: 1, SAR: 0.37, AED: 0.36 },
  SAR: { USD: 0.27, EUR: 0.25, GBP: 0.21, MAD: 2.70, SAR: 1, AED: 0.98 },
  AED: { USD: 0.27, EUR: 0.25, GBP: 0.22, MAD: 2.77, SAR: 1.02, AED: 1 }
};

interface ConfirmationData {
  operationFunds: OperationFunds;
  amount: number;
  currency: Currency;
  notes?: string;
  date?: string;
}

@Component({
  selector: 'app-funds-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslatePipe,
    NgbDropdownModule
  ],
  templateUrl: './funds-management.component.html',
  styleUrls: ['./funds-management.component.css']
})
export class FundsManagementComponent implements OnInit {
  // Fund management form
  fundsForm: FormGroup;

  // Currently selected currency - default to MAD
  selectedCurrency: CurrencyCode = 'MAD';
  confirmationData: ConfirmationData | null = null;

  // Currency balances for each supported currency
  currencyBalances: Record<CurrencyCode, number> = {
    USD: 0,
    EUR: 0,
    GBP: 0,
    MAD: 0,
    SAR: 0,
    AED: 0
  };

  // Currency options for the display dropdown
  currencyDisplayOptions: CurrencyCode[] = ['MAD', 'USD', 'EUR', 'GBP', 'SAR', 'AED'];

  // Total available funds in selected currency equivalent
  get availableFunds(): number {
    return this.currencyBalances[this.selectedCurrency] || 0;
  }

  // Fund operation history
  fundOperations: Funds[] = [];

  // Statistics
  fundsStats = {
    totalAdded: 0,
    totalWithdrawn: 0,
    netChange: 0,
    startingBalance: 0
  };

  // Date filters
  dateFilter: string = 'all';
  customStartDate: string = '';
  customEndDate: string = '';

  // UI state
  loading: boolean = false;
  loadingOperations: boolean = false;
  loadingBalances: boolean = false;
  showConfirmation: boolean = false;
  errorMessage: string = '';

  // For the sparkline chart
  fundHistory: number[] = [];
  chartLabels: string[] = [];
  sparklineHeights: string[] = []; // Added to store pre-calculated heights

  constructor(private fb: FormBuilder, private fundsService: FundsManagementService, public languageService: LanguageService) {
    this.fundsForm = this.fb.group({
      operationFunds: [OperationFunds.ADD, Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      currency: [Currency.MAD, Validators.required], // Default to MAD
      notes: [''],
      date: [new Date().toISOString().split('T')[0]]
    });
  }

  ngOnInit(): void {
    // Initialize with loading animation
    this.loading = true;

    // Fetch available balances for the default currency (MAD)
    this.loadBalancesByCurrency(this.selectedCurrency);

    // Fetch fund operations
    this.loadFundOperations();
    const savedLanguage = this.languageService.getCurrentLanguage();
    this.languageService.setLanguage(savedLanguage);
  }

  /**
   * Load balances for a specific currency from the API
   */
  loadBalancesByCurrency(currencyCode: CurrencyCode): void {
    this.loadingBalances = true;

    const currencyRequest: Funds = {
      operationFunds: OperationFunds.ADD,
      currency: currencyCode as Currency,
      amount: 0,
    };

    this.fundsService.getAvailableBalanceWithCurrency(currencyRequest)
      .pipe(
        finalize(() => {
          this.loadingBalances = false;
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.result !== null && response.result !== undefined) {
            // The result is directly the balance, not a JSON object
            // Just update the selected currency's balance
            this.currencyBalances[currencyCode] = typeof response.result === 'string'
              ? parseFloat(response.result)
              : response.result;

            // Calculate statistics and chart data with the new balance
            this.calculateStatistics();
            this.generateChartData();
          }
        },
        error: (error) => {
          console.error('Error fetching balances:', error);
          this.errorMessage = 'Failed to load available balances';
        }
      });
  }

  /**
   * Load fund operations from the API
   */
  loadFundOperations(): void {
    this.loadingOperations = true;
    this.fundsService.getFundsManagement()
      .pipe(
        finalize(() => {
          this.loadingOperations = false;
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.result) {
            try {
              if (typeof response.result === 'string') {
                this.fundOperations = JSON.parse(response.result);
              } else {
                // If it's already an object, assign it directly
                this.fundOperations = response.result;
              }
              console.log('Fund operations:', this.fundOperations);

              this.calculateStatistics();
              this.generateChartData();
            } catch (error) {
              console.error('Error parsing fund operations data:', error);
              this.errorMessage = 'Failed to parse fund operations data';
            }
          }
        },
        error: (error) => {
          console.error('Error fetching fund operations:', error);
          this.errorMessage = 'Failed to load fund operations';
        }
      });
  }

  /**
   * Convert funds from one currency to another
   */
  convertFunds(amount: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode): number {
    const conversionRate = CONVERSION_RATES[fromCurrency][toCurrency];
    return amount * conversionRate;
  }

  /**
   * Update the selected currency when the user changes display currency
   */
  updateDisplayCurrency(currency: CurrencyCode): void {
    this.selectedCurrency = currency;
    // Load balances for the new selected currency
    this.loadBalancesByCurrency(currency);
  }

  /**
   * Update the selected currency when the form currency changes
   */
  updateSelectedCurrency(): void {
    const currencyValue = this.fundsForm.get('currency')?.value;
    if (currencyValue && this.isCurrencyCode(currencyValue)) {
      this.selectedCurrency = currencyValue;
      // Load balances for the new selected currency
      this.loadBalancesByCurrency(currencyValue);
    }
  }

  /**
   * Type guard to ensure string is a valid currency code
   */
  isCurrencyCode(value: string): value is CurrencyCode {
    return ['USD', 'EUR', 'GBP', 'MAD', 'SAR', 'AED'].includes(value);
  }

  /**
   * Get the appropriate currency symbol
   */
  getCurrencySymbol(currency: string): string {
    switch (currency) {
      case Currency.USD: return '$';
      case Currency.EUR: return '€';
      case Currency.GBP: return '£';
      case Currency.MAD: return 'MAD';
      case Currency.SAR: return 'SAR';
      case Currency.AED: return 'AED';
      default: return '$';
    }
  }

  /**
   * Calculate statistics from fund operations
   */
  calculateStatistics(): void {
    // Filter operations that match the selected currency
    const currencyOperations = this.fundOperations.filter(op =>
      op.currency === this.selectedCurrency
    );

    this.fundsStats.totalAdded = currencyOperations
      .filter(op => op.operationFunds === OperationFunds.ADD)
      .reduce((sum, op) => sum + Number(op.amount), 0);

    this.fundsStats.totalWithdrawn = currencyOperations
      .filter(op => op.operationFunds === OperationFunds.WITHDRAW)
      .reduce((sum, op) => sum + Number(op.amount), 0);

    this.fundsStats.netChange = this.fundsStats.totalAdded - this.fundsStats.totalWithdrawn;

    // Starting balance is derived from available funds minus net change
    this.fundsStats.startingBalance = this.currencyBalances[this.selectedCurrency] - this.fundsStats.netChange;
  }

  /**
   * Generate chart data from fund operations
   */
  generateChartData(): void {
    // Filter operations for the selected currency
    const currencyOperations = this.fundOperations.filter(op =>
      op.currency === this.selectedCurrency
    );

    // Sort operations by date
    const sortedOps = [...currencyOperations]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date();
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date();
        return dateA.getTime() - dateB.getTime();
      });

    // Calculate running balance
    let balance = this.fundsStats.startingBalance;
    this.fundHistory = [balance];
    this.chartLabels = ['Starting'];

    for (const op of sortedOps) {
      if (op.operationFunds === OperationFunds.ADD) {
        balance += Number(op.amount);
      } else {
        balance -= Number(op.amount);
      }

      this.fundHistory.push(balance);

      // Format date for label
      const opDate = op.createdAt ? new Date(op.createdAt) : new Date();
      this.chartLabels.push(opDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    // Calculate sparkline heights
    this.calculateSparklineHeights();
  }

  /**
   * Calculate heights for sparkline bars
   */
  calculateSparklineHeights(): void {
    const maxValue = Math.max(...this.fundHistory);
    if (maxValue === 0) return; // Prevent division by zero

    this.sparklineHeights = this.fundHistory.map(value => {
      return ((value / maxValue) * 100) + '%';
    });
  }

  /**
   * Process form submission for fund operation
   */
  processFundOperation(): void {
    if (this.fundsForm.valid) {
      const formValues = this.fundsForm.value;
      const currencyValue = formValues.currency;

      if (this.isCurrencyCode(currencyValue)) {
        this.confirmationData = {
          operationFunds: formValues.operationFunds,
          amount: formValues.amount,
          currency: currencyValue as Currency,  // Now we know this is a valid CurrencyCode
          notes: formValues.notes,
          date: formValues.date
        };

        this.showConfirmation = true;
      }
    } else {
      // Mark all form controls as touched to trigger validation messages
      Object.keys(this.fundsForm.controls).forEach(key => {
        this.fundsForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Confirm and execute fund operation
   */
  confirmOperation(): void {
    if (!this.confirmationData) return;

    this.loading = true;

    // Create a new fund object according to the backend DTO structure
    const newFund: Funds = {
      operationFunds: this.confirmationData.operationFunds,
      amount: this.confirmationData.amount,
      currency: this.confirmationData.currency,
      notes: this.confirmationData.notes || '',
      code: '',
      updateBy: { id: 1 }, // Send a User object with an ID
      updatedById: 1, // Also send the user ID as a separate field if needed
      createdAt: new Date(),
    };

    this.loadBalancesByCurrency(this.selectedCurrency);

    this.fundsService.addFundsManagement(newFund)
      .pipe(
        finalize(() => {
          this.loadFundOperations()
          this.showConfirmation = false;
        })
      )
      .subscribe({
        next: (response: { message: string; result: string; errors: string; errorMap: string[] }) => {
          if (response.message === 'Fund balance created successfully') {
            // After successful operation, reload balances for the current currency
            this.loadBalancesByCurrency(this.selectedCurrency);

            // Reload fund operations
            this.loadFundOperations();

            // Reset form with current selected currency
            this.fundsForm.reset({
              operationFunds: OperationFunds.ADD,
              amount: 0,
              currency: this.selectedCurrency,
              notes: '',
              date: new Date().toISOString().split('T')[0]
            });
          } else {
            this.errorMessage = response.errors || 'Operation failed';
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error adding fund operation:', error);
          this.errorMessage = 'Failed to process operation';
          this.loading = false;
        }
      });
  }

  /**
   * Cancel confirmation dialog
   */
  cancelConfirmation(): void {
    this.showConfirmation = false;
    this.confirmationData = null;
  }

  /**
   * Filter operations by date range
   */
  applyDateFilter(): void {
    this.loading = true;

    // In a real app, you would call an API with filter parameters
    // For now, we'll just simulate a delay
    setTimeout(() => {
      this.loading = false;
    }, 500);
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
   * Export fund operations history
   */
  exportOperations(format: 'pdf' | 'csv' | 'excel'): void {
    alert(`Exporting fund operations as ${format.toUpperCase()}`);
  }

  /**
   * Get appropriate class for operation type badge
   */
  getOperationClass(type: string): string {
    switch (type) {
      case OperationFunds.ADD: return 'bg-success';
      case OperationFunds.WITHDRAW: return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  /**
   * Get appropriate icon for operation type
   */
  getOperationIcon(type: string): string {
    switch (type) {
      case OperationFunds.ADD: return 'fa-plus-circle';
      case OperationFunds.WITHDRAW: return 'fa-minus-circle';
      default: return 'fa-circle';
    }
  }

  /**
   * Type guard to check if the value is of type User
   */
  isUser(value: any): value is User {
    return value && typeof value === 'object' && 'fullName' in value;
  }
}