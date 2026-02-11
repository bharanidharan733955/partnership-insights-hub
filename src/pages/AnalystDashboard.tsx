import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { Download, Filter, TrendingUp, Users, MapPin, DollarSign, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface SalesRecord {
  id: string;
  date: string;
  product_name: string;
  quantity: number;
  sales_amount: number;
  profit: number;
  branch_id: string;
  branches?: {
    name: string;
    location: string;
    partner_id: string;
    partners?: { name: string };
  };
}

interface BranchOption {
  id: string;
  name: string;
  location: string;
  partner_id: string;
  partners?: { name: string };
}

const AnalystDashboard = () => {
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, branchesRes] = await Promise.all([
        supabase
          .from('sales_records')
          .select('*, branches:branch_id(name, location, partner_id, partners:partner_id(name))')
          .order('date', { ascending: false }),
        supabase
          .from('branches')
          .select('id, name, location, partner_id, partners:partner_id(name)'),
      ]);

      if (salesRes.error) throw salesRes.error;
      if (branchesRes.error) throw branchesRes.error;

      setSales((salesRes.data as any) || []);
      setBranches((branchesRes.data as any) || []);
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Derive unique partners from branches
  const partners = useMemo(() => {
    const map = new Map<string, string>();
    branches.forEach(b => {
      if (b.partners?.name) map.set(b.partner_id, b.partners.name);
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [branches]);

  // Filter branches by selected partner
  const filteredBranches = useMemo(() => {
    if (selectedPartner === 'all') return branches;
    return branches.filter(b => b.partner_id === selectedPartner);
  }, [branches, selectedPartner]);

  // Filter sales data
  const filteredSales = useMemo(() => {
    return sales.filter(record => {
      if (selectedPartner !== 'all' && record.branches?.partner_id !== selectedPartner) return false;
      if (selectedBranch !== 'all' && record.branch_id !== selectedBranch) return false;
      if (startDate && record.date < startDate) return false;
      if (endDate && record.date > endDate) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchProduct = record.product_name.toLowerCase().includes(q);
        const matchBranch = record.branches?.name?.toLowerCase().includes(q);
        const matchPartner = record.branches?.partners?.name?.toLowerCase().includes(q);
        if (!matchProduct && !matchBranch && !matchPartner) return false;
      }
      return true;
    });
  }, [sales, selectedPartner, selectedBranch, startDate, endDate, searchQuery]);

  // KPIs
  const totalRevenue = filteredSales.reduce((sum, r) => sum + Number(r.sales_amount), 0);
  const totalProfit = filteredSales.reduce((sum, r) => sum + Number(r.profit), 0);
  const uniqueBranches = new Set(filteredSales.map(r => r.branch_id)).size;

  // Monthly trend for chart
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

  // Branch comparison
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

  // CSV Export
  const handleExport = () => {
    if (filteredSales.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Date', 'Partner', 'Branch', 'Location', 'Product', 'Quantity', 'Sales Amount', 'Profit'];
    const csvContent = [
      headers.join(','),
      ...filteredSales.map(r =>
        `${r.date},${r.branches?.partners?.name || ''},${r.branches?.name || ''},${r.branches?.location || ''},${r.product_name},${r.quantity},${r.sales_amount},${r.profit}`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Analyst Dashboard</h1>
          <p className="text-muted-foreground mt-1">View and verify sales data across all branches</p>
        </div>
        <Button size="lg" onClick={handleExport} className="shadow-lg shadow-primary/20 transition-all active:scale-95">
          <Download className="mr-2 h-5 w-5" />
          Export CSV
        </Button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-chart-1/10"><DollarSign className="h-6 w-6 text-chart-1" /></div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
              <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-chart-2/10"><TrendingUp className="h-6 w-6 text-chart-2" /></div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Profit</p>
              <p className="text-2xl font-bold">₹{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-chart-4/10"><MapPin className="h-6 w-6 text-chart-4" /></div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Active Branches</p>
              <p className="text-2xl font-bold">{uniqueBranches}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-chart-5/10"><Users className="h-6 w-6 text-chart-5" /></div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Records</p>
              <p className="text-2xl font-bold">{filteredSales.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Partner</Label>
              <Select value={selectedPartner} onValueChange={(v) => { setSelectedPartner(v); setSelectedBranch('all'); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Partners</SelectItem>
                  {partners.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-1">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Product, branch..." className="pl-9" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Revenue & Profit Trends</CardTitle>
            <CardDescription>Monthly aggregation across selected filters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => [`₹${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, '']}
                  />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--chart-1))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="profit" name="Profit" stroke="hsl(var(--chart-2))" strokeWidth={2} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Branch Comparison</CardTitle>
            <CardDescription>Revenue ranking by branch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchComparison} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    width={110}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Data Table */}
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-xl font-bold">All Sales Records</CardTitle>
          <CardDescription>
            Showing {filteredSales.length} records
            {selectedPartner !== 'all' && ` • Filtered by partner`}
            {selectedBranch !== 'all' && ` • Filtered by branch`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0">
                <TableRow>
                  <TableHead className="font-bold uppercase text-xs">Date</TableHead>
                  <TableHead className="font-bold uppercase text-xs">Partner</TableHead>
                  <TableHead className="font-bold uppercase text-xs">Branch</TableHead>
                  <TableHead className="font-bold uppercase text-xs">Location</TableHead>
                  <TableHead className="font-bold uppercase text-xs">Product</TableHead>
                  <TableHead className="font-bold uppercase text-xs text-right">Qty</TableHead>
                  <TableHead className="font-bold uppercase text-xs text-right">Sales (₹)</TableHead>
                  <TableHead className="font-bold uppercase text-xs text-right">Profit (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-medium text-sm">
                      {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-sm">
                      <Badge variant="outline" className="font-medium">{record.branches?.partners?.name || '-'}</Badge>
                    </TableCell>
                    <TableCell className="text-sm font-semibold">{record.branches?.name || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{record.branches?.location || '-'}</TableCell>
                    <TableCell className="text-sm">{record.product_name}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{record.quantity}</TableCell>
                    <TableCell className="text-right font-bold font-mono text-sm text-chart-2">
                      ₹{Number(record.sales_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-bold font-mono text-sm text-chart-1">
                      ₹{Number(record.profit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSales.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      No sales records found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalystDashboard;
