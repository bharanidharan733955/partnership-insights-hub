 import { ReactNode } from 'react';
 import { AppSidebar } from './AppSidebar';
 import { Header } from './Header';
 
 interface DashboardLayoutProps {
   children: ReactNode;
 }
 
 export function DashboardLayout({ children }: DashboardLayoutProps) {
   return (
     <div className="flex h-screen w-full bg-background overflow-hidden">
       <AppSidebar />
       <div className="flex-1 flex flex-col overflow-hidden">
         <Header />
         <main className="flex-1 overflow-y-auto p-6">
           {children}
         </main>
       </div>
     </div>
   );
 }