 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { notifications } from '@/data/mockData';
 import { cn } from '@/lib/utils';
 import { AlertTriangle, CheckCircle2, Info, AlertCircle } from 'lucide-react';
 
 const iconMap = {
   alert: AlertTriangle,
   success: CheckCircle2,
   info: Info,
   warning: AlertCircle,
 };
 
 const colorMap = {
   alert: 'text-destructive bg-destructive/10',
   success: 'text-success bg-success/10',
   info: 'text-info bg-info/10',
   warning: 'text-warning bg-warning/10',
 };
 
 export function RecentActivity() {
   const formatTime = (timestamp: string) => {
     const date = new Date(timestamp);
     const now = new Date();
     const diffMs = now.getTime() - date.getTime();
     const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
     const diffDays = Math.floor(diffHours / 24);
 
     if (diffDays > 0) return `${diffDays}d ago`;
     if (diffHours > 0) return `${diffHours}h ago`;
     return 'Just now';
   };
 
   return (
     <Card className="border-border/50 shadow-sm">
       <CardHeader className="pb-2">
         <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         {notifications.slice(0, 4).map((notification) => {
           const Icon = iconMap[notification.type];
           return (
             <div
               key={notification.id}
               className={cn(
                 'flex items-start gap-3 p-3 rounded-lg bg-muted/30 transition-colors',
                 !notification.read && 'bg-muted/50'
               )}
             >
               <div className={cn('p-2 rounded-lg', colorMap[notification.type])}>
                 <Icon className="w-4 h-4" />
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium truncate">{notification.title}</p>
                 <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
               </div>
               <span className="text-xs text-muted-foreground whitespace-nowrap">
                 {formatTime(notification.timestamp)}
               </span>
             </div>
           );
         })}
       </CardContent>
     </Card>
   );
 }