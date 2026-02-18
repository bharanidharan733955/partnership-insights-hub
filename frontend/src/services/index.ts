// Export all services from a single entry point
export { default as authService } from './auth.service';
export { default as partnershipService } from './partnership.service';
export { default as apiClient } from './api.client';
export { feedbackService } from './feedback.service';

// Re-export types for convenience
export type * from '../types/api.types';
export type * from '../types/feedback.types';
