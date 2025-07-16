import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationState {
  email: string;
  firstName: string;
  userId: string;
}

const MembershipSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, firstName, userId } = (location.state as LocationState) || {};
  const [selectedPlan, setSelectedPlan] = useState<string>('3monthly');
  const [loading, setLoading] = useState(false);

  // If no email/firstName/userId in state, redirect to signup
  if (!email || !firstName || !userId) {
    navigate('/signup');
    return null;
  }

  const membershipPlans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$29',
      description: 'Flexible month-to-month membership',
      features: [
        'Priority booking access',
        'Exclusive premium events',
        'VIP member community',
        'Advanced booking protection',
        'Personal fitness tracking',
        'Early access to new features'
      ],
      badge: null,
      popular: false,
      cta: 'Payment'
    },
    {
      id: '3monthly',
      name: '3 Monthly',
      price: '$79',
      originalPrice: '$87',
      description: 'Save with our quarterly plan',
      features: [
        'Everything in Monthly',
        'Save $8 per quarter',
        'Priority customer support',
        'Exclusive quarterly bonuses',
        'Enhanced booking protection',
        'Advanced analytics'
      ],
      badge: 'Most Popular',
      popular: true,
      cta: 'Payment'
    },
    {
      id: '6monthly',
      name: '6 Monthly',
      price: '$149',
      originalPrice: '$174',
      description: 'Best value with our semi-annual plan',
      features: [
        'Everything in 3 Monthly',
        'Save $25 per 6 months',
        'Exclusive semi-annual perks',
        'Priority customer support',
        'Special member meetups',
        'Premium achievement badges'
      ],
      badge: 'Best Value',
      popular: false,
      cta: 'Payment'
    }
  ];

  const handlePlanSelection = async (planId: string) => {
    setLoading(true);
    
    try {
      // All plans now require payment, redirect to checkout
      let stripePlan = 'monthly'; // default
      
      if (planId === 'monthly') {
        stripePlan = 'monthly';
      } else if (planId === '3monthly') {
        stripePlan = 'quarterly';
      } else if (planId === '6monthly') {
        stripePlan = 'semiannual';
      }

      const response = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          plan: stripePlan,
          userId: userId
        }
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
      console.error('Error processing plan selection:', error);
      // Fallback to free plan if payment fails
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // User chose free membership, redirect to the main app
    navigate('/home');
  };

  return (
    <div className="min-h-screen overflow-y-auto flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl animate-fade-in">

        {/* Logo top-left */}
        <img
          src="https://uhkksexuecjfzmgdbwax.supabase.co/storage/v1/object/public/logo//SCR-20250716-knzf.png"
          alt="Nomas Club logo"
          className="absolute top-4 left-4 h-10 w-auto select-none"
        />

        {/* Welcome Message */}
        <div className="mb-8 text-center pt-16">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
            Welcome, {firstName}!
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto mb-2">
            Choose the perfect membership to unlock your potential
          </p>
          <p className="text-sm text-muted-foreground">
            You can upgrade or downgrade anytime
          </p>
        </div>

        {/* Membership Plans */}
        <div className="grid gap-4 mb-8">
          {membershipPlans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                "relative p-6 rounded-xl border-2 cursor-pointer transition-all group",
                "hover:border-green-300 hover:shadow-lg hover:scale-[1.02]",
                selectedPlan === plan.id
                  ? "border-[#142B13] bg-green-50/50 dark:bg-green-950/20 shadow-lg"
                  : "border-border bg-background hover:bg-green-50/20 dark:hover:bg-green-950/10"
              )}
            >
              {/* Popular/Badge indicators */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className={cn(
                    "text-xs font-medium px-3 py-1",
                    plan.popular 
                      ? "bg-gradient-to-r from-green-600 to-green-700 text-white"
                      : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                  )}>
                    {plan.badge}
                  </Badge>
                </div>
              )}



              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {plan.description}
                  </p>
                </div>
                <div className="text-right">
                  {plan.originalPrice && (
                    <p className="text-sm text-muted-foreground line-through">
                      {plan.originalPrice}
                    </p>
                  )}
                  <p className="text-2xl font-bold text-[#142B13]">
                    {plan.price}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-600 flex-shrink-0"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>


            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => handlePlanSelection(selectedPlan)}
            disabled={loading}
            className="w-full h-14 bg-[#142B13] hover:bg-[#0f1c0e] text-white text-lg group"
            size="lg"
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                {membershipPlans.find(p => p.id === selectedPlan)?.cta || 'Payment'}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Continue as a free member
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Secure payment • 30-day money-back guarantee • Cancel anytime
          </p>
          <div className="flex justify-center items-center gap-4 text-xs text-muted-foreground">
            <span>1,247+ members</span>
            <span>SSL secure</span>
            <span>4.9/5 rating</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipSelectionPage; 