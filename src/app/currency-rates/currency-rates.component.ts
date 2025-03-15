import { Component, OnInit } from '@angular/core';
import { Currency } from '../models/currency.model';
import { CurrencyService } from '../services/currency.service';

@Component({
  selector: 'app-currency-rates',
  standalone: false,
  templateUrl: './currency-rates.component.html',
  styleUrl: './currency-rates.component.css'
})
export class CurrencyRatesComponent implements OnInit {
  activeTab: string = 'main';
  currencies: Currency[] = [];

  constructor(private currencyService : CurrencyService) { }

  getcurrencies(): void {
    this.currencyService.getCurrencies().subscribe(data => {
      this.currencies = data.result;
    });
  }

  ngOnInit(): void {
    this.getcurrencies
    // In a real application, you would fetch data from a service
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  updateRates(): void {
    // In a real application, this would trigger a service call to update rates
    console.log('Updating rates...');
    // Simulate rates update
    this.currencies = this.currencies.map(currency => ({
      ...currency,
      buyRate: currency.buyRate * (1 + (Math.random() * 0.02 - 0.01)),
      sellRate: currency.sellRate * (1 + (Math.random() * 0.02 - 0.01))
    }));
  }
}
