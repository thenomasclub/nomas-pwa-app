import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { House, Calendar, UserCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const location = useLocation();
  const { user } = useAuthStore();

  if (!user) return null;

  const navItems = [
    { path: '/home', label: 'Home', icon: House },
    { path: '/bookings', label: 'Bookings', icon: Calendar },
    { path: '/profile', label: 'Profile', icon: UserCircle2 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="px-6 pb-6 pt-2">
        <div className="bg-background/90 backdrop-blur-xl border border-primary/15 rounded-2xl shadow-2xl mx-auto max-w-xs">
          <div className="flex justify-around px-2 py-3 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path} className="relative flex-1">
                <div className="relative px-3 py-3 flex flex-col items-center gap-1">
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/15 rounded-xl border border-primary/25 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out" />
                  )}
                  <Icon className={cn(
                    "h-6 w-6 relative z-10 transition-all duration-300 ease-out",
                    isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
                  )} />
                  <span className={cn(
                    "text-xs relative z-10 transition-all duration-300 ease-out font-medium",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 