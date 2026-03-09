import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSalesHistory, submitSales, submitCustomerFeedback } from '@/lib/api';
import {
  Plus, Save, Calendar, TrendingUp, AlertCircle, DollarSign, Package,
  MessageSquare, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

function getErrorMessage(err: unknown): string {
  const r = asRecord(err);
  const msg = r?.message;
  return typeof msg === 'string' ? msg : 'Unexpected error';
}

const defaultFeedback = {
  dayFeedback: '',
};

const PartnerDashboard = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(true);
  const [formData, setFormData] = useState({
    productName: '',
    quantity: '',
    salesAmount: '',
    profit: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [feedbackData, setFeedbackData] = useState(defaultFeedback);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getSalesHistory();
      const list = Array.isArray(data) ? data : [];
      setSales(list.map((rUnknown) => {
        const r = asRecord(rUnknown) || {};
        const dateVal = r.date;
        const iso =
          typeof dateVal === 'string'
            ? dateVal
            : dateVal && typeof dateVal === 'object' && 'toISOString' in dateVal && typeof (dateVal as { toISOString?: unknown }).toISOString === 'function'
              ? String((dateVal as { toISOString: () => string }).toISOString()).split('T')[0]
              : '';

        const id = typeof r.id === 'string' ? r.id : '';
        const productName =
          typeof r.productName === 'string'
            ? r.productName
            : typeof r.product_name === 'string'
              ? r.product_name
              : '';

        const quantity = typeof r.quantity === 'number' ? r.quantity : 0;
        const salesAmount =
          typeof r.salesAmount === 'number'
            ? r.salesAmount
            : typeof r.sales_amount === 'number'
              ? r.sales_amount
              : 0;
        const profit = typeof r.profit === 'number' ? r.profit : 0;
        const createdAt =
          typeof r.createdAt === 'string'
            ? r.createdAt
            : typeof r.created_at === 'string'
              ? r.created_at
              : '';

        return {
          id,
          date: iso,
          product_name: productName,
          quantity,
          sales_amount: salesAmount,
          profit,
          created_at: createdAt,
        };
      }));
    } catch (err: unknown) {
      console.error('Failed to fetch sales history', err);
      toast.error(getErrorMessage(err) || 'Failed to load sales data');
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
      await submitSales({
        date: formData.date,
        productName: formData.productName.trim(),
        quantity: parseInt(formData.quantity, 10),
        salesAmount: parseFloat(formData.salesAmount),
        profit: parseFloat(formData.profit),
      });

      // Submit daily report feedback if filled
      const hasFeedback = !!feedbackData.dayFeedback.trim();

      if (hasFeedback) {
        try {
          await submitCustomerFeedback({
            date: formData.date,
            dayFeedback: feedbackData.dayFeedback.trim(),
          });
          toast.success('Sales record & customer feedback submitted!');
        } catch (fbErr: unknown) {
          // Record saved but feedback failed — warn but don't block
          toast.warning('Sales record saved. Customer feedback could not be submitted.');
          console.error('Feedback submit error:', fbErr);
        }
      } else {
        toast.success('Sales record submitted successfully');
      }

      // Reset forms
      setFormData({
        productName: '',
        quantity: '',
        salesAmount: '',
        profit: '',
        date: new Date().toISOString().split('T')[0],
      });
      setFeedbackData(defaultFeedback);
      fetchHistory();
    } catch (err: unknown) {
      console.error('Submit error:', err);
      toast.error(getErrorMessage(err) || 'Failed to submit sales record');
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

  // Aggregate total quantity per product for quick overview
  const productSummary = useMemo(() => {
    const map = new Map<string, { name: string; totalQty: number; totalRevenue: number }>();
    sales.forEach((s) => {
      const key = s.product_name || 'Unknown';
      const existing = map.get(key) || { name: key, totalQty: 0, totalRevenue: 0 };
      existing.totalQty += s.quantity;
      existing.totalRevenue += Number(s.sales_amount);
      map.set(key, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.totalQty - a.totalQty).slice(0, 5);
  }, [sales]);

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
        {/* Left column: Sales form + Daily Feedback */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Sales Entry Form */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Plus className="text-primary h-5 w-5" />
                New Sales Entry
              </CardTitle>
              <CardDescription>Enter today's sales data for your branch</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="sales-form" onSubmit={handleSubmit} className="space-y-5">
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
              </form>
            </CardContent>
          </Card>

          {/* Daily Customer Feedback Card */}
          <Card className="border-none shadow-lg">
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => setShowFeedback((v) => !v)}
            >
              <CardTitle className="flex items-center justify-between text-xl">
                <span className="flex items-center gap-2">
                  <MessageSquare className="text-primary h-5 w-5" />
                  Daily Customer Feedback
                </span>
                {showFeedback ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </CardTitle>
              <CardDescription>Optional — add a short note about today's performance</CardDescription>
            </CardHeader>

            {showFeedback && (
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="dayFeedback" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> Day Feedback
                  </Label>
                  <Textarea
                    id="dayFeedback"
                    value={feedbackData.dayFeedback}
                    onChange={(e) => setFeedbackData({ ...feedbackData, dayFeedback: e.target.value })}
                    placeholder="Write today's feedback for the analyst (only you and the analyst can see this)."
                    className="resize-none min-h-[120px] shadow-sm"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Submit Button — outside both cards, submits the whole form */}
          <Button
            type="submit"
            form="sales-form"
            size="lg"
            disabled={submitting}
            className="w-full shadow-lg shadow-primary/20 transition-all active:scale-95 py-6 text-lg font-bold"
          >
            {submitting ? <span className="animate-spin">⏳</span> : <Save className="mr-2 h-5 w-5" />}
            Submit Record
          </Button>
        </div>
      </div>

      {/* Product summary list on the right */}
      <Card className="xl:col-span-1 border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-chart-4" />
            Top Products
          </CardTitle>
          <CardDescription>Most frequently sold products based on submitted records.</CardDescription>
        </CardHeader>
        <CardContent>
          {productSummary.length === 0 ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
              <AlertCircle className="h-8 w-8 opacity-20" />
              <p className="text-sm">No product data yet. Submit your first sales record to see the summary.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {productSummary.map((p) => (
                <li
                  key={p.name}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.totalQty} units • ₹
                      {p.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerDashboard;
