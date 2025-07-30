import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CreditCard, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  amount: number;
  currency: string;
  clientSecret: string;
  onSuccess: () => void;
}

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  eventTitle, 
  amount, 
  currency, 
  clientSecret, 
  onSuccess 
}: PaymentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);

  useEffect(() => {
    // Load Stripe
    const loadStripe = async () => {
      const { loadStripe } = await import('@stripe/stripe-js');
      const stripeInstance = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      setStripe(stripeInstance);
    };
    
    if (isOpen) {
      loadStripe();
    }
  }, [isOpen]);

  useEffect(() => {
    if (stripe && clientSecret && isOpen) {
      const elementsInstance = stripe.elements({
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#142B13',
          },
        },
      });
      setElements(elementsInstance);
    }
  }, [stripe, clientSecret, isOpen]);

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
      } else {
        setPaymentSuccess(true);
        toast.success('Payment successful!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {paymentSuccess ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="text-lg font-semibold">Payment Successful!</h3>
              <p className="text-muted-foreground">
                Your booking for "{eventTitle}" has been confirmed.
              </p>
            </div>
          ) : (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">{eventTitle}</h4>
                    <p className="text-2xl font-bold text-primary">
                      {formatAmount(amount, currency)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Enter your payment details below to complete your booking.
                </div>

                <div id="payment-element" className="min-h-[200px]">
                  {/* Stripe Elements will be mounted here */}
                </div>

                <Button 
                  onClick={handlePayment} 
                  disabled={loading || !stripe}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay {formatAmount(amount, currency)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Your payment is secure and encrypted. We use Stripe for payment processing.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal; 