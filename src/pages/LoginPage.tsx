import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Production authentication
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate('/home');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col items-center justify-center bg-background px-4 overscroll-none">
      <div className="w-full max-w-sm animate-fade-in">

        {/* Logo top-left */}
        <img
          src="https://uhkksexuecjfzmgdbwax.supabase.co/storage/v1/object/public/logo//SCR-20250716-knzf.png"
          alt="Nomas Club logo"
          className="absolute top-4 left-4 h-10 w-auto select-none"
        />

        {/* Heading */}
        <div className="mb-6 text-center pt-16">
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight mb-2">
            Sign in
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Welcome back to Nomas Club
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3 pt-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md animate-slide-down">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between text-sm mt-2">
            <label className="flex items-center gap-2 select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded-sm border"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-primary hover:underline">
              Forgot your password?
            </Link>
          </div>

          <div className="flex flex-col space-y-3 pb-4">
            <Button
              type="submit"
              className="w-full h-[40px] group mt-2"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
            
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 