import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  if (!user) return null;

  const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/bookings', label: 'Bookings', icon: BookOpen },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t md:relative md:border-t-0 md:border-b z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex justify-around md:justify-start md:gap-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'flex flex-col md:flex-row gap-1 h-auto py-2 px-3 md:px-4 relative transition-all',
                    isActive && 'text-primary'
                  )}
                >
                  {isActive && (
                    <>
                      <div className="absolute inset-0 bg-primary/10 rounded-md" />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full md:hidden" />
                    </>
                  )}
                  <Icon className={cn(
                    "h-5 w-5 relative z-10 transition-transform",
                    isActive && "scale-110"
                  )} />
                  <span className={cn(
                    "text-xs md:text-sm relative z-10",
                    isActive ? "font-medium" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 