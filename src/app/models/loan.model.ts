export interface Loan {
    id: number; // Change to number to match Java Long
    customerName: string;
    customerId: string;
    amount: number;
    currency: string;
    issueDate: Date;
    dueDate: Date;
    status: string; // Will be converted to/from LoanStatus enum
    interestRate?: number;
    collateral?: string;
    isConfidential?: boolean;
    notes?: string;
    company?: any; // Add to match backend model
    createdBy?: any; // Add to match backend model
    createdAt?: Date; // Add to match backend model
    updatedAt?: Date; // Add to match backend model
  }