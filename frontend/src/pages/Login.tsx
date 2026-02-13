import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight, User, MapPin, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchLocation, setBranchLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

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
      if (!branchName.trim() || !branchLocation.trim()) {
        setError('Branch name and location are required');
        setLoading(false);
        return;
      }
      await signUp({
        email,
        password,
        name,
        branchName: branchName.trim(),
        branchLocation: branchLocation.trim(),
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
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
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
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Full Name (Partner)</Label>
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
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Branch Name</Label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-3 text-muted-foreground" size={18} />
                    <Input required value={branchName} onChange={(e) => setBranchName(e.target.value)} className="h-11 pl-10 bg-background/50" placeholder="South Branch" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Branch Location</Label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-3 text-muted-foreground" size={18} />
                    <Input required value={branchLocation} onChange={(e) => setBranchLocation(e.target.value)} className="h-11 pl-10 bg-background/50" placeholder="Bangalore" />
                  </div>
                </div>

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
