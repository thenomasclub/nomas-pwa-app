import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useMembership } from '@/hooks/useMembership';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PremiumBadge } from '@/components/ui/premium-badge';
import { MembershipCard } from '@/components/MembershipCard';
import { User, Mail, Calendar, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import Layout from '@/components/Layout';

interface UserStats {
  totalBookings: number;
  upcomingBookings: number;
  favoriteActivity: string;
  memberSince: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { 
    isPremiumMember, 
    membershipDisplayName,
    statusMessage,
    needsPaymentAttention,
    isSubscriptionHealthy 
  } = useMembership();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarUploadLoading, setAvatarUploadLoading] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Get total bookings
      const { count: totalBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get upcoming bookings
      const { count: upcomingBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .gte('events.date', new Date().toISOString());

      // Get most booked activity type
      const { data: bookingTypes } = await supabase
        .from('bookings')
        .select(`
          event:events (type)
        `)
        .eq('user_id', user.id);

      const typeCounts = bookingTypes?.reduce((acc, booking) => {
        const type = (booking.event as any)?.type;
        if (type) {
          acc[type] = (acc[type] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const favoriteActivity = Object.entries(typeCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None yet';

      setStats({
        totalBookings: totalBookings || 0,
        upcomingBookings: upcomingBookings || 0,
        favoriteActivity: favoriteActivity.charAt(0).toUpperCase() + favoriteActivity.slice(1),
        memberSince: user.created_at || new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleUpdateProfile = useCallback(async (name: string) => {
    if (!user || !name.trim()) return;

    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: name.trim() }
      });

      if (error) throw error;

      toast.success('Profile updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  }, [user]);

  // Debounced auto-save function
  const debouncedSave = useCallback((name: string) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    const timeout = setTimeout(() => {
      handleUpdateProfile(name);
    }, 1000); // Wait 1 second after user stops typing

    setSaveTimeout(timeout);
  }, [saveTimeout, handleUpdateProfile]);

  // Auto-save when displayName changes
  useEffect(() => {
    if (user && displayName && displayName !== (user.user_metadata?.display_name || user.email?.split('@')[0] || '')) {
      debouncedSave(displayName);
    }

    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [displayName, user, debouncedSave, saveTimeout]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploadLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage (ensure an "avatars" bucket exists with public read)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl }
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success('Profile photo updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload photo');
    } finally {
      setAvatarUploadLoading(false);
    }
  };

  const handleSubscription = async (plan: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('create-checkout-session', {
        body: { plan, userId: user.id }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { url } = response.data;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast.error(error.message || 'Failed to create checkout session');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('create-customer-portal', {
        body: { userId: user.id }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { url } = response.data;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error: any) {
      console.error('Error creating customer portal session:', error);
      toast.error(error.message || 'Failed to open subscription management');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    signOut();
    navigate('/');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 pt-8 pb-24 max-w-4xl">
          <div className="mb-8 animate-fade-in text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">My Profile</h1>
              <PremiumBadge isPremium={isPremiumMember} size="lg" />
            </div>
            <p className="text-muted-foreground">Manage your account settings</p>
          </div>

          <div className="grid gap-6">
            {/* Profile Information */}
            <Card className="animate-scale-in glass shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="relative group focus:outline-none"
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="h-24 w-24 rounded-full object-cover border shadow-md group-hover:opacity-80 transition"
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-3xl shadow-md group-hover:opacity-80 transition">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="absolute inset-0 hidden group-hover:flex items-center justify-center text-xs font-medium text-primary-foreground bg-black/40 rounded-full">Change</span>
                    </button>
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={avatarUploadLoading}
                      className="hidden"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="email"
                      value={email}
                      disabled
                      className="flex-1"
                    />
                    <Badge variant="secondary" className="shrink-0">
                      <Mail className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {stats && format(new Date(stats.memberSince), 'MMMM d, yyyy')}
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Subscription Status Alert */}
            {statusMessage && (
              <Card className={`animate-scale-in mb-6 border-2 ${
                statusMessage.type === 'error' ? 'border-red-200 bg-red-50' :
                statusMessage.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      statusMessage.type === 'error' ? 'bg-red-500' :
                      statusMessage.type === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <p className={`font-medium ${
                      statusMessage.type === 'error' ? 'text-red-900' :
                      statusMessage.type === 'warning' ? 'text-yellow-900' :
                      'text-blue-900'
                    }`}>
                      {statusMessage.message}
                    </p>
                  </div>
                  {needsPaymentAttention && (
                    <Button
                      onClick={handleManageSubscription}
                      className="mt-4 w-full"
                      variant={statusMessage.type === 'error' ? 'destructive' : 'default'}
                    >
                      Update Payment Method
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Membership Section */}
            <div className="animate-scale-in">
              <MembershipCard
                isPremiumMember={isPremiumMember}
                membershipDisplayName={membershipDisplayName}
                onSubscribe={handleSubscription}
                onManageSubscription={handleManageSubscription}
                loading={loading}
              />
            </div>

            {/* Activity Stats */}
            {/* Achievements */}

            {/* Sign Out Button */}
            <Button
              variant="destructive"
              className="w-full max-w-sm mx-auto flex items-center gap-2 shadow-lg"
              onClick={handleSignOut}
              style={{ animationDelay: '250ms' }}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage; 