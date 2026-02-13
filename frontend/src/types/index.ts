export type UserRole = 'admin' | 'analyst' | 'manager' | 'partner';

export interface User {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  partnerId?: string;
  partner_id?: string | null;
  branchId?: string;
  branch_id?: string | null;
  branch?: {
    id?: string;
    name: string;
    location: string;
  } | null;
  partner?: {
    id?: string;
    name: string;
  } | null;
}

export interface Partner {
  id: string;
  name: string;
  industry: string;
  status: 'active' | 'inactive' | 'pending';
  revenue: number;
  growthRate: number;
  engagementScore: number;
  startDate: string;
  contactEmail: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
}

export interface KPIData {
  totalRevenue: number;
  revenueChange: number;
  activePartners: number;
  partnersChange: number;
  avgEngagement: number;
  engagementChange: number;
  growthRate: number;
  growthChange: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  target: number;
}

export interface PartnerPerformance {
  name: string;
  revenue: number;
  engagement: number;
  growth: number;
}

export interface Notification {
  id: string;
  type: 'alert' | 'info' | 'warning' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
