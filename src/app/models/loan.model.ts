export interface Loan {
    id: string;
    customerName: string;
    amount: number;
    currency: string;
    issueDate: Date;
    dueDate: Date;
    status: 'active' | 'repaid' | 'overdue';
}