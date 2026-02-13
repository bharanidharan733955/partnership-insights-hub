 import { useState } from 'react';
 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { notifications } from '@/data/mockData';
 import { cn } from '@/lib/utils';
 import { Bell, AlertTriangle, CheckCircle2, Info, AlertCircle, Check, Trash2 } from 'lucide-react';
 
 const iconMap = {
   alert: AlertTriangle,
   success: CheckCircle2,
   info: Info,
   warning: AlertCircle,
 };
 
 const colorMap = {
   alert: 'text-destructive bg-destructive/10 border-destructive/20',
   success: 'text-success bg-success/10 border-success/20',
   info: 'text-info bg-info/10 border-info/20',
   warning: 'text-warning bg-warning/10 border-warning/20',
 };
 
 export default function NotificationsPage() {
   const [items, setItems] = useState(notifications);
   const unreadCount = items.filter((n) => !n.read).length;
 
   const markAllRead = () => {
     setItems((prev) => prev.map((n) => ({ ...n, read: true })));
   };
 
   const markAsRead = (id: string) => {
     setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
   };
 
   const formatTime = (timestamp: string) => {
     const date = new Date(timestamp);
     return date.toLocaleDateString('en-US', {
       month: 'short',
       day: 'numeric',
       hour: '2-digit',
       minute: '2-digit',
     });
   };
 
   return (
     <DashboardLayout>
       <div className="space-y-6 animate-fade-in">
         {/* Page Header */}
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           <div className="flex items-center gap-3">
             <div>
               <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
               <p className="text-muted-foreground">Stay updated on partnership activities and alerts</p>
             </div>
             {unreadCount > 0 && (
               <Badge className="bg-destructive text-destructive-foreground">{unreadCount} new</Badge>
             )}
           </div>
           <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0} className="gap-2">
             <Check className="w-4 h-4" />
             Mark all as read
           </Button>
         </div>
 
         {/* Notifications List */}
         <Card className="border-border/50 shadow-sm">
           <CardHeader className="pb-2">
             <CardTitle className="text-lg font-semibold flex items-center gap-2">
               <Bell className="w-5 h-5" />
               All Notifications
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-2">
             {items.length === 0 ? (
               <div className="py-12 text-center text-muted-foreground">
                 <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                 <p>No notifications yet</p>
               </div>
             ) : (
               items.map((notification) => {
                 const Icon = iconMap[notification.type];
                 return (
                   <div
                     key={notification.id}
                     className={cn(
                       'flex items-start gap-4 p-4 rounded-lg border transition-colors',
                       !notification.read
                         ? 'bg-muted/50 border-border'
                         : 'bg-transparent border-transparent hover:bg-muted/30'
                     )}
                   >
                     <div className={cn('p-2 rounded-lg border', colorMap[notification.type])}>
                       <Icon className="w-4 h-4" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-start justify-between gap-2">
                         <div>
                           <p className={cn('font-medium', !notification.read && 'text-foreground')}>
                             {notification.title}
                           </p>
                           <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                         </div>
                         {!notification.read && (
                           <div className="w-2 h-2 rounded-full bg-chart-1 mt-2 flex-shrink-0" />
                         )}
                       </div>
                       <p className="text-xs text-muted-foreground mt-2">{formatTime(notification.timestamp)}</p>
                     </div>
                     <div className="flex gap-1">
                       {!notification.read && (
                         <Button
                           variant="ghost"
                           size="icon"
                           className="h-8 w-8"
                           onClick={() => markAsRead(notification.id)}
                         >
                           <Check className="w-4 h-4" />
                         </Button>
                       )}
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     </div>
                   </div>
                 );
               })
             )}
           </CardContent>
         </Card>
       </div>
     </DashboardLayout>
   );
 }