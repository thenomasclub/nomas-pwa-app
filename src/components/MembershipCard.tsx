import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, CreditCard, Check, Star, Zap, Calendar, Users, Shield } from 'lucide-react';

interface MembershipCardProps {
  isPremiumMember: boolean;
  membershipDisplayName: string;
  onSubscribe: (plan: string) => void;
  onManageSubscription: () => void;
  loading?: boolean;
}

const PREMIUM_FEATURES = [
  { icon: Calendar, text: 'Complimentary access to all member-only events' },
  { icon: Users, text: '1 free padel session per month' },
  { icon: Star, text: 'Monthly Founders Dinner' },
  { icon: Shield, text: 'Bi-weekly Nomas Minds talk series' },
];

export const MembershipCard: React.FC<MembershipCardProps> = ({
  isPremiumMember,
  membershipDisplayName,
  onSubscribe,
  onManageSubscription,
  loading = false
}) => {
  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
      <div className="relative">
        {/* Premium Badge */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
            <Crown className="h-3 w-3 mr-1" />
            Premium Membership
          </Badge>
        </div>

        <CardHeader className="text-center pt-8 pb-4">
          <CardTitle className="text-xl font-bold text-green-900 dark:text-green-100">
            {isPremiumMember ? (
              <>
                <Crown className="h-5 w-5 inline mr-2 text-green-600" />
                {membershipDisplayName}
              </>
            ) : (
              'Upgrade to Premium'
            )}
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            {isPremiumMember 
              ? 'You have access to all premium features'
              : 'Unlock exclusive features and priority access'
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

              {/* Monthly Plan Display */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                  Monthly Premium Plan
                </h4>
                <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-[#152B14] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-lg">Monthly</div>
                      <div className="text-sm text-muted-foreground">Flexible month-to-month</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#152B14]">£50</div>
                      <div className="text-xs text-muted-foreground">per month</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                </div>

                {/* Upgrade Button */}
                <Button 
                  onClick={() => onSubscribe('monthly')}
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