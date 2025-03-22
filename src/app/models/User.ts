export interface User {
    id?: number;
    fullName: string;
    email: string;
    phoneNumber?: string;
    password?: string;
    role?: string;
    address?: string;
    notes?: string;
    type?: string
    status?: boolean;
    lastActive?: Date;
    createdAt?: any;
    editingCustomerId?: number;
    active?: boolean;
    locked?: boolean;
}