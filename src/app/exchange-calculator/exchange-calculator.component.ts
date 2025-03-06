import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Currency } from '../models/currency.model';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { TransactionService } from '../services/transaction.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-exchange-calculator', standalone: true, // Keep as standalone component
  imports: [
    CommonModule,        // For *ngIf, *ngFor, and ngClass
    ReactiveFormsModule, // For formGroup
    FormsModule,         // For ngModel
    DecimalPipe,         // For number pipe
    CurrencyPipe,        // For currency pipe
    DatePipe,             // For date pipe
    NgbDropdownModule
  ],
  templateUrl: './exchange-calculator.component.html',
  styleUrls: ['./exchange-calculator.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class ExchangeCalculatorComponent implements OnInit {
  exchangeForm: FormGroup;
  customerForm: FormGroup;
  showDropdownFrom = false;
  showDropdownTo = false;
  currencies: Currency[] = [
    {
      code: 'USD',
      name: 'US Dollar',
      flagUrl: 'https://flagcdn.com/w40/us.png',
      buyRate: 1.0000,
      sellRate: 1.0000
    },
    {
      code: 'EUR',
      name: 'Euro',
      flagUrl: 'https://flagcdn.com/w40/eu.png',
      buyRate: 0.9120,
      sellRate: 0.9280
    },
    {
      code: 'GBP',
      name: 'British Pound',
      flagUrl: 'https://flagcdn.com/w40/gb.png',
      buyRate: 0.7850,
      sellRate: 0.7990
    },
    {
      code: 'JPY',
      name: 'Japanese Yen',
      flagUrl: 'https://flagcdn.com/w40/jp.png',
      buyRate: 142.50,
      sellRate: 145.20
    },
    {
      code: 'SAR',
      name: 'Saudi Riyal',
      flagUrl: 'https://flagcdn.com/w40/sa.png',
      buyRate: 3.7500,
      sellRate: 3.7600
    },
    {
      code: 'AED',
      name: 'UAE Dirham',
      flagUrl: 'https://flagcdn.com/w40/ae.png',
      buyRate: 3.6720,
      sellRate: 3.6780
    },
    {
      code: 'MAD',
      name: 'Moroccan Dirham',
      flagUrl: 'https://flagcdn.com/w40/ma.png',
      buyRate: 9.8500,
      sellRate: 9.9200
    },
    {
      code: 'CAD',
      name: 'Canadian Dollar',
      flagUrl: 'https://flagcdn.com/w40/ca.png',
      buyRate: 1.3520,
      sellRate: 1.3680
    }
  ];

  fromCurrency: Currency;
  toCurrency: Currency;
  exchangeRate: number = 0;
  customExchangeRate: number = 0;
  defaultExchangeRate: number = 0;
  isEditingRate: boolean = false;

  showReceipt: boolean = false;
  showConfirmation: boolean = false;
  showSuccess: boolean = false;

  receiptData: any = {};
  isCalculating: boolean = false;
  transactionComplete: boolean = false;
  lastRateUpdate: Date = new Date();
  saveSuccess: boolean = false;

  // For the recent exchanges display
  recentExchanges: any[] = [];

  // For the display rates (simplified for the UI)
  displayRates: any[] = [];

  constructor(private fb: FormBuilder, private transactionService: TransactionService) {
    this.fromCurrency = this.currencies[0]; // USD
    this.toCurrency = this.currencies[6]; // MAD - Moroccan Dirham

    this.exchangeForm = this.fb.group({
      fromAmount: [1000, [Validators.required, Validators.min(0.01)]],
      toAmount: [0]
    });

    this.customerForm = this.fb.group({
      customerName: ['', Validators.required],
      idNumber: ['', Validators.required],
      phone: ['']
    });

    this.calculateExchangeRate();
    this.prepareDisplayRates();
    this.generateMockRecentExchanges();
  }

  ngOnInit(): void {
    // Load any saved preferences or previous transactions
    this.loadSavedPreferences();
  }

  loadSavedPreferences(): void {
    // In a real application, this would load saved customer data or preferences from storage
    const savedData = localStorage.getItem('exchangePreferences');
    if (savedData) {
      try {
        const preferences = JSON.parse(savedData);
        // Apply preferences if they exist
        if (preferences.lastFromCurrency) {
          const savedFromCurrency = this.currencies.find(c => c.code === preferences.lastFromCurrency);
          if (savedFromCurrency) this.fromCurrency = savedFromCurrency;
        }
        if (preferences.lastToCurrency) {
          const savedToCurrency = this.currencies.find(c => c.code === preferences.lastToCurrency);
          if (savedToCurrency) this.toCurrency = savedToCurrency;
        }
        this.calculateExchangeRate();
      } catch (e) {
        console.error('Error loading saved preferences', e);
      }
    }
  }

  savePreferences(): void {
    // Save current exchange preferences
    const preferences = {
      lastFromCurrency: this.fromCurrency.code,
      lastToCurrency: this.toCurrency.code,
      lastExchangeTime: new Date().toISOString()
    };
    localStorage.setItem('exchangePreferences', JSON.stringify(preferences));
  }

  prepareDisplayRates(): void {
    // Create a simplified list of rates against USD for the rates display
    this.displayRates = this.currencies.slice(1).map(currency => {
      return {
        currency: currency.code,
        buyRate: currency.buyRate,
        sellRate: currency.sellRate
      };
    });
  }

  generateMockRecentExchanges(): void {
    // Generate some mock recent exchanges for the display
    const mockExchanges = [
      {
        fromCurrency: 'USD',
        toCurrency: 'MAD',
        fromAmount: 500,
        toAmount: 4925,
        date: new Date(Date.now() - 15 * 60000) // 15 minutes ago
      },
      {
        fromCurrency: 'EUR',
        toCurrency: 'SAR',
        fromAmount: 200,
        toAmount: 812.5,
        date: new Date(Date.now() - 45 * 60000) // 45 minutes ago
      },
      {
        fromCurrency: 'SAR',
        toCurrency: 'USD',
        fromAmount: 1000,
        toAmount: 266.67,
        date: new Date(Date.now() - 75 * 60000) // 1 hour 15 minutes ago
      }
    ];

    this.recentExchanges = mockExchanges;
  }

  refreshRates(): void {
    this.isCalculating = true;

    // Simulate an API call to refresh rates
    setTimeout(() => {
      // Randomly adjust rates a small amount to simulate market movements
      this.currencies.forEach(currency => {
        if (currency.code !== 'USD') {
          const randomFactor = 1 + (Math.random() * 0.02 - 0.01); // +/- 1%
          currency.buyRate = parseFloat((currency.buyRate * randomFactor).toFixed(4));
          currency.sellRate = parseFloat((currency.sellRate * randomFactor).toFixed(4));
        }
      });

      // Update the exchange rate for the current currency pair
      this.calculateExchangeRate();
      this.prepareDisplayRates();

      // Update the last refresh time
      this.lastRateUpdate = new Date();

      this.isCalculating = false;
    }, 800); // Simulate network delay
  }

  calculateExchangeRate(): void {
    this.isCalculating = true;

    // Simulate API call with a slight delay
    setTimeout(() => {
      if (this.fromCurrency && this.toCurrency) {
        // Calculate the default exchange rate
        if (this.fromCurrency.code === 'USD') {
          // Converting from USD to another currency
          this.defaultExchangeRate = this.toCurrency.sellRate;
        } else if (this.toCurrency.code === 'USD') {
          // Converting from another currency to USD
          this.defaultExchangeRate = 1 / this.fromCurrency.buyRate;
        } else {
          // Cross currency exchange (convert through USD)
          const fromToUSD = 1 / this.fromCurrency.buyRate;
          const usdToTo = this.toCurrency.sellRate;
          this.defaultExchangeRate = fromToUSD * usdToTo;
        }

        // If we're not using a custom rate, set the exchange rate to the default
        if (!this.isEditingRate || this.customExchangeRate === 0) {
          this.exchangeRate = this.defaultExchangeRate;
          this.customExchangeRate = this.defaultExchangeRate;
        }

        this.updateToAmount();
      }

      this.isCalculating = false;
    }, 300);
  }

  updateToAmount(): void {
    const fromAmount = this.exchangeForm.get('fromAmount')?.value || 0;
    const toAmount = fromAmount * this.exchangeRate;
    this.exchangeForm.get('toAmount')?.setValue(toAmount.toFixed(2));
  }

  onFromAmountChange(): void {
    this.updateToAmount();
  }

  onToAmountChange(): void {
    const toAmount = this.exchangeForm.get('toAmount')?.value || 0;
    const fromAmount = toAmount / this.exchangeRate;
    this.exchangeForm.get('fromAmount')?.setValue(fromAmount.toFixed(2));
  }

  swapCurrencies(): void {
    const temp = this.fromCurrency;
    this.fromCurrency = this.toCurrency;
    this.toCurrency = temp;

    const fromAmount = this.exchangeForm.get('fromAmount')?.value;
    const toAmount = this.exchangeForm.get('toAmount')?.value;

    this.exchangeForm.get('fromAmount')?.setValue(toAmount);
    this.exchangeForm.get('toAmount')?.setValue(fromAmount);

    this.calculateExchangeRate();
  }

  selectFromCurrency(currency: Currency): void {
    // Don't select the same currency as the "to" currency
    if (this.toCurrency.code === currency.code) {
      this.swapCurrencies();
    } else {
      this.fromCurrency = currency;
      this.calculateExchangeRate();
    }
    // Close the dropdown after selection
    this.showDropdownFrom = false;
  }

  // Select a "to" currency
  selectToCurrency(currency: Currency): void {
    // Don't select the same currency as the "from" currency
    if (this.fromCurrency.code === currency.code) {
      this.swapCurrencies();
    } else {
      this.toCurrency = currency;
      this.calculateExchangeRate();
    }
    // Close the dropdown after selection
    this.showDropdownTo = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Get the target element
    const target = event.target as HTMLElement;

    // Check if the click was outside the dropdowns
    if (!target.closest('.dropdown')) {
      this.showDropdownFrom = false;
      this.showDropdownTo = false;
    }
  }

  toggleDropdown(type: 'from' | 'to'): void {
    if (type === 'from') {
      // Close the other dropdown if it's open
      this.showDropdownTo = false;
      // Toggle the current dropdown
      this.showDropdownFrom = !this.showDropdownFrom;
    } else {
      // Close the other dropdown if it's open
      this.showDropdownFrom = false;
      // Toggle the current dropdown
      this.showDropdownTo = !this.showDropdownTo;
    }
  }

  // Rate editor functions
  toggleRateEditor(): void {
    this.isEditingRate = !this.isEditingRate;
    if (this.isEditingRate && this.customExchangeRate === 0) {
      this.customExchangeRate = this.exchangeRate;
    }
  }

  applyCustomRate(): void {
    if (this.customExchangeRate > 0) {
      this.exchangeRate = this.customExchangeRate;
      this.updateToAmount();
    }
  }

  resetToDefaultRate(): void {
    this.customExchangeRate = this.defaultExchangeRate;
    this.exchangeRate = this.defaultExchangeRate;
    this.updateToAmount();
  }

  getDefaultExchangeRate(): number {
    return this.defaultExchangeRate;
  }

  getMarginPercentage(): number {
    // Calculate the percentage difference between custom and default rate
    if (this.defaultExchangeRate === 0) return 0;
    return ((this.customExchangeRate - this.defaultExchangeRate) / this.defaultExchangeRate) * 100;
  }

  // Fee calculations
  calculateFee(): number {
    // 0.5% exchange fee
    // return this.exchangeForm.get('fromAmount')?.value * 0.005 || 0;
    return 0;
  }

  calculateServiceCharge(): number {
    // Fixed service charge based on amount
    const amount = this.exchangeForm.get('fromAmount')?.value || 0;
    if (amount <= 0) return 0;
    if (amount < 1000) return 0;
    if (amount < 5000) return 0;
    return 0;
  }

  calculateTotalPayment(): number {
    return parseFloat(this.exchangeForm.get('toAmount')?.value) || 0;
  }

  // Get currency object by code
  getCurrencyByCode(code: string): Currency {
    return this.currencies.find(c => c.code === code) || this.currencies[0];
  }

  // Confirmation process
  proceedToConfirmation(): void {
    if (this.exchangeForm.valid && this.customerForm.valid) {
      this.showConfirmation = true;
    } else {
      this.showConfirmation = true;
    }
  }

  closeConfirmation(): void {
    this.showConfirmation = false;
  }

  messageResponse: string = '';

  // Add these properties to your component class
  errorMessage: string = '';
  showError: boolean = false;

  // Updated confirmExchange method
  confirmExchange(): void {
    // Close confirmation dialog
    this.showConfirmation = false;

    // Show loading state first
    this.saveSuccess = true;
    this.messageResponse = "Processing your exchange";

    // Generate receipt data
    this.generateReceiptData();

    // In a real application, you would call a service to save the transaction
    this.transactionComplete = true;

    // Save user preferences for next time
    this.savePreferences();

    this.transactionService.addTransaction(this.receiptData).subscribe(
      (response) => {
        console.log("Response: ", response);

        // Hide loading spinner
        this.saveSuccess = false;

        if (response.status === 200) {
          // Show success dialog after a short delay
          setTimeout(() => {
            this.showSuccess = true;
          }, 300);
        } else {
          // Show error for other status codes including 400
          this.errorMessage = response.message || "Transaction failed";
          this.showError = true;
          this.hideErrorAfterDelay();
        }
      },
      (error) => {
        console.error("Error occurred:", error);

        // Hide loading spinner
        this.saveSuccess = false;

        // Show clear error message
        this.errorMessage = "Transaction not saved. Please try again.";
        this.showError = true;
        this.hideErrorAfterDelay();
      }
    );
  }

  // Method to hide error after delay
  hideErrorAfterDelay(): void {
    setTimeout(() => {
      this.showError = false;
    }, 2000); // Longer display time (7 seconds) to ensure visibility
  }

  closeSuccess(): void {
    this.showSuccess = false;
    this.resetForms();
  }

  // Receipt handling
  generateReceiptData(): void {
    const now = new Date();
    const receiptId = 'TX' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

    this.receiptData = {
      receiptId,
      date: now,
      customerName: this.customerForm.get('customerName')?.value,
      idNumber: this.customerForm.get('idNumber')?.value,
      phoneNumber: this.customerForm.get('phone')?.value,
      fromCurrency: this.fromCurrency.code,
      toCurrency: this.toCurrency.code,
      exchangeRate: this.exchangeRate,
      fromAmount: this.exchangeForm.get('fromAmount')?.value,
      toAmount: this.exchangeForm.get('toAmount')?.value,
      fee: this.calculateFee(),
      serviceCharge: this.calculateServiceCharge(),
      totalPaid: this.calculateTotalPayment()
    };
  }

  generateReceipt(): void {
    // Close success modal if open
    this.showSuccess = false;

    // Show receipt modal
    this.showReceipt = true;
  }

  closeReceipt(): void {
    this.showReceipt = false;
  }

  printReceipt(): void {
    // You could implement a more sophisticated print functionality here
    window.print();
  }

  addToRecentExchanges(): void {
    // Add the current exchange to the recent exchanges list
    const newExchange = {
      fromCurrency: this.fromCurrency.code,
      toCurrency: this.toCurrency.code,
      fromAmount: parseFloat(this.exchangeForm.get('fromAmount')?.value),
      toAmount: parseFloat(this.exchangeForm.get('toAmount')?.value),
      date: new Date()
    };

    // Add to the beginning of the array
    this.recentExchanges.unshift(newExchange);

    // Keep only the most recent exchanges
    if (this.recentExchanges.length > 5) {
      this.recentExchanges = this.recentExchanges.slice(0, 5);
    }

    // In a real application, you would also persist this to storage or a database
    this.saveTransactionToHistory(this.receiptData);
  }

  saveTransactionToHistory(transaction: any): void {
    // In a real application, this would save to a database or local storage
    try {
      const history = JSON.parse(localStorage.getItem('transactionHistory') || '[]');
      history.push(transaction);
      localStorage.setItem('transactionHistory', JSON.stringify(history));
    } catch (e) {
      console.error('Error saving transaction history', e);
    }
  }

  resetForms(): void {
    this.exchangeForm.reset({
      fromAmount: 1000,
      toAmount: this.exchangeRate * 1000
    });

    this.customerForm.reset();

    this.showReceipt = false;
    this.showConfirmation = false;
    this.showSuccess = false;
    this.transactionComplete = false;

    // Reset rates to default
    this.isEditingRate = false;
    this.customExchangeRate = 0;

    // Reset currencies to default if needed
    // this.fromCurrency = this.currencies[0];
    // this.toCurrency = this.currencies[6];
    // this.calculateExchangeRate();
  }

  // Helper function to mark all controls in a form group as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}