import { useLocation, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, CreditCard, Crown } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

const SignupSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const state = location.state as { email?: string; firstName?: string; userId?: string } | null;
  const email = state?.email ?? 'your email';
  const firstName = state?.firstName ?? '';
  const userId = state?.userId;
  const paymentStatus = searchParams.get('payment');

  const handleUpgradeNow = () => {
    if (userId) {
      navigate('/membership-selection', { 
        state: { email, firstName, userId } 
      });
    }
  };

  // Handle payment success from Stripe
  useEffect(() => {
    if (paymentStatus === 'success') {
      toast.success('Payment successful! Please check your email to confirm your account.');
      
      // Clear the payment parameter from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('payment');
      setSearchParams(newParams);
    }
  }, [paymentStatus, searchParams, setSearchParams]);

  return (
    <div className="h-screen overflow-hidden flex flex-col items-center justify-center bg-background px-4 overscroll-none">
      <div className="w-full max-w-sm animate-fade-in text-center space-y-6">
        {paymentStatus === 'success' ? (
          <>
            <CreditCard className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="text-4xl font-bold">Payment Successful!</h1>
            <p className="text-muted-foreground text-lg">
              Your membership has been activated! We've sent a confirmation link to <span className="font-medium">{email}</span>.
              <br />Please check your inbox and click the link to complete your account setup.
            </p>
          </>
        ) : (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="text-4xl font-bold">Confirm your email</h1>
            <p className="text-muted-foreground text-lg">
              We've sent a confirmation link to <span className="font-medium">{email}</span>.
              <br />Please check your inbox and click the link to activate your account.
            </p>
          </>
        )}
        
        {/* Action buttons */}
        <div className="space-y-3">
          {userId && !paymentStatus && (
            <Button 
              onClick={handleUpgradeNow}
              size="lg" 
              className="w-full h-[40px] bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <Crown className="h-4 w-4 mr-2" /> Upgrade to Premium
            </Button>
          )}
          
          <Button asChild size="lg" variant="outline" className="w-full h-[40px]">
            <Link to="/login">
              <Mail className="h-4 w-4 mr-2" /> Sign In
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignupSuccessPage; 