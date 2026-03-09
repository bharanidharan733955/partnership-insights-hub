import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSalesHistory } from '@/lib/api';
import { History, AlertCircle, BarChart3, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

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

export default function PartnerSalesHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getSalesHistory();
      const list = Array.isArray(data) ? data : [];
      setSales(
        list.map((rUnknown) => {
          const r = asRecord(rUnknown) || {};
          const dateVal = r.date;
          const iso =
            typeof dateVal === 'string'
              ? dateVal
              : dateVal &&
                typeof dateVal === 'object' &&
                'toISOString' in dateVal &&
                typeof (dateVal as { toISOString?: unknown }).toISOString === 'function'
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
        }),
      );
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch sales history', err);
      toast.error(getErrorMessage(err) || 'Failed to load sales history');
    } finally {
      setLoading(false);
    }
  };

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

  if (!user) return null;

  return (
    <div className="space-y-8 animate-fade-in px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="w-fit text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Button>
        </div>
        <div className="text-right">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Sales History
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Detailed records of all submitted sales for your branch.
          </p>
        </div>
      </div>

      {/* Monthly Performance Chart */}
      {monthlyData.length > 0 && (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="text-muted-foreground h-5 w-5" />
              Monthly Performance
            </CardTitle>
            <CardDescription>
              Revenue and profit trends for your branch over the last few months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] min-h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={250}>
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
                    formatter={(value: number) => [
                      `₹${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                      '',
                    ]}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales History Table */}
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="border-b bg-muted/20 pb-5">
          <CardTitle className="flex items-center gap-2 text-xl">
            <History className="text-muted-foreground h-5 w-5" />
            Sales Records
          </CardTitle>
          <CardDescription>Your branch&apos;s submitted sales entries.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 z-10">
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
                  <TableRow
                    key={record.id}
                    className="hover:bg-muted/40 transition-colors border-muted/50"
                  >
                    <TableCell className="font-medium text-sm">
                      {new Date(record.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-sm font-semibold">{record.product_name}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{record.quantity}</TableCell>
                    <TableCell className="text-right font-bold font-mono text-sm text-chart-2">
                      ₹
                      {Number(record.sales_amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right font-bold font-mono text-sm text-chart-1">
                      ₹
                      {Number(record.profit).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
                {sales.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 opacity-20" />
                        <p>No sales records yet. Start entering daily data from your dashboard.</p>
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
  );
}

