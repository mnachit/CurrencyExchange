export enum OperationFunds {
    ADD = 'add',
    WITHDRAW = 'withdraw'
  }
  
  export enum Currency {
    USD = 'USD',
    EUR = 'EUR',
    GBP = 'GBP',
    MAD = 'MAD',
    SAR = 'SAR',
    AED = 'AED'
  }
  
  export interface User {
    id: number;
    fullName?: string;
    // Add other user properties if needed
  }
  
  export interface Funds {
    id?: number;
    operationFunds: OperationFunds;
    code?: string;
    currency?: Currency;
    amount: number;
    notes?: string;
    updateBy?: User | number;
    updatedById?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }