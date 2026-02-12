import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getSalesHistory, getPartners } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { toast } from 'sonner';

interface SalesRecord {
  id: string;
  date: string;
  product_name: string;
  sales_amount: number;
  profit: number;
  branch_id: string;
  branches?: { name: string; location: string; partners?: { name: string }; partner_id?: string };
}

interface BranchOption {
  id: string;
  name: string;
  location: string;
  partner_id: string;
  partners?: { name: string };
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

function toRecord(r: any): SalesRecord {
  const amt = r.salesAmount ?? r.sales_amount ?? 0;
  const branch = r.branch || r.branches;
  const partner = branch?.partner;
  return {
    id: r.id,
    date: typeof r.date === 'string' ? r.date : (r.date?.toISOString?.()?.split('T')[0] ?? ''),
    product_name: r.productName ?? r.product_name ?? '',
    sales_amount: amt,
    profit: r.profit ?? 0,
    branch_id: r.branchId ?? r.branch_id ?? '',
    branches: branch ? {
      name: branch.name ?? '',
      location: branch.location ?? '',
      partner_id: branch.partnerId ?? partner?.id ?? '',
      partners: partner ? { name: partner.name ?? '' } : undefined,
    } : undefined,
  };
}

export default function AnalyticsPage() {
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesData, partnersData] = await Promise.all([
        getSalesHistory({ startDate: startDate || undefined, endDate: endDate || undefined }),
        getPartners(),
      ]);
      const records = Array.isArray(salesData) ? salesData.map(toRecord) : [];
      setSales(records);
      const branchList: BranchOption[] = [];
      (partnersData || []).forEach((p: any) => {
        (p.branches || []).forEach((b: any) => {
          branchList.push({
            id: b.id,
            name: b.name,
            location: b.location,
            partner_id: p.id,
            partners: { name: p.name },
          });
        });
      });
      setBranches(branchList);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      toast.error(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const partners = useMemo(() => {
    const map = new Map<string, string>();
    branches.forEach(b => {
      if (b.partners?.name) map.set(b.partner_id, b.partners.name);
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [branches]);

  const filteredBranches = useMemo(() => {
    if (selectedPartner === 'all') return branches;
    return branches.filter(b => b.partner_id === selectedPartner);
  }, [branches, selectedPartner]);

  const filteredSales = useMemo(() => {
    return sales.filter(record => {
      if (selectedPartner !== 'all' && record.branches?.partner_id !== selectedPartner) return false;
      if (selectedBranch !== 'all' && record.branch_id !== selectedBranch) return false;
      const d = record.date;
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    });
  }, [sales, selectedPartner, selectedBranch, startDate, endDate]);

  const totalRevenue = filteredSales.reduce((sum, r) => sum + Number(r.sales_amount), 0);
  const totalProfit = filteredSales.reduce((sum, r) => sum + Number(r.profit), 0);

  const monthlyTrend = useMemo(() => {
    const monthMap: Record<string, { month: string; revenue: number; profit: number }> = {};
    filteredSales.forEach((record) => {
      const date = new Date(record.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      if (!monthMap[key]) monthMap[key] = { month: label, revenue: 0, profit: 0 };
      monthMap[key].revenue += Number(record.sales_amount);
      monthMap[key].profit += Number(record.profit);
    });
    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([, v]) => v);
  }, [filteredSales]);

  const branchComparison = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; profit: number }> = {};
    filteredSales.forEach((record) => {
      const branchName = record.branches?.name || 'Unknown';
      if (!map[record.branch_id]) map[record.branch_id] = { name: branchName, revenue: 0, profit: 0 };
      map[record.branch_id].revenue += Number(record.sales_amount);
      map[record.branch_id].profit += Number(record.profit);
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  const pieData = useMemo(() => {
    const total = branchComparison.reduce((s, b) => s + b.revenue, 0);
    if (total === 0) return [];
    return branchComparison.map(b => ({
      name: b.name,
      value: Math.round((b.revenue / total) * 100),
    }));
  }, [branchComparison]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Graphical representation with branch comparison and filters</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
            <CardDescription>Select partner, branch, and date range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Partner</Label>
                <Select value={selectedPartner} onValueChange={(v) => { setSelectedPartner(v); setSelectedBranch('all'); }}>
                  <SelectTrigger><SelectValue placeholder="All Partners" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Partners</SelectItem>
                    {partners.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Branch</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger><SelectValue placeholder="All Branches" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {filteredBranches.map(b => <SelectItem key={b.id} value={b.id}>{b.name} ({b.location})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">From</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">To</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">INR {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <Calendar className="w-8 h-8 text-chart-1/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Profit</p>
                  <p className="text-2xl font-bold text-chart-2">INR {totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-chart-2/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Records</p>
                  <p className="text-2xl font-bold">{filteredSales.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend + Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-chart-1" />
                Revenue & Profit Trend
              </CardTitle>
              <CardDescription>Monthly aggregation for selected filters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 min-h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                  <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickFormatter={(v) => `INR ${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(value: number) => [`INR ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, '']}
                    />
                    <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={1200} animationEasing="ease-out" />
                    <Bar dataKey="profit" name="Profit" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={1200} animationEasing="ease-out" animationBegin={200} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChartIcon className="w-5 h-5 text-chart-3" />
                Revenue Share by Branch
              </CardTitle>
              <CardDescription>Percentage of total revenue per branch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 min-h-[280px] w-full">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        formatter={(value: number) => [`${value}%`, 'Share']}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No data for pie chart</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Branch Comparison */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-chart-4" />
              Branch Comparison
            </CardTitle>
            <CardDescription>Revenue ranking by branch for selected filters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 min-h-[320px] w-full">
              {branchComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                  <BarChart data={branchComparison} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickFormatter={(v) => `INR ${(v / 1000).toFixed(0)}k`} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      width={95}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(value: number) => [`INR ${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" name="Revenue (INR)" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} barSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No branch data to compare</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
