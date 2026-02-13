import apiClient from './api.client';
import type {
    SalesEntry,
    Partner,
    SalesHistoryParams,
    SubmitSalesRequest
} from '../types/api.types';

/**
 * Partnership API Service
 * Handles all partnership and sales-related API calls
 */
class PartnershipService {
    /**
     * Get sales history with optional filters
     */
    async getSalesHistory(params?: SalesHistoryParams): Promise<SalesEntry[]> {
        const queryParams = new URLSearchParams();

        if (params?.partnerId) queryParams.set('partnerId', params.partnerId);
        if (params?.branchId) queryParams.set('branchId', params.branchId);
        if (params?.startDate) queryParams.set('startDate', params.startDate);
        if (params?.endDate) queryParams.set('endDate', params.endDate);

        const url = `/sales/history${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await apiClient.get<SalesEntry[]>(url);

        return response.data;
    }

    /**
     * Submit new sales entry
     */
    async submitSales(data: SubmitSalesRequest): Promise<SalesEntry> {
        const response = await apiClient.post<SalesEntry>('/sales', data);
        return response.data;
    }

    /**
     * Get all partners (analyst only)
     */
    async getPartners(): Promise<Partner[]> {
        const response = await apiClient.get<Partner[]>('/partners');
        return response.data;
    }

    /**
     * Get partner by ID
     */
    async getPartnerById(partnerId: string): Promise<Partner> {
        const response = await apiClient.get<Partner>(`/partners/${partnerId}`);
        return response.data;
    }

    /**
     * Get sales analytics data
     */
    async getAnalytics(params?: SalesHistoryParams): Promise<any> {
        const queryParams = new URLSearchParams();

        if (params?.partnerId) queryParams.set('partnerId', params.partnerId);
        if (params?.startDate) queryParams.set('startDate', params.startDate);
        if (params?.endDate) queryParams.set('endDate', params.endDate);

        const url = `/analytics${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await apiClient.get(url);

        return response.data;
    }
}

export default new PartnershipService();
