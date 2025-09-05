import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface MembershipCardProps {
  isPremiumMember: boolean;
  membershipDisplayName: string;
  onSubscribe: (plan: string) => void;
  onManageSubscription: () => void;
  loading?: boolean;
}

const PREMIUM_FEATURES = [
  {
    title: 'Private Expert Community',
    description: 'A private community of experts in business, trading, fitness, travel & content creation'
  },
  {
    title: 'Exclusive Monthly Events',
    description: 'Exclusive monthly events hosted by The Nomas Club'
  },
  {
    title: 'Special Perks & Discounts',
    description: 'Special perks & discounts across Bali: coffee shops, gyms, restaurants, nightlife & more'
  },
  {
    title: 'Business Networking',
    description: 'Business events that connect you to the right people'
  },
  {
    title: 'Priority Access',
    description: 'Get priority booking for all events and activities'
  },
  {
    title: 'Premium Support',
    description: 'Direct access to our concierge service for personalized assistance'
  }
];

export const MembershipCard: React.FC<MembershipCardProps> = ({
  isPremiumMember,
  membershipDisplayName,
  onSubscribe,
  onManageSubscription,
  loading = false
}) => {
  return (
    <Card className="w-full glass border-primary/20 shadow-xl animate-scale-in">
      <div className="relative overflow-hidden">
        {/* Premium Status Indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-primary"></div>

        <CardHeader className="text-center pb-6">
          <div className="space-y-3">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {isPremiumMember ? membershipDisplayName : 'Premium Membership'}
            </CardTitle>
            <CardDescription className="text-lg text-foreground/70">
              {isPremiumMember 
                ? 'Enjoy unlimited access to all premium features and exclusive benefits'
                : 'Unlock an elevated experience with comprehensive access to our community and exclusive perks'
              }
            </CardDescription>
            {isPremiumMember && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-medium">
                Active Premium Member
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Premium Features Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {isPremiumMember ? 'Your Premium Benefits' : 'What You Get'}
              </h3>
              <p className="text-sm text-foreground/70">
                Comprehensive access to everything we offer
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PREMIUM_FEATURES.map((feature, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-xl bg-muted/30 border border-primary/10 hover:border-primary/20 transition-all duration-200"
                >
                  <h4 className="font-semibold text-foreground mb-2 text-sm">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-primary/20" />

          {isPremiumMember ? (
            /* Premium Member Management Section */
            <div className="space-y-6 text-center">
              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Membership Management
                </h4>
                <p className="text-sm text-foreground/70 mb-4">
                  Manage your subscription, update payment methods, and view billing history
                </p>
                <Button 
                  variant="outline"
                  onClick={onManageSubscription}
                  disabled={loading}
                  className="border-primary/30 hover:bg-primary/10 hover:border-primary/50"
                  size="lg"
                >
                  {loading ? 'Loading...' : 'Manage Subscription'}
                </Button>
              </div>
            </div>
          ) : (
            /* Upgrade Section */
            <div className="space-y-6">
              {/* Pricing Display */}
              <div className="text-center space-y-4">
                <h4 className="text-xl font-semibold text-foreground">
                  Start Your Premium Journey
                </h4>
                <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/15 border-2 border-primary/20">
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-primary">£50</span>
                      <span className="text-lg text-muted-foreground">per month</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="text-center space-y-4">
                <Button 
                  onClick={() => onSubscribe('monthly')}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                  size="lg"
                >
                  {loading ? 'Processing...' : 'Upgrade to Premium'}
                </Button>
                <p className="text-xs text-foreground/70">
                  Start your premium experience today with full access to all features
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}; 