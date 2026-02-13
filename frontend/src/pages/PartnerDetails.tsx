import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { partners, revenueData } from '@/data/mockData';
import { useUser } from '@/contexts/UserContext';
import {
    Building2,
    Mail,
    TrendingUp,
    DollarSign,
    Activity,
    ArrowLeft,
    Calendar,
    Award,
    Globe,
    Phone,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { cn } from '@/lib/utils';

export default function PartnerDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();

    // Find partner
    const partner = partners.find(p => p.id === id);

    // RBAC check: 
    // If role is 'partner', they can only see their own details (matching partnerId)
    // Analyst and Admin can see everything.
    const isAuthorized = user.role !== 'partner' || user.partnerId === id;

    if (!partner || !isAuthorized) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Building2 className="w-16 h-16 text-muted-foreground/20" />
                    <h2 className="text-xl font-semibold">Partner Not Found</h2>
                    <p className="text-muted-foreground">The partner record does not exist or you do not have permission to view it.</p>
                    <Button onClick={() => navigate(-1)}>Go Back</Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in">
                {/* Back Button & Header */}
                <div className="flex flex-col gap-4">
                    <Button
                        variant="ghost"
                        className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Partners
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <Building2 size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{partner.name}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="capitalize">{partner.industry}</Badge>
                                    <span className="text-muted-foreground text-sm">•</span>
                                    <span className="text-muted-foreground text-sm flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        Partner since {new Date(partner.startDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2">
                                <Mail className="w-4 h-4" />
                                Contact Partner
                            </Button>
                            {user.role === 'admin' && (
                                <Button className="gap-2">
                                    Edit Details
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-border/50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Lifetime Revenue</p>
                                    <h3 className="text-2xl font-bold mt-1">${partner.revenue.toLocaleString()}</h3>
                                    <p className="text-xs text-success font-medium flex items-center mt-2">
                                        <ArrowUpRight className="w-3 h-3 mr-1" />
                                        +12% vs last year
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-chart-1/10 flex items-center justify-center text-chart-1">
                                    <DollarSign size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
                                    <h3 className="text-2xl font-bold mt-1">{partner.growthRate}%</h3>
                                    <p className={cn(
                                        "text-xs font-medium flex items-center mt-2",
                                        partner.growthRate >= 0 ? "text-success" : "text-destructive"
                                    )}>
                                        {partner.growthRate >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                        Higher than sector avg
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-chart-2/10 flex items-center justify-center text-chart-2">
                                    <TrendingUp size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Engagement Score</p>
                                    <h3 className="text-2xl font-bold mt-1">{partner.engagementScore}%</h3>
                                    <div className="w-24 h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
                                        <div
                                            className="h-full bg-chart-1 rounded-full"
                                            style={{ width: `${partner.engagementScore}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-chart-4/10 flex items-center justify-center text-chart-4">
                                    <Activity size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Partner Tier</p>
                                    <h3 className="text-2xl font-bold mt-1 capitalize">{partner.tier}</h3>
                                    <p className="text-xs text-muted-foreground font-medium flex items-center mt-2">
                                        <Award className="w-3 h-3 mr-1" />
                                        Top 5% of network
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-chart-5/10 flex items-center justify-center text-chart-5">
                                    <Award size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Details and Chart Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Revenue Trend */}
                    <Card className="lg:col-span-2 border-border/50 shadow-sm">
                        <CardHeader>
                            <CardTitle>Revenue Performance</CardTitle>
                            <CardDescription>Monthly revenue distribution for {partner.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis
                                            dataKey="month"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                            tickFormatter={(value) => `$${value / 1000}k`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                borderColor: 'hsl(var(--border))',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="hsl(var(--chart-1))"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact & Info */}
                    <Card className="border-border/50 shadow-sm h-fit">
                        <CardHeader>
                            <CardTitle>Partner Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
                                        <Mail size={16} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                                        <p className="text-sm font-medium">{partner.contactEmail}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
                                        <Globe size={16} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Website</label>
                                        <p className="text-sm font-medium">www.{partner.name.toLowerCase().replace(/\s/g, '')}.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
                                        <Phone size={16} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact Number</label>
                                        <p className="text-sm font-medium">+1 (555) 123-4567</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">Partnership Status</label>
                                <div className="flex items-center gap-3 bg-success/5 border border-success/10 p-3 rounded-xl">
                                    <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                                    <span className="text-sm font-bold text-success capitalize">{partner.status}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
