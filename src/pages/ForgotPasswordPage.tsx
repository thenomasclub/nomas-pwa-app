import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Layout from '@/components/Layout';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${import.meta.env.VITE_APP_URL}/update-password`,
      });
      if (error) throw error;
      setMessage('Check your email for the password reset link.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-sm space-y-6 animate-fade-in">
          <h1 className="text-3xl font-bold text-center">Forgot Password</h1>
          <form onSubmit={handleReset} className="space-y-4">
            {message && (
              <div className="bg-primary/10 text-primary p-3 rounded">
                {message}
              </div>
            )}
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
          <p className="text-center text-sm">
            Remembered your password?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage; 