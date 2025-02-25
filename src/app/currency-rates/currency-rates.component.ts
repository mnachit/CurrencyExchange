import { Component, OnInit } from '@angular/core';
import { Currency } from '../models/currency.model';

@Component({
  selector: 'app-currency-rates',
  standalone: false,
  templateUrl: './currency-rates.component.html',
  styleUrl: './currency-rates.component.css'
})
export class CurrencyRatesComponent implements OnInit {
  activeTab: string = 'main';
  currencies: Currency[] = [
    {
      code: 'USD',
      name: 'US Dollar',
      flagUrl: 'assets/images/flags/usd.png',
      buyRate: 1.0000,
      sellRate: 1.0000
    },
    {
      code: 'EUR',
      name: 'Euro',
      flagUrl: 'assets/images/flags/eur.png',
      buyRate: 0.9120,
      sellRate: 0.9280
    },
    {
      code: 'GBP',
      name: 'British Pound',
      flagUrl: 'assets/images/flags/gbp.png',
      buyRate: 0.7850,
      sellRate: 0.7990
    },
    {
      code: 'JPY',
      name: 'Japanese Yen',
      flagUrl: 'assets/images/flags/jpy.png',
      buyRate: 142.50,
      sellRate: 145.20
    },
    {
      code: 'SAR',
      name: 'Saudi Riyal',
      flagUrl: 'assets/images/flags/sar.png',
      buyRate: 3.7500,
      sellRate: 3.7600
    },
    {
      code: 'AED',
      name: 'UAE Dirham',
      flagUrl: 'assets/images/flags/aed.png',
      buyRate: 3.6720,
      sellRate: 3.6780
    },
    {
      code: 'CHF',
      name: 'Swiss Franc',
      flagUrl: 'assets/images/flags/chf.png',
      buyRate: 0.8910,
      sellRate: 0.9050
    },
    {
      code: 'CAD',
      name: 'Canadian Dollar',
      flagUrl: 'assets/images/flags/cad.png',
      buyRate: 1.3520,
      sellRate: 1.3680
    }
  ];

  constructor() { }

  ngOnInit(): void {
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
