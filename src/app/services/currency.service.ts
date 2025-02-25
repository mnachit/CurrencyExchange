import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Currency } from '../models/currency.model';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = 'api/currencies'; // This would be the actual API URL in a real application

  constructor(private http: HttpClient) { }

  // In a real application, these methods would make actual HTTP requests
  // For now, we'll use mock data

  getCurrencies(): Observable<Currency[]> {
    // Mock data (same as in ExchangeService for consistency)
    const currencies: Currency[] = [
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

    return of(currencies);
  }

  getCurrency(code: string): Observable<Currency | undefined> {
    return this.getCurrencies().pipe(
      map(currencies => currencies.find(currency => currency.code === code))
    );
  }

  updateRates(): Observable<boolean> {
    // In a real application, this would make an API call to update rates
    return of(true);
  }

  addCurrency(currency: Currency): Observable<Currency> {
    // In a real application, this would make an API call
    return of(currency);
  }

  updateCurrency(code: string, currency: Partial<Currency>): Observable<boolean> {
    // In a real application, this would make an API call
    return of(true);
  }

  deleteCurrency(code: string): Observable<boolean> {
    // In a real application, this would make an API call
    return of(true);
  }
}