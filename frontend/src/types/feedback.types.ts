export interface Feedback {
    _id: string;
    branch_id: string;
    branch?: {
        _id: string;
        name: string;
        location: string;
    };
    analyst_id: string;
    analyst?: {
        _id: string;
        name: string;
        email: string;
    };
    date: string;
    rating: number;
    category: 'sales' | 'performance' | 'communication' | 'compliance';
    comment: string;
    issues: string[];
    suggestions: string[];
    status: 'pending' | 'acknowledged' | 'resolved';
    createdAt: string;
    updatedAt: string;
}

export interface CreateFeedbackRequest {
    branch_id: string;
    date?: string;
    rating: number;
    category: 'sales' | 'performance' | 'communication' | 'compliance';
    comment: string;
    issues?: string[];
    suggestions?: string[];
}

export interface FeedbackStats {
    average_rating: number;
    total_feedback: number;
    issues_count: number;
    resolved_count: number;
}

export interface Report {
    _id: string;
    type: 'daily' | 'weekly' | 'monthly';
    date: string;
    branch_id?: string;
    branch?: {
        _id: string;
        name: string;
        location: string;
    };
    metrics: FeedbackStats;
    generated_by: string;
    createdAt: string;
}

export interface GenerateReportRequest {
    type: 'daily' | 'weekly' | 'monthly';
    branch_id?: string;
    startDate: string;
    endDate: string;
}
