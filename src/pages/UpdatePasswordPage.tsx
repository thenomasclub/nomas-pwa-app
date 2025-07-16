import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';

const UpdatePasswordPage = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setValidSession(true);
      }
    };
    checkSession();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage('Password updated successfully. You can now sign in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!validSession) {
    return (
      <div className="h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4 animate-fade-in">
          <Lock className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-lg text-muted-foreground max-w-sm">
            The password reset link is invalid or has expired. Please request a new one.
          </p>
          <Button onClick={() => navigate('/forgot-password')}>Request new link</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-center">Set New Password</h1>
        <form onSubmit={handleUpdate} className="space-y-4">
          {message && (
            <div className="flex items-center gap-2 bg-green-100 text-green-700 p-3 rounded">
              <CheckCircle className="h-4 w-4" /> {message}
            </div>
          )}
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="new-password"
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 pr-10 h-12"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-3 text-muted-foreground"
                aria-label={showNew ? 'Hide password' : 'Show password'}>
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10 h-12"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-muted-foreground"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Update password'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordPage; 