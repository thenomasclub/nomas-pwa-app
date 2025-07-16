import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps {
  isPremium: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PremiumBadge = ({ isPremium, size = 'md', className }: PremiumBadgeProps) => {
  if (!isPremium) return null;

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const iconSizes = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5'
  };

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-blue-500 text-white',
        sizeClasses[size],
        className
      )}
      title="Premium Member"
    >
      <Check className={cn('stroke-[3]', iconSizes[size])} />
    </div>
  );
}; 