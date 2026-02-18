import apiClient from './api.client';
import type {
    Feedback,
    CreateFeedbackRequest,
    FeedbackStats,
    Report,
    GenerateReportRequest
} from '../types/feedback.types';

class FeedbackService {
    /**
     * Create new feedback
     */
    async createFeedback(data: CreateFeedbackRequest): Promise<Feedback> {
        const response = await apiClient.post<Feedback>('/feedback', data);
        return response.data;
    }

    /**
     * Get feedback for a specific branch
     */
    async getFeedbackByBranch(
        branchId: string,
        params?: { startDate?: string; endDate?: string }
    ): Promise<Feedback[]> {
        const response = await apiClient.get<Feedback[]>(`/feedback/branch/${branchId}`, { params });
        return response.data;
    }

    /**
     * Get all feedback (analyst only)
     */
    async getAllFeedback(params?: { date?: string; branchId?: string }): Promise<Feedback[]> {
        const response = await apiClient.get<Feedback[]>('/feedback', { params });
        return response.data;
    }

    /**
     * Get feedback statistics
     */
    async getFeedbackStats(params?: {
        branchId?: string;
        startDate?: string;
        endDate?: string
    }): Promise<FeedbackStats> {
        const response = await apiClient.get<FeedbackStats>('/feedback/stats', { params });
        return response.data;
    }

    /**
     * Update feedback status
     */
    async updateFeedbackStatus(
        id: string,
        status: 'pending' | 'acknowledged' | 'resolved'
    ): Promise<Feedback> {
        const response = await apiClient.patch<Feedback>(`/feedback/${id}`, { status });
        return response.data;
    }

    /**
     * Delete feedback (analyst only)
     */
    async deleteFeedback(id: string): Promise<void> {
        await apiClient.delete(`/feedback/${id}`);
    }

    /**
     * Analyst reply to feedback
     */
    async replyToFeedback(id: string, reply: string): Promise<Feedback> {
        const response = await apiClient.patch<Feedback>(`/feedback/${id}/reply`, { reply });
        return response.data;
    }

    /**
     * Generate report
     */
    async generateReport(data: GenerateReportRequest): Promise<Report> {
        const response = await apiClient.post<Report>('/reports/generate', data);
        return response.data;
    }

    /**
     * Get reports
     */
    async getReports(params?: {
        type?: string;
        branchId?: string;
        startDate?: string;
        endDate?: string
    }): Promise<Report[]> {
        const response = await apiClient.get<Report[]>('/reports', { params });
        return response.data;
    }

    /**
     * Get single report
     */
    async getReportById(id: string): Promise<Report> {
        const response = await apiClient.get<Report>(`/reports/${id}`);
        return response.data;
    }

    /**
     * Delete report
     */
    async deleteReport(id: string): Promise<void> {
        await apiClient.delete(`/reports/${id}`);
    }
}

export const feedbackService = new FeedbackService();
