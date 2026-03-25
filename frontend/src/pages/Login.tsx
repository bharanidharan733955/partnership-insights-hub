import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight, User, MapPin, Building2, Chrome, CheckCircle2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
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
  const [signupReady, setSignupReady] = useState(false);
  const navigate = useNavigate();
  const { signIn, googleSignUp, googleSignIn, user } = useAuth();

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

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError('');
    try {
      if (credentialResponse.credential) {
        await googleSignIn(credentialResponse.credential);
      }
    } catch (err: any) {
      setError(err.message || 'Google login failed. Please ensure you have an existing account.');
    } finally {
      setLoading(false);
    }
  };

  // Validate signup fields before showing Google button
  const validateSignupFields = () => {
    if (!name.trim()) {
      setError('Please enter your full name.');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    if (!branchName.trim()) {
      setError('Branch name is required.');
      return false;
    }
    if (!branchLocation.trim()) {
      setError('Branch location is required.');
      return false;
    }
    setError('');
    return true;
  };

  const handleProceedToGoogle = () => {
    if (validateSignupFields()) {
      setSignupReady(true);
    }
  };

  const handleGoogleRegister = async (credentialResponse: any) => {
    setLoading(true);
    setError('');
    try {
      if (credentialResponse.credential) {
        await googleSignUp({
          idToken: credentialResponse.credential,
          name: name.trim(),
          password,
          branchName: branchName.trim(),
          branchLocation: branchLocation.trim(),
        });
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
      setSignupReady(false);
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
          <Tabs defaultValue="login" className="w-full" onValueChange={() => { setError(''); setSignupReady(false); }}>
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
                      placeholder="you@gmail.com"
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

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground font-semibold tracking-wider">Or continue with</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google Login Failed')}
                    useOneTap
                    theme="filled_blue"
                    shape="pill"
                    text="signin_with"
                    width="100%"
                  />
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="bg-destructive/10 text-destructive border-none">
                    <AlertDescription className="text-center font-semibold">{error}</AlertDescription>
                  </Alert>
                )}

                {!signupReady ? (
                  <>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                      <Chrome size={16} className="text-primary shrink-0" />
                      <span>Your email will be verified through <strong>Google Sign-In</strong>. Only Google-authorized accounts are accepted.</span>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Full Name (Partner)</Label>
                      <div className="relative group">
                        <User className="absolute left-3 top-3 text-muted-foreground" size={18} />
                        <Input required value={name} onChange={(e) => setName(e.target.value)} className="h-11 pl-10 bg-background/50" placeholder="John Doe" />
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

                    <Button
                      type="button"
                      onClick={handleProceedToGoogle}
                      disabled={loading}
                      className="w-full h-12 font-bold text-lg rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 group"
                    >
                      {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                        <><span>Continue</span><ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                      <CheckCircle2 size={16} className="shrink-0" />
                      <span>Details confirmed! Now verify your Google account to complete registration.</span>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Name:</span><span className="font-semibold">{name}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Branch:</span><span className="font-semibold">{branchName}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Location:</span><span className="font-semibold">{branchLocation}</span></div>
                    </div>

                    {loading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="animate-spin h-6 w-6 text-primary" />
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <GoogleLogin
                          onSuccess={handleGoogleRegister}
                          onError={() => { setError('Google verification failed. Please try again.'); setSignupReady(false); }}
                          theme="filled_blue"
                          shape="pill"
                          text="signup_with"
                          width="100%"
                        />
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setSignupReady(false)}
                      className="w-full text-sm text-muted-foreground"
                    >
                      ← Back to edit details
                    </Button>
                  </div>
                )}
              </div>
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
