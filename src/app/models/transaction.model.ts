export interface Transaction {
    id: string;
    date: Date;
    customerName: string;
    fromCurrency: string;
    fromAmount: number;
    toCurrency: string;
    toAmount: number;
    status: string;
    customerID?: string; // Making these properties optional with ?
    exchangeRate?: number;
    fee?: number;
    notes?: string;
  }