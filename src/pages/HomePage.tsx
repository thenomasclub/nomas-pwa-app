import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      {/* Main Content Container - Full height with centered content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 relative">
        
        {/* Logo - Centered at top on mobile */}
        <div className="mb-8 sm:mb-12">
          <img
            src="https://uhkksexuecjfzmgdbwax.supabase.co/storage/v1/object/public/logo//SCR-20250716-knzf.png"
            alt="Nomas Club logo"
            className="h-16 sm:h-20 w-auto mx-auto"
          />
        </div>

        {/* Content Section - Centered */}
        <div className="text-center max-w-4xl w-full animate-fade-in">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2 sm:mb-4">
            Nomas Club
          </h1>
          
          {/* Subtitle */}
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary/90 mb-4 sm:mb-6">
            Connect. Create. Thrive.
          </h2>
          
          {/* Description */}
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
            Your gateway to Bali's best experiences and an inspiring community.
          </p>
          
          {/* CTA Buttons - Responsive width */}
          <div className="flex flex-col gap-3 sm:gap-4 items-center mb-12">
            <Button 
              asChild 
              size="lg" 
              className="group w-full max-w-sm h-12 sm:h-14 text-base sm:text-lg"
            >
              <Link to="/login">
                Sign in
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="group w-full max-w-sm h-12 sm:h-14 text-base sm:text-lg"
            >
              <Link to="/signup">
                Sign up
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 