export interface Currency {
    id?: number;
    symbol?: string;
    code: string;
    name: string;
    flagUrl?: string;
    buyRate: number;
    sellRate: number;
    previousBuyRate?: number;
    previousSellRate?: number;
    historicalRates?: {
        date: Date;
        rate: number;
    }[];
}
  