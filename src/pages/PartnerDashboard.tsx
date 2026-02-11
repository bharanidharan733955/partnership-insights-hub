import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Plus, History, Save, Calendar, TrendingUp, AlertCircle, DollarSign, Package, BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface SalesRecord {
  id: string;
  date: string;
  product_name: string;
  quantity: number;
  sales_amount: number;
  profit: number;
  created_at: string;
}

const PartnerDashboard = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    salesAmount: '',
    profit: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_records')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (err: any) {
      console.error('Failed to fetch sales history', err);
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.branch_id) {
      toast.error('No branch assigned to your account');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('sales_records').upsert(
        {
          date: formData.date,
          product_name: formData.productName.trim(),
          quantity: parseInt(formData.quantity),
          sales_amount: parseFloat(formData.salesAmount),
          profit: parseFloat(formData.profit),
          branch_id: user.branch_id,
          submitted_by: user.user_id,
        },
        { onConflict: 'date,branch_id,product_name' }
      );

      if (error) throw error;

      setFormData({
        productName: '',
        quantity: '',
        salesAmount: '',
        profit: '',
        date: new Date().toISOString().split('T')[0],
      });
      toast.success('Sales record submitted successfully');
      fetchHistory();
    } catch (err: any) {
      console.error('Submit error:', err);
      toast.error(err.message || 'Failed to submit sales record');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate monthly performance from sales data
  const monthlyData = useMemo(() => {
    const monthMap: Record<string, { month: string; revenue: number; profit: number }> = {};
    sales.forEach((record) => {
      const date = new Date(record.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      if (!monthMap[key]) {
        monthMap[key] = { month: label, revenue: 0, profit: 0 };
      }
      monthMap[key].revenue += Number(record.sales_amount);
      monthMap[key].profit += Number(record.profit);
    });
    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, v]) => v);
  }, [sales]);

  const totalRevenue = sales.reduce((sum, r) => sum + Number(r.sales_amount), 0);
  const totalProfit = sales.reduce((sum, r) => sum + Number(r.profit), 0);
  const totalRecords = sales.length;

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Daily Sales Entry</h1>
        <div className="flex items-center gap-2 mt-2">
          {user?.branch && (
            <>
              <Badge variant="outline" className="text-sm px-3">{user.branch.name}</Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground text-sm font-medium">{user.branch.location}</span>
            </>
          )}
          {user?.partner && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground text-sm">{user.partner.name}</span>
            </>
          )}
        </div>
      </header>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-chart-1/10">
              <DollarSign className="h-6 w-6 text-chart-1" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
              <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-chart-2/10">
              <TrendingUp className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Profit</p>
              <p className="text-2xl font-bold">₹{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-chart-4/10">
              <Package className="h-6 w-6 text-chart-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Entries</p>
              <p className="text-2xl font-bold">{totalRecords}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Sales Entry Form */}
        <Card className="xl:col-span-1 border-none shadow-lg h-fit sticky top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Plus className="text-primary h-5 w-5" />
              New Sales Entry
            </CardTitle>
            <CardDescription>Enter today's sales data for your branch</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="product" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product / Category</Label>
                <Input
                  id="product"
                  required
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="e.g. Electronics, Clothing"
                  className="h-11 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="25"
                    className="h-11 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sale Date</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="h-11 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revenue" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sales Amount (₹)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.salesAmount}
                    onChange={(e) => setFormData({ ...formData, salesAmount: e.target.value })}
                    placeholder="1200.00"
                    className="h-11 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profit" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Profit (₹)</Label>
                  <Input
                    id="profit"
                    type="number"
                    required
                    step="0.01"
                    value={formData.profit}
                    onChange={(e) => setFormData({ ...formData, profit: e.target.value })}
                    placeholder="350.00"
                    className="h-11 shadow-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full shadow-lg shadow-primary/20 transition-all active:scale-95 py-6 text-lg font-bold"
              >
                {submitting ? <span className="animate-spin">⏳</span> : <Save className="mr-2 h-5 w-5" />}
                Submit Record
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sales History Table */}
        <Card className="xl:col-span-2 border-none shadow-lg overflow-hidden">
          <CardHeader className="border-b bg-muted/20 pb-5">
            <CardTitle className="flex items-center gap-2 text-xl">
              <History className="text-muted-foreground h-5 w-5" />
              Sales History
            </CardTitle>
            <CardDescription>Your branch's submitted sales records</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0">
                  <TableRow>
                    <TableHead className="font-bold uppercase text-xs w-[120px]">Date</TableHead>
                    <TableHead className="font-bold uppercase text-xs">Product</TableHead>
                    <TableHead className="font-bold uppercase text-xs text-right">Qty</TableHead>
                    <TableHead className="font-bold uppercase text-xs text-right">Sales (₹)</TableHead>
                    <TableHead className="font-bold uppercase text-xs text-right">Profit (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((record) => (
                    <TableRow key={record.id} className="hover:bg-muted/40 transition-colors border-muted/50">
                      <TableCell className="font-medium text-sm">
                        {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-sm font-semibold">{record.product_name}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{record.quantity}</TableCell>
                      <TableCell className="text-right font-bold font-mono text-sm text-chart-2">
                        ₹{Number(record.sales_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-bold font-mono text-sm text-chart-1">
                        ₹{Number(record.profit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {sales.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="h-8 w-8 opacity-20" />
                          <p>No sales records yet. Start entering daily data!</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance Chart */}
      {monthlyData.length > 0 && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="text-muted-foreground h-5 w-5" />
              Monthly Performance
            </CardTitle>
            <CardDescription>Revenue and profit trends for your branch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, '']}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PartnerDashboard;
