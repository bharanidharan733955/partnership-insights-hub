 import { DashboardLayout } from '@/components/layout/DashboardLayout';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { FileText, Download, Calendar, Clock, FileSpreadsheet, FilePieChart, FileBarChart } from 'lucide-react';
 
 const reports = [
   {
     id: '1',
     name: 'Q4 2023 Partnership Summary',
     type: 'Quarterly Report',
     icon: FileBarChart,
     date: '2024-01-05',
     status: 'ready',
   },
   {
     id: '2',
     name: 'Annual Revenue Analysis',
     type: 'Annual Report',
     icon: FilePieChart,
     date: '2024-01-01',
     status: 'ready',
   },
   {
     id: '3',
     name: 'Partner Engagement Metrics',
     type: 'Performance Report',
     icon: FileSpreadsheet,
     date: '2024-01-10',
     status: 'ready',
   },
   {
     id: '4',
     name: 'Risk Assessment Report',
     type: 'Risk Report',
     icon: FileText,
     date: '2024-01-12',
     status: 'ready',
   },
   {
     id: '5',
     name: 'January 2024 Summary',
     type: 'Monthly Report',
     icon: FileBarChart,
     date: '2024-01-15',
     status: 'generating',
   },
 ];
 
 const reportTemplates = [
   { name: 'Partner Performance', description: 'Individual partner KPIs and trends', icon: FileBarChart },
   { name: 'Revenue Breakdown', description: 'Revenue by tier, industry, region', icon: FilePieChart },
   { name: 'Engagement Analysis', description: 'Engagement scores and activities', icon: FileSpreadsheet },
   { name: 'Custom Report', description: 'Build your own report template', icon: FileText },
 ];
 
 export default function ReportsPage() {
   return (
     <DashboardLayout>
       <div className="space-y-6 animate-fade-in">
         {/* Page Header */}
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           <div>
             <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
             <p className="text-muted-foreground">Generate and download partnership analytics reports</p>
           </div>
           <Button className="gap-2">
             <FileText className="w-4 h-4" />
             Generate Report
           </Button>
         </div>
 
         {/* Report Templates */}
         <div>
           <h2 className="text-lg font-semibold mb-4">Quick Generate</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {reportTemplates.map((template) => (
               <Card key={template.name} className="border-border/50 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                 <CardContent className="p-6">
                   <div className="flex flex-col items-center text-center gap-3">
                     <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                       <template.icon className="w-6 h-6 text-primary" />
                     </div>
                     <div>
                       <p className="font-medium">{template.name}</p>
                       <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         </div>
 
         {/* Recent Reports */}
         <Card className="border-border/50 shadow-sm">
           <CardHeader className="pb-2">
             <CardTitle className="text-lg font-semibold">Recent Reports</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="space-y-3">
               {reports.map((report) => (
                 <div
                   key={report.id}
                   className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                 >
                   <div className="p-2 rounded-lg bg-primary/10">
                     <report.icon className="w-5 h-5 text-primary" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="font-medium truncate">{report.name}</p>
                     <div className="flex items-center gap-3 mt-1">
                       <Badge variant="outline" className="text-xs">{report.type}</Badge>
                       <span className="flex items-center gap-1 text-xs text-muted-foreground">
                         <Calendar className="w-3 h-3" />
                         {new Date(report.date).toLocaleDateString()}
                       </span>
                     </div>
                   </div>
                   {report.status === 'ready' ? (
                     <Button variant="outline" size="sm" className="gap-2">
                       <Download className="w-4 h-4" />
                       Download
                     </Button>
                   ) : (
                     <Badge variant="secondary" className="gap-1">
                       <Clock className="w-3 h-3 animate-spin" />
                       Generating
                     </Badge>
                   )}
                 </div>
               ))}
             </div>
           </CardContent>
         </Card>
       </div>
     </DashboardLayout>
   );
 }