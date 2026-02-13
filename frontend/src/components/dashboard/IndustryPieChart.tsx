 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { industryDistribution } from '@/data/mockData';
 import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
 
 const COLORS = [
   'hsl(var(--chart-1))',
   'hsl(var(--chart-2))',
   'hsl(var(--chart-3))',
   'hsl(var(--chart-4))',
   'hsl(var(--chart-5))',
 ];
 
 export function IndustryPieChart() {
   return (
     <Card className="border-border/50 shadow-sm">
       <CardHeader className="pb-2">
         <CardTitle className="text-lg font-semibold">Industry Distribution</CardTitle>
       </CardHeader>
       <CardContent>
         <div className="h-64">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie
                 data={industryDistribution}
                 cx="50%"
                 cy="50%"
                 innerRadius={50}
                 outerRadius={80}
                 paddingAngle={2}
                 dataKey="value"
               >
                 {industryDistribution.map((_, index) => (
                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                 ))}
               </Pie>
               <Tooltip
                 contentStyle={{
                   backgroundColor: 'hsl(var(--card))',
                   borderColor: 'hsl(var(--border))',
                   borderRadius: '8px',
                   boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                 }}
                 formatter={(value: number) => [`${value}%`, 'Share']}
                 labelStyle={{ color: 'hsl(var(--foreground))' }}
               />
               <Legend
                 verticalAlign="bottom"
                 height={36}
                 iconType="circle"
                 iconSize={8}
                 formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
               />
             </PieChart>
           </ResponsiveContainer>
         </div>
       </CardContent>
     </Card>
   );
 }