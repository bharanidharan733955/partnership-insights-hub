// API Types and Interfaces
export interface User {
    _id: string;
    email: string;
    name: string;
    role: 'ANALYST' | 'PARTNER';
    branchName?: string;
    branchLocation?: string;
    createdAt: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    branchName: string;
    branchLocation: string;
}

export interface SalesEntry {
    _id: string;
    date: string;
    productName: string;
    quantity: number;
    salesAmount: number;
    profit: number;
    partnerId: string;
    branchId?: string;
    createdAt: string;
}

export interface Partner {
    _id: string;
    email: string;
    name: string;
    branchName: string;
    branchLocation: string;
    role: string;
    createdAt: string;
}

export interface SalesHistoryParams {
    partnerId?: string;
    branchId?: string;
    startDate?: string;
    endDate?: string;
}

export interface SubmitSalesRequest {
    date: string;
    productName: string;
    quantity: number;
    salesAmount: number;
    profit: number;
}

export interface ApiError {
    error: string;
    message?: string;
}
