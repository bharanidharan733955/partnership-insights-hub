 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { partnerPerformance } from '@/data/mockData';
 import {
   BarChart,
   Bar,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
 } from 'recharts';
 
 export function PartnerPerformanceChart() {
   return (
     <Card className="border-border/50 shadow-sm">
       <CardHeader className="pb-2">
         <CardTitle className="text-lg font-semibold">Top Partners by Revenue</CardTitle>
       </CardHeader>
       <CardContent>
         <div className="h-80">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart
               data={partnerPerformance}
               layout="vertical"
               margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
             >
               <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
               <XAxis
                 type="number"
                 axisLine={false}
                 tickLine={false}
                 tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                 tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
               />
               <YAxis
                 type="category"
                 dataKey="name"
                 axisLine={false}
                 tickLine={false}
                 tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                 width={120}
               />
               <Tooltip
                 contentStyle={{
                   backgroundColor: 'hsl(var(--card))',
                   borderColor: 'hsl(var(--border))',
                   borderRadius: '8px',
                   boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                 }}
                 formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                 labelStyle={{ color: 'hsl(var(--foreground))' }}
               />
               <Bar
                 dataKey="revenue"
                 fill="hsl(var(--chart-1))"
                 radius={[0, 4, 4, 0]}
                 barSize={24}
               />
             </BarChart>
           </ResponsiveContainer>
         </div>
       </CardContent>
     </Card>
   );
 }