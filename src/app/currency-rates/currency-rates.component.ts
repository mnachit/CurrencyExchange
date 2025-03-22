import { Component, OnInit } from '@angular/core';
import { Currency } from '../models/currency.model';
import { CurrencyService } from '../services/currency.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-currency-rates',
  standalone: false,
  templateUrl: './currency-rates.component.html',
  styleUrls: ['./currency-rates.component.css']
})
export class CurrencyRatesComponent implements OnInit {
  currencies: Currency[] = [];
  filteredCurrencies: Currency[] = [];
  loading: boolean = false;
  error: string | null = null;
  lastUpdated: Date | null = null;
  searchTerm: string = '';

  constructor(private currencyService: CurrencyService) { }

  ngOnInit(): void {
    this.loadCurrencies();
  }

  loadCurrencies(): void {
    this.loading = true;
    this.error = null;

    this.currencyService.getCurrencies()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.lastUpdated = new Date();
        })
      )
      .subscribe({
        next: (response) => {
          if (response && response.result) {
            this.currencies = response.result;
            this.applyFilter();
          } else {
            this.error = 'Invalid data received from server';
          }
        },
        error: (err) => {
          this.error = 'Failed to load currency data. Please try again later.';
          console.error('Error loading currencies:', err);
        }
      });
  }

  applyFilter(): void {
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      this.filteredCurrencies = this.currencies.filter(currency =>
        currency.name.toLowerCase().includes(term) ||
        currency.code.toLowerCase().includes(term)
      );
    } else {
      this.filteredCurrencies = [...this.currencies];
    }
  }

  updateRates(): void {
    this.loadCurrencies();
  }

  onSearch(): void {
    this.applyFilter();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  getCurrencyDetails(code: string): void {
    this.loading = true;

    this.currencyService.getCurrency(code)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          // Here you would typically open a modal or navigate to a details page
          console.log('Currency details:', response.result);
        },
        error: (err) => {
          console.error('Error loading currency details:', err);
        }
      });
  }

  // Calculate rate change percentage
  getRateChangePercentage(currency: Currency): number | null {
    if (currency.previousBuyRate && currency.buyRate) {
      return ((currency.buyRate - currency.previousBuyRate) / currency.previousBuyRate) * 100;
    }
    return null;
  }

  // Determine if rate has increased, decreased, or remained the same
  getRateChangeDirection(currency: Currency): 'up' | 'down' | 'unchanged' {
    const change = this.getRateChangePercentage(currency);
    if (change === null) return 'unchanged';
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'unchanged';
  }
}