 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { PartnerPerformanceChart } from '@/components/dashboard/PartnerPerformanceChart';
 import { partnerPerformance, kpiData } from '@/data/mockData';
 import { cn } from '@/lib/utils';
 import { TrendingUp, TrendingDown, Target, Award, AlertTriangle, CheckCircle } from 'lucide-react';
 
 export default function PerformancePage() {
   return (
     <DashboardLayout>
       <div className="space-y-6 animate-fade-in">
         {/* Page Header */}
         <div>
           <h1 className="text-2xl font-bold tracking-tight">Performance</h1>
           <p className="text-muted-foreground">Track and compare partnership performance metrics</p>
         </div>
 
         {/* Performance Summary */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <Card className="border-border/50">
             <CardContent className="p-6">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-success/10">
                   <Target className="w-5 h-5 text-success" />
                 </div>
                 <div>
                   <p className="text-sm text-muted-foreground">On Target</p>
                   <p className="text-2xl font-bold">32</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card className="border-border/50">
             <CardContent className="p-6">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-chart-1/10">
                   <TrendingUp className="w-5 h-5 text-chart-1" />
                 </div>
                 <div>
                   <p className="text-sm text-muted-foreground">Exceeding</p>
                   <p className="text-2xl font-bold">8</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card className="border-border/50">
             <CardContent className="p-6">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-warning/10">
                   <AlertTriangle className="w-5 h-5 text-warning" />
                 </div>
                 <div>
                   <p className="text-sm text-muted-foreground">At Risk</p>
                   <p className="text-2xl font-bold">5</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card className="border-border/50">
             <CardContent className="p-6">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-destructive/10">
                   <TrendingDown className="w-5 h-5 text-destructive" />
                 </div>
                 <div>
                   <p className="text-sm text-muted-foreground">Below Target</p>
                   <p className="text-2xl font-bold">2</p>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Performance Charts */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <PartnerPerformanceChart />
 
           {/* Engagement Leaderboard */}
           <Card className="border-border/50 shadow-sm">
             <CardHeader className="pb-2">
               <CardTitle className="text-lg font-semibold flex items-center gap-2">
                 <Award className="w-5 h-5 text-chart-5" />
                 Engagement Leaders
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {partnerPerformance.map((partner, index) => (
                   <div key={partner.name} className="flex items-center gap-4">
                     <div className={cn(
                       'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                       index === 0 ? 'bg-chart-5/20 text-chart-5' :
                       index === 1 ? 'bg-muted text-muted-foreground' :
                       index === 2 ? 'bg-chart-5/10 text-chart-5/70' :
                       'bg-muted/50 text-muted-foreground'
                     )}>
                       {index + 1}
                     </div>
                     <div className="flex-1">
                       <p className="font-medium text-sm">{partner.name}</p>
                       <div className="flex items-center gap-2 mt-1">
                         <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-32">
                           <div
                             className={cn(
                               'h-full rounded-full',
                               partner.engagement >= 85 ? 'bg-success' : 
                               partner.engagement >= 70 ? 'bg-chart-1' : 'bg-warning'
                             )}
                             style={{ width: `${partner.engagement}%` }}
                           />
                         </div>
                         <span className="text-xs text-muted-foreground">{partner.engagement}%</span>
                       </div>
                     </div>
                     <Badge variant="outline" className={cn(
                       'text-xs',
                       partner.growth >= 20 ? 'bg-success/10 text-success border-success/20' :
                       partner.growth >= 10 ? 'bg-chart-1/10 text-chart-1 border-chart-1/20' :
                       'bg-muted text-muted-foreground'
                     )}>
                       +{partner.growth}% growth
                     </Badge>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Performance Benchmarks */}
         <Card className="border-border/50 shadow-sm">
           <CardHeader className="pb-2">
             <CardTitle className="text-lg font-semibold">Performance Benchmarks</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-3">
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-muted-foreground">Avg Revenue/Partner</span>
                   <span className="font-semibold">${Math.round(kpiData.totalRevenue / kpiData.activePartners).toLocaleString()}</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-muted-foreground">Target</span>
                   <span className="text-muted-foreground">$85,000</span>
                 </div>
                 <div className="h-2 bg-muted rounded-full overflow-hidden">
                   <div className="h-full bg-success rounded-full" style={{ width: '106%' }} />
                 </div>
                 <div className="flex items-center gap-1 text-success text-sm">
                   <CheckCircle className="w-4 h-4" />
                   <span>6% above target</span>
                 </div>
               </div>
 
               <div className="space-y-3">
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-muted-foreground">Engagement Score</span>
                   <span className="font-semibold">{kpiData.avgEngagement}%</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-muted-foreground">Target</span>
                   <span className="text-muted-foreground">75%</span>
                 </div>
                 <div className="h-2 bg-muted rounded-full overflow-hidden">
                   <div className="h-full bg-success rounded-full" style={{ width: `${(kpiData.avgEngagement / 75) * 100}%` }} />
                 </div>
                 <div className="flex items-center gap-1 text-success text-sm">
                   <CheckCircle className="w-4 h-4" />
                   <span>4.5% above target</span>
                 </div>
               </div>
 
               <div className="space-y-3">
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-muted-foreground">Growth Rate</span>
                   <span className="font-semibold">{kpiData.growthRate}%</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-muted-foreground">Target</span>
                   <span className="text-muted-foreground">20%</span>
                 </div>
                 <div className="h-2 bg-muted rounded-full overflow-hidden">
                   <div className="h-full bg-success rounded-full" style={{ width: `${(kpiData.growthRate / 20) * 100}%` }} />
                 </div>
                 <div className="flex items-center gap-1 text-success text-sm">
                   <CheckCircle className="w-4 h-4" />
                   <span>19% above target</span>
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>
     </DashboardLayout>
   );
 }