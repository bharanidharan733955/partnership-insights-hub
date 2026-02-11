import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight, User, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BranchOption {
  id: string;
  name: string;
  location: string;
  partner_id: string;
  partner_name?: string;
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<AppRole>('partner');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingBranches, setFetchingBranches] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  // Fetch branches for signup form
  useEffect(() => {
    if (role === 'partner' && branches.length === 0) {
      fetchBranchesForSignup();
    }
  }, [role]);

  const fetchBranchesForSignup = async () => {
    console.log('Fetching branches for signup...');
    setFetchingBranches(true);
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, location, partner_id, partners:partner_id(name)');

      if (error) {
        console.error('Supabase error fetching branches:', error);
        throw error;
      }

      console.log('Fetched branches raw data:', data);

      if (data && data.length > 0) {
        setBranches(data.map((b: any) => ({
          id: b.id,
          name: b.name,
          location: b.location,
          partner_id: b.partner_id,
          partner_name: b.partners?.name,
        })));
      } else {
        console.warn('No branches found in database. RLS might be blocking or table is empty.');
      }
    } catch (err: any) {
      console.error('Failed to fetch branches:', err);
      setError('Could not load branches. Please ensure you have applied the Supabase migrations.');
    } finally {
      setFetchingBranches(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (role === 'partner' && !selectedBranch) {
        setError('Please select your branch');
        setLoading(false);
        return;
      }

      const branch = branches.find(b => b.id === selectedBranch);

      await signUp({
        email,
        password,
        name,
        role,
        branchId: role === 'partner' ? selectedBranch : undefined,
        partnerId: role === 'partner' ? branch?.partner_id : undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background">
      <Card className="w-full max-w-md border-none shadow-2xl bg-card/80 backdrop-blur-md overflow-hidden animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-3 text-center pt-10">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <ShieldCheck className="text-primary-foreground h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-3xl font-extrabold tracking-tight">Partnership Analytics</CardTitle>
            <CardDescription className="text-base font-medium">Sign in to access the platform</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup" onClick={fetchBranchesForSignup}>Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="bg-destructive/10 text-destructive border-none">
                    <AlertDescription className="text-center font-semibold">{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 text-muted-foreground transition-colors group-focus-within:text-primary" size={18} />
                    <Input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-10 border-muted group-hover:border-primary/50 transition-all bg-background/50"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 text-muted-foreground transition-colors group-focus-within:text-primary" size={18} />
                    <Input
                      id="login-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-10 border-muted group-hover:border-primary/50 transition-all bg-background/50"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-12 font-bold text-lg rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 group">
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                    <><span>Sign In</span><ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="bg-destructive/10 text-destructive border-none">
                    <AlertDescription className="text-center font-semibold">{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-3 text-muted-foreground" size={18} />
                    <Input required value={name} onChange={(e) => setName(e.target.value)} className="h-11 pl-10 bg-background/50" placeholder="John Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 text-muted-foreground" size={18} />
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 pl-10 bg-background/50" placeholder="you@company.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 text-muted-foreground" size={18} />
                    <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 pl-10 bg-background/50" placeholder="Min 6 characters" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                    <SelectTrigger className="h-11 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="partner">Branch Manager (Partner)</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {role === 'partner' && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Select Branch</Label>
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                      <SelectTrigger className="h-11 bg-background/50">
                        <SelectValue placeholder="Choose your branch..." />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span>{b.partner_name} — {b.name} ({b.location})</span>
                            </div>
                          </SelectItem>
                        ))}
                        {fetchingBranches && (
                          <div className="p-3 text-sm text-muted-foreground text-center animate-pulse">
                            Searching for branches...
                          </div>
                        )}
                        {!fetchingBranches && branches.length === 0 && (
                          <div className="p-4 text-center space-y-2">
                            <p className="text-sm font-semibold text-destructive">No branches found</p>
                            <p className="text-xs text-muted-foreground">Please apply the migrations in Supabase SQL Editor.</p>
                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); fetchBranchesForSignup(); }} className="mt-2 h-8 w-full">
                              Retry Fetching
                            </Button>
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full h-12 font-bold text-lg rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 group">
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                    <><span>Create Account</span><ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="bg-muted/30 border-t flex flex-col items-center py-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Partnership Analytics System</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
