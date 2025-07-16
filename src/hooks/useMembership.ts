import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface MembershipData {
  membership_tier: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  membership_expires_at?: string;
  subscription_status?: string;
}

export const useMembership = () => {
  const { user } = useAuthStore();
  const [membershipData, setMembershipData] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMembershipData(null);
      setLoading(false);
      return;
    }

    fetchMembershipData();
  }, [user]);

  const fetchMembershipData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('membership_tier, stripe_customer_id, stripe_subscription_id, membership_expires_at, subscription_status')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching membership data:', error);
        return;
      }

      setMembershipData(data);
    } catch (error) {
      console.error('Error fetching membership data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPremiumMember = () => {
    if (!membershipData) return false;
    
    // Check if membership is active and not expired
    const tier = membershipData.membership_tier;
    const status = membershipData.subscription_status;
    const expiresAt = membershipData.membership_expires_at;
    
    // Free tier is never premium
    if (tier === 'free') return false;
    
    // If subscription status indicates issues, not premium
    if (status && ['canceled', 'unpaid', 'incomplete_expired'].includes(status)) {
      return false;
    }
    
    // Check expiration date if present
    if (expiresAt) {
      const now = new Date();
      const expiry = new Date(expiresAt);
      if (now > expiry) return false;
    }
    
    return tier !== 'free';
  };

  const getMembershipTier = () => {
    return membershipData?.membership_tier || 'free';
  };

  const getSubscriptionStatus = () => {
    return membershipData?.subscription_status || 'active';
  };

  const getMembershipDisplayName = () => {
    const tier = getMembershipTier();
    switch (tier) {
      case 'monthly':
        return 'Monthly Premium';
      case 'quarterly':
        return '3-Month Premium';
      case 'semiannual':
        return '6-Month Premium';
      default:
        return 'Free';
    }
  };

  const getStatusMessage = () => {
    const status = getSubscriptionStatus();
    const tier = getMembershipTier();
    
    if (tier === 'free') return null;
    
    switch (status) {
      case 'past_due':
        return { 
          type: 'warning' as const, 
          message: 'Payment overdue. Please update your payment method to maintain access.' 
        };
      case 'canceled':
        return { 
          type: 'error' as const, 
          message: 'Subscription canceled. You have access until your current period ends.' 
        };
      case 'unpaid':
        return { 
          type: 'error' as const, 
          message: 'Payment failed. Please update your payment method.' 
        };
      case 'incomplete':
        return { 
          type: 'warning' as const, 
          message: 'Payment processing. This may take a few minutes.' 
        };
      case 'trialing':
        return { 
          type: 'info' as const, 
          message: 'Trial period active. Enjoy your premium features!' 
        };
      case 'paused':
        return { 
          type: 'info' as const, 
          message: 'Subscription paused. Resume anytime to regain access.' 
        };
      case 'active':
      default:
        return null;
    }
  };

  const isSubscriptionHealthy = () => {
    const status = getSubscriptionStatus();
    return ['active', 'trialing'].includes(status);
  };

  const needsPaymentAttention = () => {
    const status = getSubscriptionStatus();
    return ['past_due', 'unpaid', 'incomplete'].includes(status);
  };

  const refreshMembershipData = () => {
    fetchMembershipData();
  };

  return {
    membershipData,
    loading,
    isPremiumMember: isPremiumMember(),
    membershipTier: getMembershipTier(),
    subscriptionStatus: getSubscriptionStatus(),
    membershipDisplayName: getMembershipDisplayName(),
    statusMessage: getStatusMessage(),
    isSubscriptionHealthy: isSubscriptionHealthy(),
    needsPaymentAttention: needsPaymentAttention(),
    refreshMembershipData,
  };
}; 