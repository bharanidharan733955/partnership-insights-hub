import { Partner, KPIData, RevenueData, PartnerPerformance, Notification, User } from '@/types';

export const currentUser: User = {
  id: '1',
  name: 'Sarah Mitchell',
  email: 'sarah.mitchell@company.com',
  role: 'admin',
  avatar: undefined,
  partnerId: '1', // Link admin to first partner for demo completeness
};

export const kpiData: KPIData = {
  totalRevenue: 4250000,
  revenueChange: 12.5,
  activePartners: 47,
  partnersChange: 8,
  avgEngagement: 78.4,
  engagementChange: 5.2,
  growthRate: 23.8,
  growthChange: -2.1,
};

export const revenueData: RevenueData[] = [
  { month: 'Jan', revenue: 320000, target: 300000 },
  { month: 'Feb', revenue: 350000, target: 320000 },
  { month: 'Mar', revenue: 380000, target: 350000 },
  { month: 'Apr', revenue: 340000, target: 360000 },
  { month: 'May', revenue: 420000, target: 380000 },
  { month: 'Jun', revenue: 480000, target: 400000 },
  { month: 'Jul', revenue: 510000, target: 420000 },
  { month: 'Aug', revenue: 490000, target: 450000 },
  { month: 'Sep', revenue: 530000, target: 480000 },
  { month: 'Oct', revenue: 580000, target: 500000 },
  { month: 'Nov', revenue: 620000, target: 550000 },
  { month: 'Dec', revenue: 680000, target: 600000 },
];

export const partnerPerformance: PartnerPerformance[] = [
  { name: 'TechCorp Solutions', revenue: 850000, engagement: 92, growth: 28 },
  { name: 'Global Dynamics', revenue: 720000, engagement: 88, growth: 15 },
  { name: 'Nexus Industries', revenue: 650000, engagement: 75, growth: 22 },
  { name: 'Quantum Systems', revenue: 580000, engagement: 81, growth: 18 },
  { name: 'Atlas Partners', revenue: 490000, engagement: 70, growth: 12 },
];

export const partners: Partner[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    industry: 'Technology',
    status: 'active',
    revenue: 850000,
    growthRate: 28,
    engagementScore: 92,
    startDate: '2022-03-15',
    contactEmail: 'partnerships@techcorp.com',
    tier: 'platinum',
  },
  {
    id: '2',
    name: 'Global Dynamics',
    industry: 'Manufacturing',
    status: 'active',
    revenue: 720000,
    growthRate: 15,
    engagementScore: 88,
    startDate: '2021-08-22',
    contactEmail: 'bd@globaldynamics.com',
    tier: 'platinum',
  },
  {
    id: '3',
    name: 'Nexus Industries',
    industry: 'Energy',
    status: 'active',
    revenue: 650000,
    growthRate: 22,
    engagementScore: 75,
    startDate: '2023-01-10',
    contactEmail: 'partners@nexus.io',
    tier: 'gold',
  },
  {
    id: '4',
    name: 'Quantum Systems',
    industry: 'Healthcare',
    status: 'active',
    revenue: 580000,
    growthRate: 18,
    engagementScore: 81,
    startDate: '2022-06-05',
    contactEmail: 'info@quantumsystems.com',
    tier: 'gold',
  },
  {
    id: '5',
    name: 'Atlas Partners',
    industry: 'Finance',
    status: 'active',
    revenue: 490000,
    growthRate: 12,
    engagementScore: 70,
    startDate: '2023-04-18',
    contactEmail: 'partnerships@atlas.co',
    tier: 'silver',
  },
  {
    id: '6',
    name: 'Vertex Corp',
    industry: 'Retail',
    status: 'pending',
    revenue: 320000,
    growthRate: 8,
    engagementScore: 65,
    startDate: '2024-01-02',
    contactEmail: 'contact@vertex.com',
    tier: 'silver',
  },
  {
    id: '7',
    name: 'Meridian Group',
    industry: 'Logistics',
    status: 'active',
    revenue: 410000,
    growthRate: 25,
    engagementScore: 78,
    startDate: '2023-07-12',
    contactEmail: 'bd@meridiangroup.com',
    tier: 'gold',
  },
  {
    id: '8',
    name: 'Horizon Labs',
    industry: 'Technology',
    status: 'inactive',
    revenue: 180000,
    growthRate: -5,
    engagementScore: 42,
    startDate: '2021-11-30',
    contactEmail: 'info@horizonlabs.io',
    tier: 'bronze',
  },
];

export const notifications: Notification[] = [
  {
    id: '1',
    type: 'alert',
    title: 'Performance Alert',
    message: 'Horizon Labs engagement dropped below threshold (42%)',
    timestamp: '2024-01-15T10:30:00Z',
    read: false,
  },
  {
    id: '2',
    type: 'success',
    title: 'Target Achieved',
    message: 'TechCorp Solutions exceeded Q4 revenue target by 15%',
    timestamp: '2024-01-14T16:45:00Z',
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'New Partner',
    message: 'Vertex Corp partnership pending approval',
    timestamp: '2024-01-14T09:15:00Z',
    read: true,
  },
  {
    id: '4',
    type: 'warning',
    title: 'Review Required',
    message: 'Atlas Partners contract renewal due in 30 days',
    timestamp: '2024-01-13T14:00:00Z',
    read: true,
  },
];

export const industryDistribution = [
  { name: 'Technology', value: 35, color: 'hsl(var(--chart-1))' },
  { name: 'Manufacturing', value: 20, color: 'hsl(var(--chart-2))' },
  { name: 'Healthcare', value: 18, color: 'hsl(var(--chart-3))' },
  { name: 'Finance', value: 15, color: 'hsl(var(--chart-4))' },
  { name: 'Other', value: 12, color: 'hsl(var(--chart-5))' },
];

export const tierDistribution = [
  { tier: 'Platinum', count: 2, revenue: 1570000 },
  { tier: 'Gold', count: 3, revenue: 1640000 },
  { tier: 'Silver', count: 2, revenue: 810000 },
  { tier: 'Bronze', count: 1, revenue: 180000 },
];