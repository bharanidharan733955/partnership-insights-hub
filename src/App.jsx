import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import AnalystDashboard from './pages/AnalystDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    }, [token]);

    const handleLogin = (data) => {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    };

    const handleLogout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
    };

    if (!user) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <TooltipProvider>
            <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
                <Sidebar user={user} onLogout={handleLogout} />
                <main className="flex-1 flex flex-col overflow-hidden bg-muted/30">
                    <Routes>
                        <Route path="/dashboard" element={
                            user.role === 'ANALYST' ? <AnalystDashboard /> : <PartnerDashboard user={user} />
                        } />
                        <Route path="/data-entry" element={
                            user.role === 'PARTNER' ? <PartnerDashboard user={user} /> : <Navigate to="/dashboard" />
                        } />
                        <Route path="/analytics" element={
                            user.role === 'ANALYST' ? <AnalystDashboard /> : <Navigate to="/dashboard" />
                        } />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </main>
            </div>
            <Toaster position="top-right" />
        </TooltipProvider>
    );
}

export default App;
