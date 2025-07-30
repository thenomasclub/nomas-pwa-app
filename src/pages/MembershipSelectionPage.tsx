import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LocationState {
  email: string;
  firstName: string;
  userId: string;
}

const MembershipSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, firstName, userId } = (location.state as LocationState) || {};
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle payment cancel from Stripe
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'canceled') {
      // Show cancel message
      toast.error('Payment was canceled. You can try again or choose the free plan.');
      
      // Clear the payment parameter from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('payment');
      setSearchParams(newParams);
    }
  }, [searchParams, setSearchParams]);

  // If no email/firstName/userId in state, redirect to signup
  if (!email || !firstName || !userId) {
    navigate('/signup');
    return null;
  }

  const membershipPlans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '£50',
      description: 'Paid Membership with exclusive benefits',
      features: [
        'Complimentary access to all member-only events',
        '1 free padel session per month',
        'Monthly Founders Dinner',
        'Bi-weekly Nomas Minds talk series',
        'Cancel anytime',
        'Premium customer support'
      ],
      badge: 'Most Popular',
      popular: true,
      cta: 'Payment'
    }
  ];

  const handlePlanSelection = async () => {
    setLoading(true);
    
    try {
      // Only monthly plan is available now
      const stripePlan = 'monthly';

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
      // Fallback to email confirmation page if payment fails
      navigate('/signup-success', { state: { email } });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // User chose free membership, redirect to email confirmation
    navigate('/signup-success', { state: { email } });
  };

  return (
    <div className="min-h-screen overflow-y-auto flex flex-col items-center justify-center px-4 py-8" style={{ backgroundColor: '#0F1D0E' }}>
      <div className="w-full max-w-2xl animate-fade-in">

        {/* Logo top-left */}
        <img
          src="https://uhkksexuecjfzmgdbwax.supabase.co/storage/v1/object/public/logo//SCR-20250716-knzf.png"
          alt="Nomas Club logo"
          className="absolute top-4 left-4 h-10 w-auto select-none"
        />

        {/* Welcome Message */}
        <div className="mb-8 text-center pt-16">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 text-white">
            Welcome, {firstName}!
          </h1>
          <p className="text-xl text-gray-200 max-w-md mx-auto mb-2">
            Choose the perfect membership to unlock your potential
          </p>
          <p className="text-sm text-gray-300">
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
                "hover:border-green-400 hover:shadow-lg hover:scale-[1.02]",
                selectedPlan === plan.id
                  ? "border-green-400 bg-green-900/30 shadow-lg"
                  : "border-gray-600 bg-gray-800/30 hover:bg-green-900/20"
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
                  <h3 className="text-xl font-bold mb-1 text-white">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-300 mb-2">
                    {plan.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-400">
                    {plan.price}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-200">
                    <div className="h-2 w-2 rounded-full bg-green-400 flex-shrink-0"></div>
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
            onClick={handlePlanSelection}
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
            className="w-full text-gray-300 hover:text-white hover:bg-gray-700/30"
          >
            Continue as a free member
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 mb-2">
            Secure payment • 30-day money-back guarantee • Cancel anytime
          </p>
          <div className="flex justify-center items-center gap-4 text-xs text-gray-400">
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