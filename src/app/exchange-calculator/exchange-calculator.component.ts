import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Currency } from '../models/currency.model';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { TransactionService } from '../services/transaction.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { trigger, transition, style, animate } from '@angular/animations';
import { CurrencyService } from '../services/currency.service';
import { TokenService } from '../services/token.service';
import { TranslatePipe } from '../pipe/translate.pipe';
import { LanguageService } from '../services/language.service';
import { TicketLanguageService } from '../services/ticket-language.service';
import { TicketTranslatePipe } from '../pipe/TicketTranslatePipe';

@Component({
  selector: 'app-exchange-calculator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DecimalPipe,
    CurrencyPipe,
    DatePipe,
    TranslatePipe,
    NgbDropdownModule,
    TicketTranslatePipe
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
  // Form groups
  exchangeForm!: FormGroup;
  customerForm!: FormGroup;

  // UI state properties
  showDropdownFrom = false;
  showDropdownTo = false;
  showReceipt = false;
  showConfirmation = false;
  showSuccess = false;
  isCalculating = false;
  transactionComplete = false;
  saveSuccess = false;
  loading = true;
  isEditingRate = false;
  showError = false;
  nameCompany: string = '';
  addressCompany: string = '';

  selectedTicketLanguage: string = '';
  availableTicketLanguages: { code: string, name: string }[] = [];

  // Currency data
  currencies: Currency[] = [];
  fromCurrency: Currency = this.getDefaultFromCurrency();
  toCurrency: Currency = this.getDefaultToCurrency();



  // Exchange rate data
  exchangeRate = 0;
  customExchangeRate = 0;
  defaultExchangeRate = 0;
  lastRateUpdate = new Date();

  // Transaction data
  receiptData: any = {};
  recentExchanges: any[] = [];
  displayRates: any[] = [];
  messageResponse = '';
  errorMessage = '';
  phoneCompany: string = '';
  emailCompany: string = '';

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private currencyService: CurrencyService,
    private token: TokenService,
    public languageService: LanguageService,
    private ticketLanguageService: TicketLanguageService
  ) {
    // Define explicit default objects instead of using this.currencies array
    this.fromCurrency = {
      id: 1,
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      buyRate: 1,
      sellRate: 1
    };

    this.toCurrency = {
      id: 2,
      code: 'MAD',
      name: 'Moroccan Dirham',
      symbol: 'د.م.',
      buyRate: 9.85,
      sellRate: 9.95
    };

    this.initializeForms();

    this.availableTicketLanguages = this.ticketLanguageService.getAvailableLanguages();

    // Get saved ticket language
    this.selectedTicketLanguage = this.ticketLanguageService.getTicketLanguage();
  }

  getNameCompany(): string {
    const company = this.token.getCompanyWithToken();
    return company?.name ?? '';
  }

  changeTicketLanguage(): void {
    this.ticketLanguageService.setTicketLanguage(this.selectedTicketLanguage);
  }

  getAddressCompany(): string {
    const company = this.token.getCompanyWithToken();
    return company?.address ?? '';
  }



  getPhoneCompany(): string {
    const company = this.token.getCompanyWithToken();
    return company?.phone ?? '';
  }

  getEmail(): string {
    const company = this.token.getCompanyWithToken();
    return company?.email ?? '';
  }

  ngOnInit(): void {
    this.getCurrencies();
    this.generateMockRecentExchanges();
    this.nameCompany = this.getNameCompany();
    this.addressCompany = this.getAddressCompany();
    this.phoneCompany = this.getPhoneCompany();
    this.emailCompany = this.getEmail();

    const savedLanguage = this.languageService.getCurrentLanguage();
    this.languageService.setLanguage(savedLanguage);
  }

  /**
   * Initialize form groups with validators
   */
  private initializeForms(): void {
    this.exchangeForm = this.fb.group({
      fromAmount: [1000, [Validators.required, Validators.min(0.01)]],
      toAmount: [0]
    });

    this.customerForm = this.fb.group({
      customerName: ['', Validators.required],
      idNumber: ['', Validators.required],
      phone: ['']
    });
  }

  /**
   * Default currencies to use before API data is loaded
   */
  private getDefaultFromCurrency(): Currency {
    return {
      code: 'USD',
      name: 'US Dollar',
      buyRate: 1,
      sellRate: 1
    };
  }

  private getDefaultToCurrency(): Currency {
    return {
      code: 'MAD',
      name: 'Moroccan Dirham',
      buyRate: 9.85,
      sellRate: 9.95
    };
  }

  /**
   * Currency data loading
   */
  getCurrencies(): void {
    this.loading = true;
    this.currencyService.getCurrencies().subscribe({
      next: (response) => {
        if (response && response.result) {
          this.currencies = response.result;
          this.messageResponse = response.message;

          // Only proceed if we have currencies
          if (this.currencies && this.currencies.length > 0) {
            // Set default currencies if they exist in the loaded data
            const usdCurrency = this.currencies.find(c => c.code === 'USD');
            const madCurrency = this.currencies.find(c => c.code === 'MAD');

            if (usdCurrency) this.fromCurrency = usdCurrency;
            if (madCurrency) this.toCurrency = madCurrency;

            // Calculate exchange rates after currencies are loaded
            this.calculateExchangeRate();
            this.prepareDisplayRates();
          }

          // Load preferences after currencies are loaded
          this.loadSavedPreferences();
        } else {
          console.error("No currencies returned from API");
        }
        this.loading = false;
      },
      error: (err) => {
        console.error("Error loading currencies:", err);
        this.loading = false;
      }
    });
  }

  /**
   * Set default currencies after loading from API
   */
  private setDefaultCurrencies(): void {
    const usdCurrency = this.currencies.find(c => c.code === 'USD');
    const madCurrency = this.currencies.find(c => c.code === 'MAD');

    if (usdCurrency) this.fromCurrency = usdCurrency;
    if (madCurrency) this.toCurrency = madCurrency;
  }

  /**
   * User preferences management
   */
  loadSavedPreferences(): void {
    const savedData = localStorage.getItem('exchangePreferences');
    if (savedData) {
      try {
        const preferences = JSON.parse(savedData);
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
    if (!this.fromCurrency || !this.toCurrency) return;

    const preferences = {
      lastFromCurrency: this.fromCurrency.code,
      lastToCurrency: this.toCurrency.code,
      lastExchangeTime: new Date().toISOString()
    };
    localStorage.setItem('exchangePreferences', JSON.stringify(preferences));
  }

  /**
   * Exchange rate calculations
   */
  calculateExchangeRate(): void {
    if (!this.fromCurrency || !this.toCurrency) return;

    this.isCalculating = true;

    // Simulate API call with a slight delay
    setTimeout(() => {
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
      this.isCalculating = false;
    }, 300);
  }

  refreshRates(): void {
    if (this.currencies.length === 0) return;

    this.isCalculating = true;

    setTimeout(() => {
      // Randomly adjust rates a small amount to simulate market movements
      this.currencies.forEach(currency => {
        if (currency.code !== 'USD') {
          const randomFactor = 1 + (Math.random() * 0.02 - 0.01); // +/- 1%
          currency.buyRate = parseFloat((currency.buyRate * randomFactor).toFixed(4));
          currency.sellRate = parseFloat((currency.sellRate * randomFactor).toFixed(4));
        }
      });

      this.calculateExchangeRate();
      this.prepareDisplayRates();
      this.lastRateUpdate = new Date();
      this.isCalculating = false;
    }, 800);
  }

  prepareDisplayRates(): void {
    if (this.currencies.length === 0) return;

    this.displayRates = this.currencies
      .filter(c => c.code !== 'USD')
      .map(currency => ({
        currency: currency.code,
        buyRate: currency.buyRate,
        sellRate: currency.sellRate
      }));
  }

  /**
   * Amount calculation and currency handling
   */
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
    if (!this.fromCurrency || !this.toCurrency) return;

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
    if (!currency || !this.toCurrency) return;

    if (this.toCurrency.code === currency.code) {
      this.swapCurrencies();
    } else {
      this.fromCurrency = currency;
      this.calculateExchangeRate();
    }
    this.showDropdownFrom = false;
  }

  selectToCurrency(currency: Currency): void {
    if (!currency || !this.fromCurrency) return;

    if (this.fromCurrency.code === currency.code) {
      this.swapCurrencies();
    } else {
      this.toCurrency = currency;
      this.calculateExchangeRate();
    }
    this.showDropdownTo = false;
  }

  /**
   * UI event handlers
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.showDropdownFrom = false;
      this.showDropdownTo = false;
    }
  }

  toggleDropdown(type: 'from' | 'to'): void {
    if (type === 'from') {
      this.showDropdownTo = false;
      this.showDropdownFrom = !this.showDropdownFrom;
    } else {
      this.showDropdownFrom = false;
      this.showDropdownTo = !this.showDropdownTo;
    }
  }

  /**
   * Custom rate handling
   */
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
    if (this.defaultExchangeRate === 0) return 0;
    return ((this.customExchangeRate - this.defaultExchangeRate) / this.defaultExchangeRate) * 100;
  }

  /**
   * Transaction fee calculations
   */
  calculateFee(): number {
    return 0; // Currently no fee
  }

  calculateServiceCharge(): number {
    const amount = this.exchangeForm.get('fromAmount')?.value || 0;
    if (amount <= 0) return 0;
    if (amount < 1000) return 0;
    if (amount < 5000) return 0;
    return 0; // Currently no service charge
  }

  calculateTotalPayment(): number {
    return parseFloat(this.exchangeForm.get('toAmount')?.value) || 0;
  }

  /**
   * Transaction processing
   */
  proceedToConfirmation(): void {
    this.showConfirmation = true;
  }

  closeConfirmation(): void {
    this.showConfirmation = false;
  }

  confirmExchange(): void {
    if (!this.fromCurrency || !this.toCurrency) return;

    this.showConfirmation = false;
    this.saveSuccess = true;
    this.messageResponse = "Processing your exchange";

    this.generateReceiptData();
    this.transactionComplete = true;
    this.savePreferences();

    this.transactionService.addTransaction(this.receiptData).subscribe({
      next: (response) => {
        this.saveSuccess = false;

        if (response.status === 200) {
          setTimeout(() => {
            this.showSuccess = true;
          }, 300);
        } else {
          this.errorMessage = response.message || "Transaction failed";
          this.showError = true;
          this.hideErrorAfterDelay();
        }
      },
      error: (error) => {
        console.error("Error occurred:", error);
        this.saveSuccess = false;
        this.errorMessage = "Transaction not saved. Please try again.";
        this.showError = true;
        this.hideErrorAfterDelay();
      }
    });
  }

  hideErrorAfterDelay(): void {
    setTimeout(() => {
      this.showError = false;
    }, 2000);
  }

  closeSuccess(): void {
    this.showSuccess = false;
    this.resetForms();
  }

  /**
   * Receipt handling
   */
  generateReceiptData(): void {
    if (!this.fromCurrency || !this.toCurrency) return;

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
    this.showSuccess = false;
    this.showReceipt = true;
  }

  closeReceipt(): void {
    this.showReceipt = false;
  }

  printReceipt(): void {
    window.print();
  }

  /**
   * Recent exchanges management
   */
  generateMockRecentExchanges(): void {
    this.recentExchanges = [
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
  }

  addToRecentExchanges(): void {
    if (!this.fromCurrency || !this.toCurrency) return;

    const newExchange = {
      fromCurrency: this.fromCurrency.code,
      toCurrency: this.toCurrency.code,
      fromAmount: parseFloat(this.exchangeForm.get('fromAmount')?.value),
      toAmount: parseFloat(this.exchangeForm.get('toAmount')?.value),
      date: new Date()
    };

    this.recentExchanges.unshift(newExchange);

    if (this.recentExchanges.length > 5) {
      this.recentExchanges = this.recentExchanges.slice(0, 5);
    }

    this.saveTransactionToHistory(this.receiptData);
  }

  saveTransactionToHistory(transaction: any): void {
    // In a real app, save to database or local storage
  }

  /**
   * Reset forms and state
   */
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
    this.isEditingRate = false;
    this.customExchangeRate = 0;
  }

  /**
   * Utility methods
   */
  getCurrencyByCode(code: string): Currency {
    const found = this.currencies.find(c => c.code === code);
    return found || this.getDefaultFromCurrency();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}