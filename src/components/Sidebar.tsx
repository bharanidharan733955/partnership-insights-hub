import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileEdit, LogOut, BarChart2, Shield, Settings, Menu, ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Sidebar = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const links = [
        { name: 'Overview', icon: LayoutDashboard, path: '/dashboard', roles: ['ANALYST', 'PARTNER'] },
        { name: 'Data Entry', icon: FileEdit, path: '/data-entry', roles: ['PARTNER'] },
        { name: 'Analyst Hub', icon: BarChart2, path: '/analytics', roles: ['ANALYST'] },
        { name: 'System Admin', icon: Shield, path: '/admin', roles: ['ANALYST'] },
    ];

    const filteredLinks = links.filter(link => link.roles.includes(user.role));

    return (
        <div className="w-72 bg-card border-r flex flex-col h-screen z-50">
            <div className="p-8 pb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                        <BarChart2 size={24} />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight uppercase italic underline decoration-primary decoration-4 underline-offset-4">Insight</h1>
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Enterprise Matrix</p>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4">
                {filteredLinks.map((link) => (
                    <button
                        key={link.name}
                        onClick={() => navigate(link.path)}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative",
                            location.pathname === link.path
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <link.icon size={20} className={cn(
                            "transition-colors",
                            location.pathname === link.path ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                        )} />
                        <span className="font-bold text-sm tracking-wide">{link.name}</span>
                        {location.pathname === link.path && (
                            <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                        )}
                    </button>
                ))}
            </nav>

            <div className="mt-auto p-4 space-y-4">
                <Separator className="bg-muted-foreground/10" />
                <div className="bg-muted/40 rounded-2xl p-4 flex items-center gap-4 border border-muted/50">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                            {user.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-black truncate">{user.name}</p>
                        <Badge variant="outline" className="text-[9px] h-4 py-0 font-bold uppercase tracking-tighter opacity-70">
                            {user.role}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pb-4">
                    <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground justify-start px-3 font-bold text-xs uppercase tracking-widest">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onLogout}
                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 justify-start px-3 font-bold text-xs uppercase tracking-widest"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
