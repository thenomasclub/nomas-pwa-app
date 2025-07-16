import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden overscroll-none bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="relative flex-1 flex items-end justify-start overflow-hidden px-6 pb-10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        {/* Logo */}
                  <img
            src="https://uhkksexuecjfzmgdbwax.supabase.co/storage/v1/object/public/logo//SCR-20250716-knzf.png"
            alt="Nomas Club logo"
          className="absolute top-6 left-6 h-20 w-auto"
        />
        <div className="relative max-w-4xl animate-fade-in">
          {/* Main Heading */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-0">
            Nomas Club
          </h1>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-primary/90 mt-2">
            Connect. Create. Thrive.
          </h2>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mt-4">
            Your gateway to Bali's best experiences and an inspiring community.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 mt-6">
            <Button asChild size="lg" className="group w-[382px] h-[40px]">
              <Link to="/login">
                Sign in
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="group w-[382px] h-[40px]">
              <Link to="/signup">
                Sign up
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 