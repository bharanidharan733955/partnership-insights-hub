 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Switch } from '@/components/ui/switch';
 import { Separator } from '@/components/ui/separator';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Settings, Bell, Shield, Database, Palette } from 'lucide-react';
 
 export default function SettingsPage() {
   return (
     <DashboardLayout>
       <div className="space-y-6 animate-fade-in">
         {/* Page Header */}
         <div>
           <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
           <p className="text-muted-foreground">Manage system configuration and preferences</p>
         </div>
 
         <Tabs defaultValue="general" className="space-y-6">
           <TabsList className="bg-muted/50">
             <TabsTrigger value="general" className="gap-2">
               <Settings className="w-4 h-4" />
               General
             </TabsTrigger>
             <TabsTrigger value="notifications" className="gap-2">
               <Bell className="w-4 h-4" />
               Notifications
             </TabsTrigger>
             <TabsTrigger value="security" className="gap-2">
               <Shield className="w-4 h-4" />
               Security
             </TabsTrigger>
             <TabsTrigger value="data" className="gap-2">
               <Database className="w-4 h-4" />
               Data
             </TabsTrigger>
           </TabsList>
 
           <TabsContent value="general" className="space-y-6">
             <Card className="border-border/50">
               <CardHeader>
                 <CardTitle>Organization Settings</CardTitle>
                 <CardDescription>Manage your organization details and preferences</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="grid gap-4 md:grid-cols-2">
                   <div className="space-y-2">
                     <Label htmlFor="org-name">Organization Name</Label>
                     <Input id="org-name" defaultValue="Acme Corporation" />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="org-domain">Domain</Label>
                     <Input id="org-domain" defaultValue="acme.com" />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="timezone">Default Timezone</Label>
                   <Input id="timezone" defaultValue="America/New_York" />
                 </div>
                 <Separator />
                 <Button>Save Changes</Button>
               </CardContent>
             </Card>
 
             <Card className="border-border/50">
               <CardHeader>
                 <CardTitle>KPI Configuration</CardTitle>
                 <CardDescription>Set default thresholds for partnership KPIs</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="grid gap-4 md:grid-cols-3">
                   <div className="space-y-2">
                     <Label htmlFor="engagement-threshold">Engagement Threshold (%)</Label>
                     <Input id="engagement-threshold" type="number" defaultValue="70" />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="growth-target">Growth Target (%)</Label>
                     <Input id="growth-target" type="number" defaultValue="15" />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="revenue-target">Revenue Target ($)</Label>
                     <Input id="revenue-target" type="number" defaultValue="100000" />
                   </div>
                 </div>
                 <Separator />
                 <Button>Update Thresholds</Button>
               </CardContent>
             </Card>
           </TabsContent>
 
           <TabsContent value="notifications" className="space-y-6">
             <Card className="border-border/50">
               <CardHeader>
                 <CardTitle>Notification Preferences</CardTitle>
                 <CardDescription>Configure when and how you receive notifications</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="font-medium">Performance Alerts</p>
                     <p className="text-sm text-muted-foreground">Get notified when partners fall below thresholds</p>
                   </div>
                   <Switch defaultChecked />
                 </div>
                 <Separator />
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="font-medium">Target Achievements</p>
                     <p className="text-sm text-muted-foreground">Celebrate when partners exceed their targets</p>
                   </div>
                   <Switch defaultChecked />
                 </div>
                 <Separator />
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="font-medium">Weekly Digest</p>
                     <p className="text-sm text-muted-foreground">Receive a weekly summary of partnership performance</p>
                   </div>
                   <Switch defaultChecked />
                 </div>
                 <Separator />
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="font-medium">Contract Renewals</p>
                     <p className="text-sm text-muted-foreground">Reminders for upcoming contract renewals</p>
                   </div>
                   <Switch defaultChecked />
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
 
           <TabsContent value="security" className="space-y-6">
             <Card className="border-border/50">
               <CardHeader>
                 <CardTitle>Security Settings</CardTitle>
                 <CardDescription>Manage authentication and access controls</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="font-medium">Two-Factor Authentication</p>
                     <p className="text-sm text-muted-foreground">Require 2FA for all admin users</p>
                   </div>
                   <Switch defaultChecked />
                 </div>
                 <Separator />
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="font-medium">Session Timeout</p>
                     <p className="text-sm text-muted-foreground">Automatically log out inactive users</p>
                   </div>
                   <Switch defaultChecked />
                 </div>
                 <Separator />
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="font-medium">Audit Logging</p>
                     <p className="text-sm text-muted-foreground">Track all user actions and changes</p>
                   </div>
                   <Switch defaultChecked />
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
 
           <TabsContent value="data" className="space-y-6">
             <Card className="border-border/50">
               <CardHeader>
                 <CardTitle>Data Management</CardTitle>
                 <CardDescription>Configure data import, export, and retention policies</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                 <div className="space-y-2">
                   <Label>Data Retention Period</Label>
                   <Input defaultValue="3 years" />
                 </div>
                 <Separator />
                 <div className="flex gap-4">
                   <Button variant="outline">Export All Data</Button>
                   <Button variant="outline">Import Data</Button>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>
         </Tabs>
       </div>
     </DashboardLayout>
   );
 }