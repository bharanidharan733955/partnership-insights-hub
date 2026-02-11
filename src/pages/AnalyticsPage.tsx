 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { RevenueChart } from '@/components/dashboard/RevenueChart';
 import { IndustryPieChart } from '@/components/dashboard/IndustryPieChart';
 import { tierDistribution, kpiData, revenueData } from '@/data/mockData';
 import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
 import { Calendar, Download, TrendingUp } from 'lucide-react';
 
 const quarterlyData = [
   { quarter: 'Q1 2023', revenue: 1050000, partners: 38 },
   { quarter: 'Q2 2023', revenue: 1240000, partners: 41 },
   { quarter: 'Q3 2023', revenue: 1530000, partners: 44 },
   { quarter: 'Q4 2023', revenue: 1880000, partners: 47 },
 ];
 
 export default function AnalyticsPage() {
   return (
     <DashboardLayout>
       <div className="space-y-6 animate-fade-in">
         {/* Page Header */}
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           <div>
             <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
             <p className="text-muted-foreground">Deep dive into partnership performance metrics</p>
           </div>
           <div className="flex gap-2">
             <Button variant="outline" className="gap-2">
               <Calendar className="w-4 h-4" />
               Last 12 Months
             </Button>
             <Button variant="outline" className="gap-2">
               <Download className="w-4 h-4" />
               Export
             </Button>
           </div>
         </div>
 
         {/* Summary Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <Card className="border-border/50">
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-muted-foreground">YoY Revenue Growth</p>
                   <p className="text-3xl font-bold text-success">+{kpiData.revenueChange}%</p>
                 </div>
                 <TrendingUp className="w-8 h-8 text-success/50" />
               </div>
             </CardContent>
           </Card>
           <Card className="border-border/50">
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-muted-foreground">Avg Partner Value</p>
                   <p className="text-3xl font-bold">${Math.round(kpiData.totalRevenue / kpiData.activePartners).toLocaleString()}</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card className="border-border/50">
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm text-muted-foreground">Partner Retention</p>
                   <p className="text-3xl font-bold">94.2%</p>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Main Charts */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <RevenueChart />
 
           {/* Quarterly Performance */}
           <Card className="border-border/50 shadow-sm">
             <CardHeader className="pb-2">
               <CardTitle className="text-lg font-semibold">Quarterly Performance</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="h-80">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={quarterlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                     <XAxis
                       dataKey="quarter"
                       axisLine={false}
                       tickLine={false}
                       tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                     />
                     <YAxis
                       axisLine={false}
                       tickLine={false}
                       tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                       tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                     />
                     <Tooltip
                       contentStyle={{
                         backgroundColor: 'hsl(var(--card))',
                         borderColor: 'hsl(var(--border))',
                         borderRadius: '8px',
                       }}
                       formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                     />
                     <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Secondary Charts */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <IndustryPieChart />
 
           {/* Tier Distribution */}
           <Card className="border-border/50 shadow-sm">
             <CardHeader className="pb-2">
               <CardTitle className="text-lg font-semibold">Revenue by Tier</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {tierDistribution.map((tier) => (
                   <div key={tier.tier} className="space-y-2">
                     <div className="flex items-center justify-between text-sm">
                       <span className="font-medium">{tier.tier}</span>
                       <span className="text-muted-foreground">{tier.count} partners</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                         <div
                           className="h-full bg-chart-1 rounded-full"
                           style={{ width: `${(tier.revenue / 2000000) * 100}%` }}
                         />
                       </div>
                       <span className="text-sm font-medium w-20 text-right">${(tier.revenue / 1000).toFixed(0)}k</span>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
 
           {/* Growth Trend */}
           <Card className="border-border/50 shadow-sm">
             <CardHeader className="pb-2">
               <CardTitle className="text-lg font-semibold">Partner Growth Trend</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="h-52">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={revenueData.slice(-6)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                     <XAxis
                       dataKey="month"
                       axisLine={false}
                       tickLine={false}
                       tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                     />
                     <YAxis hide />
                     <Tooltip
                       contentStyle={{
                         backgroundColor: 'hsl(var(--card))',
                         borderColor: 'hsl(var(--border))',
                         borderRadius: '8px',
                       }}
                     />
                     <Line
                       type="monotone"
                       dataKey="revenue"
                       stroke="hsl(var(--chart-2))"
                       strokeWidth={2}
                       dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 0, r: 4 }}
                     />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
             </CardContent>
           </Card>
         </div>
       </div>
     </DashboardLayout>
   );
 }