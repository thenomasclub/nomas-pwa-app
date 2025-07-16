import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, CreditCard, Check, Star, Zap, Calendar, Users, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MembershipCardProps {
  isPremiumMember: boolean;
  membershipDisplayName: string;
  onSubscribe: (plan: string) => void;
  onManageSubscription: () => void;
  loading?: boolean;
}

const PLAN_OPTIONS = [
  {
    id: 'monthly',
    duration: '1 Month',
    popular: false,
    savings: null,
  },
  {
    id: 'quarterly', 
    duration: '3 Months',
    popular: true,
    savings: 'Save 15%',
  },
  {
    id: 'semiannual',
    duration: '6 Months', 
    popular: false,
    savings: 'Save 25%',
  },
];

const PREMIUM_FEATURES = [
  { icon: Calendar, text: 'Priority booking access' },
  { icon: Star, text: 'Exclusive premium events' },
  { icon: Users, text: 'VIP member community' },
  { icon: Shield, text: 'Advanced booking protection' },
];

export const MembershipCard: React.FC<MembershipCardProps> = ({
  isPremiumMember,
  membershipDisplayName,
  onSubscribe,
  onManageSubscription,
  loading = false
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('quarterly');

  return (
    <Card className="relative overflow-hidden">
      {/* Premium gradient background for premium members */}
      {isPremiumMember && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20" />
      )}
      
      <div className="relative">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Crown className={cn(
                "h-5 w-5",
                isPremiumMember ? "text-yellow-500" : "text-muted-foreground"
              )} />
              Membership
            </CardTitle>
            <Badge 
              variant={isPremiumMember ? "default" : "secondary"}
              className={cn(
                "font-medium",
                isPremiumMember && "bg-gradient-to-r from-green-600 to-green-700 text-white"
              )}
            >
              {membershipDisplayName}
            </Badge>
          </div>
          <CardDescription>
            {isPremiumMember 
              ? "Enjoy all the benefits of your premium membership"
              : "Unlock exclusive features and priority access"
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {isPremiumMember ? (
            /* Premium Member Section */
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                <Check className="h-4 w-4" />
                Premium Active
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {PREMIUM_FEATURES.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <feature.icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-muted-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-center">
                <Button 
                  variant="outline"
                  onClick={onManageSubscription}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  <CreditCard className="h-4 w-4" />
                  Manage Subscription
                </Button>
              </div>
            </div>
          ) : (
            /* Free Member Upgrade Section */
            <div className="space-y-6">
              {/* Features Preview */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                  Premium Benefits
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PREMIUM_FEATURES.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <feature.icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Plan Selection */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                  Choose Your Plan
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PLAN_OPTIONS.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={cn(
                        "relative p-4 rounded-lg border-2 transition-all text-left",
                        "hover:border-green-200 hover:bg-green-50/50 dark:hover:bg-green-950/20",
                        selectedPlan === plan.id
                          ? "border-[#152B14] !bg-[#152B14] text-white dark:!bg-[#152B14]"
                          : "border-border bg-background"
                      )}
                    >
                      {plan.popular && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <div className="font-medium">{plan.duration}</div>
                        {plan.savings && (
                          <div className={cn(
                            "text-xs font-medium",
                            selectedPlan === plan.id 
                              ? "text-green-200" 
                              : "text-green-600 dark:text-green-400"
                          )}>
                            {plan.savings}
                          </div>
                        )}
                      </div>
                      
                      {selectedPlan === plan.id && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Upgrade Button */}
                <Button 
                  onClick={() => onSubscribe(selectedPlan)}
                  disabled={loading}
                  className="w-full bg-[#142B13] hover:bg-[#0f1c0e] text-white shadow-lg"
                  size="lg"
                >
                  <Zap className="h-4 w-4" />
                  {loading ? 'Processing...' : 'Upgrade to Premium'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Cancel anytime. No commitment required.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}; 