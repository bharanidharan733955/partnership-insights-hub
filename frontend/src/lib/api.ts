// This file provides backward compatibility with the old API
// It re-exports functions from the new service layer
import { authService, partnershipService } from '../services';

export async function authLogin(email: string, password: string) {
  return authService.login(email, password);
}

export async function authRegister(data: {
  email: string;
  password: string;
  name: string;
  branchName: string;
  branchLocation: string;
}) {
  return authService.register(data);
}

export async function authGoogleLogin(idToken: string) {
  return authService.googleLogin(idToken);
}

export async function getSalesHistory(params?: {
  partnerId?: string;
  branchId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return partnershipService.getSalesHistory(params);
}

export async function getPartners() {
  return partnershipService.getPartners();
}

export async function submitSales(data: {
  date: string;
  productName: string;
  quantity: number;
  salesAmount: number;
  profit: number;
}) {
  return partnershipService.submitSales(data);
}

export async function submitCustomerFeedback(data: {
  date: string;
  totalCustomers: number;
  satisfiedCustomers: number;
  overallRating: number;
  complaints?: string;
  highlights?: string;
}) {
  return partnershipService.submitCustomerFeedback(data);
}
