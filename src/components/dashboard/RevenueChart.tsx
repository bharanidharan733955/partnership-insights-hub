 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { revenueData } from '@/data/mockData';
 import {
   AreaChart,
   Area,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
   Legend,
 } from 'recharts';
 
 export function RevenueChart() {
   return (
     <Card className="border-border/50 shadow-sm">
       <CardHeader className="pb-2">
         <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
       </CardHeader>
       <CardContent>
         <div className="h-80">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
               <defs>
                 <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                   <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                 </linearGradient>
                 <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                   <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
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
                 tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
               />
               <Tooltip
                 contentStyle={{
                   backgroundColor: 'hsl(var(--card))',
                   borderColor: 'hsl(var(--border))',
                   borderRadius: '8px',
                   boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                 }}
                 formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                 labelStyle={{ color: 'hsl(var(--foreground))' }}
               />
               <Legend
                 verticalAlign="top"
                 height={36}
                 iconType="circle"
                 iconSize={8}
                 formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
               />
               <Area
                 type="monotone"
                 dataKey="revenue"
                 name="Revenue"
                 stroke="hsl(var(--chart-1))"
                 strokeWidth={2}
                 fill="url(#revenueGradient)"
               />
               <Area
                 type="monotone"
                 dataKey="target"
                 name="Target"
                 stroke="hsl(var(--chart-2))"
                 strokeWidth={2}
                 strokeDasharray="4 4"
                 fill="url(#targetGradient)"
               />
             </AreaChart>
           </ResponsiveContainer>
         </div>
       </CardContent>
     </Card>
   );
 }