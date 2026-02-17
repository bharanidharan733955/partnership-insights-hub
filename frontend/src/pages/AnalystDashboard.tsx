import { useState, useEffect, useMemo, useRef } from 'react';
import { getSalesHistory, getPartners } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { Download, TrendingUp, Users, MapPin, DollarSign, Search, FileText } from 'lucide-react';
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    partner_id?: string;
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

function toRecord(r: any): SalesRecord {
  const amt = r.salesAmount ?? r.sales_amount ?? 0;
  const branch = r.branch || r.branches;
  const partner = branch?.partner;
  return {
    id: r.id,
    date: typeof r.date === 'string' ? r.date : (r.date?.toISOString?.()?.split('T')[0] ?? ''),
    product_name: r.productName ?? r.product_name ?? '',
    quantity: r.quantity ?? 0,
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

const AnalystDashboard = () => {
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const chartRef = useRef<HTMLDivElement>(null);

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
      console.error('Failed to fetch data:', err);
      toast.error(err.message || 'Failed to load analytics data');
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
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchProduct = (record.product_name || '').toLowerCase().includes(q);
        const matchBranch = (record.branches?.name || '').toLowerCase().includes(q);
        const matchPartner = (record.branches?.partners?.name || '').toLowerCase().includes(q);
        if (!matchProduct && !matchBranch && !matchPartner) return false;
      }
      return true;
    });
  }, [sales, selectedPartner, selectedBranch, startDate, endDate, searchQuery]);

  const totalRevenue = filteredSales.reduce((sum, r) => sum + Number(r.sales_amount), 0);
  const totalProfit = filteredSales.reduce((sum, r) => sum + Number(r.profit), 0);
  const uniqueBranches = new Set(filteredSales.map(r => r.branch_id)).size;

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

  const selectedBranchMeta = useMemo(() => {
    if (selectedBranch === 'all') return null;
    return branches.find(b => b.id === selectedBranch) || null;
  }, [branches, selectedBranch]);

  const branchMonthlyComparison = useMemo(() => {
    if (selectedBranch === 'all') return [];
    // filteredSales already includes Partner/Date/Search filters; this chart focuses on the selected branch
    const monthMap: Record<string, { month: string; revenue: number; profit: number }> = {};
    filteredSales.forEach((record) => {
      if (record.branch_id !== selectedBranch) return;
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
  }, [filteredSales, selectedBranch]);

  const handleExportCSV = () => {
    if (filteredSales.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Date', 'Partner', 'Branch', 'Location', 'Product', 'Quantity', 'Sales Amount (INR)', 'Profit (INR)'];
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

  const handleExportPDF = async () => {
    if (filteredSales.length === 0) {
      toast.error('No data to export');
      return;
    }
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 15;
      const colW = (pageW - margin * 2) / 8;
      let y = 20;

      doc.setFontSize(16);
      doc.text('Sales Analytics Report', margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleDateString()} | Records: ${filteredSales.length}`, margin, y);
      y += 12;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Revenue (INR): ${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, margin, y);
      y += 6;
      doc.text(`Total Profit (INR): ${totalProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, margin, y);
      y += 12;

      const headers = ['Date', 'Partner', 'Branch', 'Location', 'Product', 'Qty', 'Sales (INR)', 'Profit (INR)'];
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      headers.forEach((h, i) => doc.text(h, margin + i * colW, y));
      y += 8;
      doc.setFont(undefined, 'normal');

      filteredSales.forEach((r) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const row = [
          r.date,
          (r.branches?.partners?.name || '-').substring(0, 12),
          (r.branches?.name || '-').substring(0, 10),
          (r.branches?.location || '-').substring(0, 10),
          (r.product_name || '-').substring(0, 12),
          String(r.quantity),
          Number(r.sales_amount).toFixed(0),
          Number(r.profit).toFixed(0),
        ];
        row.forEach((cell, i) => doc.text(String(cell).substring(0, 15), margin + i * colW, y));
        y += 6;
      });

      if (chartRef.current) {
        try {
          const canvas = await html2canvas(chartRef.current, { scale: 2, useCORS: true, logging: false });
          const imgData = canvas.toDataURL('image/png');
          doc.addPage('a4', 'landscape');
          const imgW = doc.internal.pageSize.getWidth();
          const imgH = (canvas.height * imgW) / canvas.width;
          doc.addImage(imgData, 'PNG', 10, 15, Math.min(imgW - 20, 270), Math.min(imgH, 170));
        } catch {
          doc.addPage();
          doc.text('Revenue & Profit Chart (see dashboard)', margin, 30);
        }
      }

      doc.save(`sales_report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF report downloaded');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to generate PDF');
    }
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
          <p className="text-muted-foreground mt-1">View analytics for your selected branch</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="lg" onClick={handleExportCSV} className="transition-all active:scale-95">
            <Download className="mr-2 h-5 w-5" />
            CSV
          </Button>
          <Button size="lg" onClick={handleExportPDF} className="shadow-lg shadow-primary/20 transition-all active:scale-95">
            <FileText className="mr-2 h-5 w-5" />
            Export PDF
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-chart-1/10"><DollarSign className="h-6 w-6 text-chart-1" /></div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
              <p className="text-2xl font-bold">INR {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-chart-2/10"><TrendingUp className="h-6 w-6 text-chart-2" /></div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Profit</p>
              <p className="text-2xl font-bold">INR {totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
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

      <Card className="lg:col-span-2 border-none shadow-lg" ref={chartRef}>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Revenue & Profit Trends</CardTitle>
          <CardDescription>Monthly aggregation for selected branch data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v) => `INR ${(v / 1000).toFixed(0)}k`} />
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

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Monthly Comparison (Selected Branch)</CardTitle>
          <CardDescription>
            {selectedBranchMeta
              ? `${selectedBranchMeta.name} (${selectedBranchMeta.location}) • last 12 months`
              : 'Select a branch to see month-by-month comparison'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedBranch === 'all' ? (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground">
              Please choose a branch from the filter above.
            </div>
          ) : branchMonthlyComparison.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-muted-foreground">
              No data found for this branch in the selected range.
            </div>
          ) : (
            <div className="h-[320px] min-h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                <BarChart data={branchMonthlyComparison} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(v) => `INR ${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => [`INR ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, '']}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={900} animationEasing="ease-out" />
                  <Bar dataKey="profit" name="Profit" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={900} animationEasing="ease-out" animationBegin={150} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-xl font-bold">Sales Records</CardTitle>
          <CardDescription>
            Showing {filteredSales.length} records
            {selectedBranch !== 'all' && ' • Filtered by branch'}
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
                  <TableHead className="font-bold uppercase text-xs text-right">Sales (INR)</TableHead>
                  <TableHead className="font-bold uppercase text-xs text-right">Profit (INR)</TableHead>
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
                      INR {Number(record.sales_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-bold font-mono text-sm text-chart-1">
                      INR {Number(record.profit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
