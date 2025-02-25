import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Currency } from '../models/currency.model';

@Component({
  selector: 'app-exchange-calculator',
  standalone: false,
  templateUrl: './exchange-calculator.component.html',
  styleUrl: './exchange-calculator.component.css'
})
export class ExchangeCalculatorComponent implements OnInit {
  exchangeForm: FormGroup;
  customerForm: FormGroup;
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
      flagUrl: 'https://flagcdn.com/w40/eu.png',
      buyRate: 0.7850,
      sellRate: 0.7990
    },
    {
      code: 'JPY',
      name: 'Japanese Yen',
      flagUrl: 'https://flagcdn.com/w40/eu.png',
      buyRate: 142.50,
      sellRate: 145.20
    },
    {
      code: 'SAR',
      name: 'Saudi Riyal',
      flagUrl: 'https://flagpedia.net/data/flags/w580/sa.webp',
      buyRate: 3.7500,
      sellRate: 3.7600
    },
    {
      code: 'AED',
      name: 'UAE Dirham',
      flagUrl: 'https://flagcdn.com/w40/eu.png',
      buyRate: 3.6720,
      sellRate: 3.6780
    },
    {
      code: 'CAD',
      name: 'Canadian Dollar',
      flagUrl: 'https://flagcdn.com/w40/eu.png',
      buyRate: 1.3520,
      sellRate: 1.3680
    }
  ];

  fromCurrency: Currency;
  toCurrency: Currency;
  exchangeRate: number = 0;
  showReceipt: boolean = false;
  receiptData: any = {};
  isCalculating: boolean = false;
  transactionComplete: boolean = false;

  constructor(private fb: FormBuilder) {
    this.fromCurrency = this.currencies[0]; // USD
    this.toCurrency = this.currencies[4]; // SAR

    this.exchangeForm = this.fb.group({
      fromAmount: [1000, [Validators.required, Validators.min(0.01)]],
      toAmount: [{ value: 3750, disabled: true }]
    });

    this.customerForm = this.fb.group({
      customerName: ['', Validators.required],
      idNumber: ['', Validators.required],
      phone: ['']
    });

    this.calculateExchangeRate();
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

  calculateExchangeRate(): void {
    this.isCalculating = true;

    // Simulate API call with a slight delay
    setTimeout(() => {
      if (this.fromCurrency && this.toCurrency) {
        // For buying foreign currency, we use the sell rate
        // For selling foreign currency, we use the buy rate
        if (this.fromCurrency.code === 'USD') {
          // Converting from USD to another currency
          this.exchangeRate = this.toCurrency.sellRate / this.fromCurrency.sellRate;
        } else if (this.toCurrency.code === 'USD') {
          // Converting from another currency to USD
          this.exchangeRate = this.fromCurrency.buyRate / this.toCurrency.buyRate;
        } else {
          // Cross currency exchange
          const fromToUSD = this.fromCurrency.buyRate;
          const usdToTo = this.toCurrency.sellRate;
          this.exchangeRate = usdToTo / fromToUSD;
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

  updateFromAmount(): void {
    const toAmount = this.exchangeForm.get('toAmount')?.value || 0;
    const fromAmount = toAmount / this.exchangeRate;
    this.exchangeForm.get('fromAmount')?.setValue(fromAmount.toFixed(2));
  }

  onFromAmountChange(): void {
    this.updateToAmount();
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
    this.fromCurrency = currency;
    this.calculateExchangeRate();
  }

  selectToCurrency(currency: Currency): void {
    this.toCurrency = currency;
    this.calculateExchangeRate();
  }

  generateReceipt(): void {
    if (this.exchangeForm.valid && this.customerForm.valid) {
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
        commission: this.exchangeForm.get('fromAmount')?.value * 0.005, // 0.5%
        commissionPercentage: 0.5
      };

      this.showReceipt = true;

      // Save this transaction to history (in a real app)
      this.saveTransactionToHistory(this.receiptData);
    } else {
      // Mark form controls as touched to trigger validation messages
      this.markFormGroupTouched(this.exchangeForm);
      this.markFormGroupTouched(this.customerForm);
    }
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

  completeExchange(): void {
    if (this.exchangeForm.valid && this.customerForm.valid) {
      // First generate a receipt if not already shown
      if (!this.showReceipt) {
        this.generateReceipt();
      }

      // In a real application, you would call a service to save the transaction
      this.transactionComplete = true;

      // Save user preferences for next time
      this.savePreferences();

      // Show success message
      alert('Exchange completed successfully!');
      this.resetForms();
    } else {
      // Mark form controls as touched to trigger validation messages
      this.markFormGroupTouched(this.exchangeForm);
      this.markFormGroupTouched(this.customerForm);
    }
  }

  printReceipt(): void {
    // You could implement a more sophisticated print functionality here
    window.print();
  }

  closeReceipt(): void {
    this.showReceipt = false;
  }

  resetForms(): void {
    this.exchangeForm.reset({
      fromAmount: 1000,
      toAmount: 3750
    });
    this.customerForm.reset();
    this.showReceipt = false;
    this.transactionComplete = false;

    // Reset currencies to default
    this.fromCurrency = this.currencies[0];
    this.toCurrency = this.currencies[4];
    this.calculateExchangeRate();
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