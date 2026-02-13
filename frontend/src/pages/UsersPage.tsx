 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Avatar, AvatarFallback } from '@/components/ui/avatar';
 import { Input } from '@/components/ui/input';
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from '@/components/ui/table';
 import { cn } from '@/lib/utils';
 import { Search, Plus, Users, MoreHorizontal, Shield, BarChart3, Briefcase, Building2 } from 'lucide-react';
 
 const users = [
   { id: '1', name: 'Sarah Mitchell', email: 'sarah.mitchell@company.com', role: 'admin', status: 'active', lastActive: '2024-01-15' },
   { id: '2', name: 'James Wilson', email: 'james.wilson@company.com', role: 'analyst', status: 'active', lastActive: '2024-01-15' },
   { id: '3', name: 'Emily Chen', email: 'emily.chen@company.com', role: 'manager', status: 'active', lastActive: '2024-01-14' },
   { id: '4', name: 'Michael Brown', email: 'michael.brown@partner.com', role: 'partner', status: 'active', lastActive: '2024-01-13' },
   { id: '5', name: 'Lisa Anderson', email: 'lisa.anderson@company.com', role: 'analyst', status: 'active', lastActive: '2024-01-15' },
   { id: '6', name: 'David Kim', email: 'david.kim@company.com', role: 'manager', status: 'inactive', lastActive: '2024-01-01' },
 ];
 
 const roleIcons = {
   admin: Shield,
   analyst: BarChart3,
   manager: Briefcase,
   partner: Building2,
 };
 
 const roleStyles = {
   admin: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
   analyst: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
   manager: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
   partner: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
 };
 
 export default function UsersPage() {
   return (
     <DashboardLayout>
       <div className="space-y-6 animate-fade-in">
         {/* Page Header */}
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           <div>
             <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
             <p className="text-muted-foreground">Manage system users and their access permissions</p>
           </div>
           <Button className="gap-2">
             <Plus className="w-4 h-4" />
             Add User
           </Button>
         </div>
 
         {/* Stats */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <Card className="border-border/50">
             <CardContent className="p-4">
               <p className="text-sm text-muted-foreground">Total Users</p>
               <p className="text-2xl font-bold">{users.length}</p>
             </CardContent>
           </Card>
           <Card className="border-border/50">
             <CardContent className="p-4">
               <p className="text-sm text-muted-foreground">Active</p>
               <p className="text-2xl font-bold text-success">{users.filter((u) => u.status === 'active').length}</p>
             </CardContent>
           </Card>
           <Card className="border-border/50">
             <CardContent className="p-4">
               <p className="text-sm text-muted-foreground">Admins</p>
               <p className="text-2xl font-bold">{users.filter((u) => u.role === 'admin').length}</p>
             </CardContent>
           </Card>
           <Card className="border-border/50">
             <CardContent className="p-4">
               <p className="text-sm text-muted-foreground">Partners</p>
               <p className="text-2xl font-bold">{users.filter((u) => u.role === 'partner').length}</p>
             </CardContent>
           </Card>
         </div>
 
         {/* Users Table */}
         <Card className="border-border/50 shadow-sm">
           <CardHeader className="pb-2 flex flex-row items-center justify-between">
             <CardTitle className="text-lg font-semibold flex items-center gap-2">
               <Users className="w-5 h-5" />
               All Users
             </CardTitle>
             <div className="relative w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <Input placeholder="Search users..." className="pl-9" />
             </div>
           </CardHeader>
           <CardContent>
             <div className="overflow-x-auto">
               <Table>
                 <TableHeader>
                   <TableRow className="hover:bg-transparent">
                     <TableHead className="font-semibold">User</TableHead>
                     <TableHead className="font-semibold">Role</TableHead>
                     <TableHead className="font-semibold">Status</TableHead>
                     <TableHead className="font-semibold">Last Active</TableHead>
                     <TableHead className="w-10"></TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {users.map((user) => {
                     const RoleIcon = roleIcons[user.role as keyof typeof roleIcons];
                     return (
                       <TableRow key={user.id} className="hover:bg-muted/50">
                         <TableCell>
                           <div className="flex items-center gap-3">
                             <Avatar className="h-9 w-9">
                               <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                 {user.name.split(' ').map((n) => n[0]).join('')}
                               </AvatarFallback>
                             </Avatar>
                             <div>
                               <p className="font-medium">{user.name}</p>
                               <p className="text-sm text-muted-foreground">{user.email}</p>
                             </div>
                           </div>
                         </TableCell>
                         <TableCell>
                           <Badge variant="outline" className={cn('capitalize text-xs gap-1', roleStyles[user.role as keyof typeof roleStyles])}>
                             <RoleIcon className="w-3 h-3" />
                             {user.role}
                           </Badge>
                         </TableCell>
                         <TableCell>
                           <Badge
                             variant="outline"
                             className={cn(
                               'capitalize text-xs',
                               user.status === 'active'
                                 ? 'bg-success/10 text-success border-success/20'
                                 : 'bg-muted text-muted-foreground border-border'
                             )}
                           >
                             {user.status}
                           </Badge>
                         </TableCell>
                         <TableCell className="text-muted-foreground">
                           {new Date(user.lastActive).toLocaleDateString()}
                         </TableCell>
                         <TableCell>
                           <Button variant="ghost" size="icon" className="h-8 w-8">
                             <MoreHorizontal className="w-4 h-4" />
                           </Button>
                         </TableCell>
                       </TableRow>
                     );
                   })}
                 </TableBody>
               </Table>
             </div>
           </CardContent>
         </Card>
       </div>
     </DashboardLayout>
   );
 }