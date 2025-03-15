export interface Loan {
    id: string;
    customerName: string;
    customerId: string;
    amount: number;
    currency: string;
    issueDate: Date;
    dueDate: Date;
    interestRate?: number;
    collateral?: string;
    isConfidential?: boolean;
    notes?: string;

    status: string;
}