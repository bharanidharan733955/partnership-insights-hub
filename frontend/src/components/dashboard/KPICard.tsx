 import { cn } from '@/lib/utils';
 import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
 import { Card, CardContent } from '@/components/ui/card';
 
 interface KPICardProps {
   title: string;
   value: string | number;
   change: number;
   changeLabel?: string;
   icon: React.ElementType;
   format?: 'currency' | 'percent' | 'number';
 }
 
 export function KPICard({ title, value, change, changeLabel = 'vs last period', icon: Icon, format = 'number' }: KPICardProps) {
   const isPositive = change > 0;
   const isNeutral = change === 0;
 
   const formatValue = (val: string | number) => {
     if (typeof val === 'string') return val;
     switch (format) {
       case 'currency':
         return new Intl.NumberFormat('en-US', {
           style: 'currency',
           currency: 'USD',
           notation: val >= 1000000 ? 'compact' : 'standard',
           maximumFractionDigits: val >= 1000000 ? 2 : 0,
         }).format(val);
       case 'percent':
         return `${val.toFixed(1)}%`;
       default:
         return val.toLocaleString();
     }
   };
 
   return (
     <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
       <CardContent className="p-6">
         <div className="flex items-start justify-between">
           <div className="space-y-2">
             <p className="text-sm font-medium text-muted-foreground">{title}</p>
             <p className="text-3xl font-bold tracking-tight">{formatValue(value)}</p>
             <div className="flex items-center gap-1.5">
               {isNeutral ? (
                 <Minus className="w-4 h-4 text-muted-foreground" />
               ) : isPositive ? (
                 <TrendingUp className="w-4 h-4 text-success" />
               ) : (
                 <TrendingDown className="w-4 h-4 text-destructive" />
               )}
               <span
                 className={cn(
                   'text-sm font-medium',
                   isNeutral ? 'text-muted-foreground' : isPositive ? 'text-success' : 'text-destructive'
                 )}
               >
                 {isPositive && '+'}
                 {change.toFixed(1)}%
               </span>
               <span className="text-xs text-muted-foreground">{changeLabel}</span>
             </div>
           </div>
           <div className="p-3 rounded-xl bg-primary/10">
             <Icon className="w-6 h-6 text-primary" />
           </div>
         </div>
       </CardContent>
     </Card>
   );
 }