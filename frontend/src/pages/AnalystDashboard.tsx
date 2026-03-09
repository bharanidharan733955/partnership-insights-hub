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
      toast.info('Generating PDF…');

      // ── Helpers ────────────────────────────────────────────────────────────
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const PW = doc.internal.pageSize.getWidth();   // 297
      const PH = doc.internal.pageSize.getHeight();  // 210
      const ML = 14;
      const MR = 14;
      const usableW = PW - ML - MR;

      let pageNum = 1;
      let y = 18;
      let cx = ML;

      const addPageNumber = () => {
        doc.setFontSize(8);
        doc.setTextColor(160, 160, 160);
        doc.text(`Page ${pageNum}`, PW - MR, PH - 6, { align: 'right' });
        doc.text('Partnership Insights Hub — Confidential', ML, PH - 6);
      };

      const newPage = () => {
        addPageNumber();
        doc.addPage();
        pageNum++;
      };

      const drawHRule = (ry: number, color: [number, number, number] = [220, 220, 220]) => {
        doc.setDrawColor(...color);
        doc.line(ML, ry, PW - MR, ry);
      };

      const fmt = (n: number) =>
        n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const fmtShort = (n: number) => {
        if (n >= 10000000) return `${(n / 10000000).toFixed(2)}Cr`;
        if (n >= 100000) return `${(n / 100000).toFixed(2)}L`;
        if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
        return n.toFixed(0);
      };

      const pct = (num: number, den: number) =>
        den === 0 ? '0.00%' : `${((num / den) * 100).toFixed(2)}%`;

      const truncText = (text: string, maxW: number): string =>
        String(doc.splitTextToSize(text, maxW)[0]);

      const formatDate = (d: string): string => {
        if (!d) return '—';
        // Handle ISO strings like "2026-03-07T00:00:00.000Z"
        if (d.includes('T')) return d.split('T')[0];
        // Already short
        return d.length > 10 ? d.substring(0, 10) : d;
      };

      // ── Derived data ───────────────────────────────────────────────────────
      const profitMargin = totalRevenue === 0 ? 0 : (totalProfit / totalRevenue) * 100;
      const avgSalePerRecord = filteredSales.length === 0 ? 0 : totalRevenue / filteredSales.length;
      const totalQty = filteredSales.reduce((s, r) => s + Number(r.quantity), 0);

      const branchMap: Record<string, { name: string; location: string; partner: string; revenue: number; profit: number; qty: number; count: number }> = {};
      filteredSales.forEach(r => {
        const bid = r.branch_id;
        if (!branchMap[bid]) {
          branchMap[bid] = { name: r.branches?.name || bid, location: r.branches?.location || '', partner: r.branches?.partners?.name || '', revenue: 0, profit: 0, qty: 0, count: 0 };
        }
        branchMap[bid].revenue += Number(r.sales_amount);
        branchMap[bid].profit += Number(r.profit);
        branchMap[bid].qty += Number(r.quantity);
        branchMap[bid].count++;
      });
      const branchRows = Object.values(branchMap).sort((a, b) => b.revenue - a.revenue);

      const productMap: Record<string, { revenue: number; profit: number; qty: number; count: number }> = {};
      filteredSales.forEach(r => {
        const p = r.product_name || 'Unknown';
        if (!productMap[p]) productMap[p] = { revenue: 0, profit: 0, qty: 0, count: 0 };
        productMap[p].revenue += Number(r.sales_amount);
        productMap[p].profit += Number(r.profit);
        productMap[p].qty += Number(r.quantity);
        productMap[p].count++;
      });
      const productRows = Object.entries(productMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue);

      const dates = filteredSales.map(r => r.date).sort();
      const dateRange = dates.length > 0 ? `${dates[0]} to ${dates[dates.length - 1]}` : 'All dates';

      // ── PAGE 1: Cover + Executive Summary ─────────────────────────────────
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, PW, 14, 'F');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, 'bold');
      doc.text('PARTNERSHIP INSIGHTS HUB', ML, 9);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, PW - MR, 9, { align: 'right' });

      y = 24;
      doc.setFontSize(20);
      doc.setTextColor(30, 41, 59);
      doc.setFont(undefined, 'bold');
      doc.text('Sales Analytics Report', ML, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Period: ${dateRange}  |  Records: ${filteredSales.length}  |  Branches: ${uniqueBranches}`, ML, y);
      y += 4;
      drawHRule(y, [148, 163, 184]);
      y += 8;

      // 4 metric boxes
      const boxW = (usableW - 9) / 4;
      const boxes = [
        { label: 'Total Revenue', value: `INR ${fmt(totalRevenue)}`, sub: `Avg/record: INR ${fmt(avgSalePerRecord)}` },
        { label: 'Total Profit', value: `INR ${fmt(totalProfit)}`, sub: `Margin: ${profitMargin.toFixed(2)}%` },
        { label: 'Active Branches', value: String(uniqueBranches), sub: `${filteredSales.length} total records` },
        { label: 'Total Quantity', value: String(totalQty), sub: `${productRows.length} products` },
      ];
      boxes.forEach((box, i) => {
        const bx = ML + i * (boxW + 3);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(bx, y, boxW, 22, 2, 2, 'FD');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.setFont(undefined as any, 'normal');
        doc.text(truncText(box.label, boxW - 8), bx + 4, y + 6);
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.setFont(undefined as any, 'bold');
        doc.text(truncText(box.value, boxW - 8), bx + 4, y + 14);
        doc.setFontSize(7);
        doc.setFont(undefined as any, 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(truncText(box.sub, boxW - 8), bx + 4, y + 20);
      });
      y += 30;

      // ── CHART: Revenue Trend (top 10 dates) ────────────────────────────
      const trendMap: Record<string, { revenue: number; profit: number }> = {};
      filteredSales.forEach(r => {
        const d = formatDate(r.date);
        if (!trendMap[d]) trendMap[d] = { revenue: 0, profit: 0 };
        trendMap[d].revenue += Number(r.sales_amount);
        trendMap[d].profit += Number(r.profit);
      });
      const trendEntries = Object.entries(trendMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-10);

      if (trendEntries.length > 0) {
        const barCount = trendEntries.length;
        const barH = 7;
        const barGap = 3;
        const chartH = barCount * (barH + barGap) + 12;
        const labelW = 28;
        const barMaxW = usableW - labelW - 52;
        const maxRev = Math.max(...trendEntries.map(([, v]) => v.revenue), 1);

        if (y + chartH + 5 > PH - 20) { newPage(); y = 20; }

        doc.setFontSize(11);
        doc.setFont(undefined as any, 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('Revenue Trend (Recent Dates)', ML, y);
        y += 2;

        // Legend
        doc.setFontSize(6.5);
        doc.setFont(undefined as any, 'normal');
        doc.setFillColor(59, 130, 246);
        doc.rect(ML + usableW - 60, y, 3, 3, 'F');
        doc.setTextColor(100, 116, 139);
        doc.text('Revenue', ML + usableW - 56, y + 2.5);
        doc.setFillColor(34, 197, 94);
        doc.rect(ML + usableW - 36, y, 3, 3, 'F');
        doc.text('Profit', ML + usableW - 32, y + 2.5);
        y += 6;

        doc.setFillColor(250, 250, 252);
        doc.setDrawColor(230, 230, 240);
        doc.roundedRect(ML, y, usableW, barCount * (barH + barGap) + 4, 2, 2, 'FD');

        trendEntries.forEach(([date, v], i) => {
          const by = y + 2 + i * (barH + barGap);

          doc.setFontSize(7);
          doc.setFont(undefined as any, 'normal');
          doc.setTextColor(71, 85, 105);
          doc.text(truncText(date, labelW - 3), ML + 2, by + barH / 2 + 1.5);

          const bw = (v.revenue / maxRev) * barMaxW;
          doc.setFillColor(59, 130, 246);
          doc.roundedRect(ML + labelW, by, Math.max(bw, 1), barH / 2, 0.8, 0.8, 'F');

          const bw2 = (v.profit / maxRev) * barMaxW;
          doc.setFillColor(34, 197, 94);
          doc.roundedRect(ML + labelW, by + barH / 2 + 0.5, Math.max(bw2, 1), barH / 2 - 0.5, 0.8, 0.8, 'F');

          doc.setFontSize(6);
          doc.setFont(undefined as any, 'bold');
          doc.setTextColor(30, 41, 59);
          doc.text(`INR ${fmtShort(v.revenue)}`, ML + labelW + Math.max(bw, 1) + 2, by + barH / 2);
          doc.setTextColor(22, 101, 52);
          doc.text(`INR ${fmtShort(v.profit)}`, ML + labelW + Math.max(bw2, 1) + 2, by + barH - 0.5);
        });

        y += barCount * (barH + barGap) + 10;
      }

      // ── PAGE 2: Branch + Product Charts ─────────────────────────────────
      newPage();
      y = 20;

      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, PW, 14, 'F');
      doc.setFontSize(10);
      doc.setFont(undefined as any, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('PARTNERSHIP INSIGHTS HUB — Analysis Charts', ML, 9);
      doc.setFont(undefined as any, 'normal');
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, PW - MR, 9, { align: 'right' });

      const halfW = (usableW - 10) / 2;
      const maxChartItems = Math.min(Math.max(branchRows.length, productRows.length, 1), 8);
      const cBarH = 8;
      const cBarGap = 3;
      const sectionChartH = maxChartItems * (cBarH + cBarGap) + 12;

      // ── CHART 2: Branch Revenue Comparison (left half) ──────────────────
      const branchChartSlice = branchRows.slice(0, 8);
      if (branchChartSlice.length > 0) {
        const maxBrRev = Math.max(...branchChartSlice.map(b => b.revenue), 1);
        const cLabelW = 30;
        const cBarMaxW = halfW - cLabelW - 26;

        doc.setFontSize(10);
        doc.setFont(undefined as any, 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('Branch Revenue Comparison', ML, y);

        const chartStartY = y + 5;
        doc.setFillColor(250, 250, 252);
        doc.setDrawColor(230, 230, 240);
        doc.roundedRect(ML, chartStartY, halfW, branchChartSlice.length * (cBarH + cBarGap) + 4, 2, 2, 'FD');

        branchChartSlice.forEach((b, i) => {
          const by = chartStartY + 2 + i * (cBarH + cBarGap);
          doc.setFontSize(6.5);
          doc.setFont(undefined as any, 'normal');
          doc.setTextColor(71, 85, 105);
          doc.text(truncText(b.name, cLabelW - 3), ML + 2, by + cBarH / 2 + 1.5);

          const bw = (b.revenue / maxBrRev) * cBarMaxW;
          doc.setFillColor(99, 102, 241);
          doc.roundedRect(ML + cLabelW, by + 0.5, Math.max(bw, 1), cBarH - 1, 1, 1, 'F');

          doc.setFontSize(6);
          doc.setFont(undefined as any, 'bold');
          doc.setTextColor(30, 41, 59);
          doc.text(`INR ${fmtShort(b.revenue)}`, ML + cLabelW + Math.max(bw, 1) + 2, by + cBarH / 2 + 1);
        });
      }

      // ── CHART 3: Product Revenue Distribution (right half) ─────────────
      const productChartSlice = productRows.slice(0, 8);
      const rightX = ML + halfW + 10;
      if (productChartSlice.length > 0) {
        const maxPrRev = Math.max(...productChartSlice.map(p => p.revenue), 1);
        const cLabelW = 30;
        const cBarMaxW = halfW - cLabelW - 26;

        doc.setFontSize(10);
        doc.setFont(undefined as any, 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('Product Revenue Distribution', rightX, y);

        const chartStartY = y + 5;
        doc.setFillColor(250, 250, 252);
        doc.setDrawColor(230, 230, 240);
        doc.roundedRect(rightX, chartStartY, halfW, productChartSlice.length * (cBarH + cBarGap) + 4, 2, 2, 'FD');

        productChartSlice.forEach((p, i) => {
          const by = chartStartY + 2 + i * (cBarH + cBarGap);
          doc.setFontSize(6.5);
          doc.setFont(undefined as any, 'normal');
          doc.setTextColor(71, 85, 105);
          doc.text(truncText(p.name, cLabelW - 3), rightX + 2, by + cBarH / 2 + 1.5);

          const bw = (p.revenue / maxPrRev) * cBarMaxW;
          doc.setFillColor(236, 72, 153);
          doc.roundedRect(rightX + cLabelW, by + 0.5, Math.max(bw, 1), cBarH - 1, 1, 1, 'F');

          doc.setFontSize(6);
          doc.setFont(undefined as any, 'bold');
          doc.setTextColor(30, 41, 59);
          doc.text(`INR ${fmtShort(p.revenue)}`, rightX + cLabelW + Math.max(bw, 1) + 2, by + cBarH / 2 + 1);
        });
      }
      y += sectionChartH + 8;

      // ── Branch Breakdown Table ──────────────────────────────────────────
      if (y + 40 > PH - 20) { newPage(); y = 20; }

      doc.setFontSize(11);
      doc.setFont(undefined as any, 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Branch Performance Breakdown', ML, y);
      y += 5;
      drawHRule(y, [148, 163, 184]);
      y += 5;

      const bCols = [
        { label: 'Branch', w: 40 },
        { label: 'Location', w: 34 },
        { label: 'Partner', w: 34 },
        { label: 'Records', w: 20 },
        { label: 'Total Qty', w: 22 },
        { label: 'Revenue (INR)', w: 46 },
        { label: 'Profit (INR)', w: 42 },
        { label: 'Margin %', w: 31 },
      ];

      doc.setFillColor(30, 41, 59);
      doc.rect(ML, y, usableW, 7, 'F');
      doc.setFontSize(7.5);
      doc.setFont(undefined as any, 'bold');
      doc.setTextColor(255, 255, 255);
      cx = ML + 2;
      bCols.forEach(col => { doc.text(col.label, cx, y + 5); cx += col.w; });
      y += 7;

      doc.setFont(undefined as any, 'normal');
      branchRows.forEach((row, idx) => {
        if (y > PH - 20) { newPage(); y = 20; }
        if (idx % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(ML, y, usableW, 6.5, 'F'); }
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(7.5);
        cx = ML + 2;
        const cells = [
          truncText(row.name, bCols[0].w - 5),
          truncText(row.location, bCols[1].w - 5),
          truncText(row.partner, bCols[2].w - 5),
          String(row.count),
          String(row.qty),
          truncText(fmt(row.revenue), bCols[5].w - 5),
          truncText(fmt(row.profit), bCols[6].w - 5),
          pct(row.profit, row.revenue),
        ];
        cells.forEach((cell, i) => { doc.text(cell, cx, y + 4.5); cx += bCols[i].w; });
        y += 6.5;
      });

      // Totals row
      doc.setFillColor(241, 245, 249);
      doc.rect(ML, y, usableW, 7, 'F');
      doc.setFont(undefined as any, 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      cx = ML + 2;
      ['TOTAL', '', '', String(filteredSales.length), String(totalQty), fmt(totalRevenue), fmt(totalProfit), `${profitMargin.toFixed(2)}%`]
        .forEach((cell, i) => { doc.text(cell, cx, y + 5); cx += bCols[i].w; });
      y += 12;

      // ── Product Summary Table ──────────────────────────────────────────
      if (y > PH - 50) { newPage(); y = 20; }

      doc.setFontSize(11);
      doc.setFont(undefined as any, 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Product Performance Summary', ML, y);
      y += 5;
      drawHRule(y, [148, 163, 184]);
      y += 5;

      const pCols = [
        { label: 'Product', w: 68 },
        { label: 'Records', w: 24 },
        { label: 'Total Qty', w: 26 },
        { label: 'Revenue (INR)', w: 52 },
        { label: 'Profit (INR)', w: 48 },
        { label: 'Margin %', w: 28 },
        { label: '% of Rev', w: 23 },
      ];

      doc.setFillColor(30, 41, 59);
      doc.rect(ML, y, usableW, 7, 'F');
      doc.setFontSize(7.5);
      doc.setFont(undefined as any, 'bold');
      doc.setTextColor(255, 255, 255);
      cx = ML + 2;
      pCols.forEach(col => { doc.text(col.label, cx, y + 5); cx += col.w; });
      y += 7;

      doc.setFont(undefined as any, 'normal');
      productRows.forEach((row, idx) => {
        if (y > PH - 20) { newPage(); y = 20; }
        if (idx % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(ML, y, usableW, 6.5, 'F'); }
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(7.5);
        cx = ML + 2;
        [
          truncText(row.name, pCols[0].w - 5),
          String(row.count),
          String(row.qty),
          truncText(fmt(row.revenue), pCols[3].w - 5),
          truncText(fmt(row.profit), pCols[4].w - 5),
          pct(row.profit, row.revenue),
          pct(row.revenue, totalRevenue),
        ].forEach((cell, i) => { doc.text(cell, cx, y + 4.5); cx += pCols[i].w; });
        y += 6.5;
      });
      y += 6;

      // ── Full Transaction Log ──────────────────────────────────────────
      newPage();
      y = 18;

      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, PW, 14, 'F');
      doc.setFontSize(10);
      doc.setFont(undefined as any, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('PARTNERSHIP INSIGHTS HUB — Transaction Log', ML, 9);
      doc.setFont(undefined as any, 'normal');
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, PW - MR, 9, { align: 'right' });

      y = 22;
      doc.setFontSize(11);
      doc.setFont(undefined as any, 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Detailed Transaction Records', ML, y);
      y += 5;
      drawHRule(y, [148, 163, 184]);
      y += 5;

      // Total must equal usableW (269mm): 24+30+28+26+40+14+42+36+29 = 269
      const tCols = [
        { label: 'Date', w: 24 },
        { label: 'Partner', w: 30 },
        { label: 'Branch', w: 28 },
        { label: 'Location', w: 26 },
        { label: 'Product', w: 40 },
        { label: 'Qty', w: 14 },
        { label: 'Revenue (INR)', w: 42 },
        { label: 'Profit (INR)', w: 36 },
        { label: 'Margin %', w: 29 },
      ];

      const drawTxHeader = () => {
        doc.setFillColor(30, 41, 59);
        doc.rect(ML, y, usableW, 7, 'F');
        doc.setFontSize(7.5);
        doc.setFont(undefined as any, 'bold');
        doc.setTextColor(255, 255, 255);
        cx = ML + 2;
        tCols.forEach(col => { doc.text(col.label, cx, y + 5); cx += col.w; });
      };

      drawTxHeader();
      y += 7;

      doc.setFont(undefined as any, 'normal');
      filteredSales.forEach((r, idx) => {
        if (y > PH - 16) { newPage(); y = 20; drawTxHeader(); y += 7; }
        if (idx % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(ML, y, usableW, 6.5, 'F'); }
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(7);
        cx = ML + 2;
        const rowMargin = Number(r.sales_amount) === 0 ? '0.00%' : `${((Number(r.profit) / Number(r.sales_amount)) * 100).toFixed(2)}%`;
        [
          formatDate(r.date),
          truncText(r.branches?.partners?.name || '—', tCols[1].w - 4),
          truncText(r.branches?.name || '—', tCols[2].w - 4),
          truncText(r.branches?.location || '—', tCols[3].w - 4),
          truncText(r.product_name || '—', tCols[4].w - 4),
          String(r.quantity),
          truncText(fmt(Number(r.sales_amount)), tCols[6].w - 4),
          truncText(fmt(Number(r.profit)), tCols[7].w - 4),
          truncText(rowMargin, tCols[8].w - 4),
        ].forEach((cell, i) => { doc.text(cell, cx, y + 4.5); cx += tCols[i].w; });
        y += 6.5;
      });

      // Final totals
      if (y > PH - 16) { newPage(); y = 20; }
      doc.setFillColor(30, 41, 59);
      doc.rect(ML, y, usableW, 7, 'F');
      doc.setFont(undefined as any, 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      cx = ML + 2;
      ['TOTAL', '', '', '', `${filteredSales.length}`, String(totalQty), fmt(totalRevenue), fmt(totalProfit), `${profitMargin.toFixed(1)}%`]
        .forEach((cell, i) => { doc.text(truncText(cell, tCols[i].w - 4), cx, y + 5); cx += tCols[i].w; });

      addPageNumber();
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
