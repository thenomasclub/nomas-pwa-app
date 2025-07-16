import Navigation from '@/components/Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen pb-16 md:pb-0 relative">
              <img
          src="https://uhkksexuecjfzmgdbwax.supabase.co/storage/v1/object/public/logo//SCR-20250716-knzf.png"
          alt="Nomas Club logo"
        className="absolute top-4 left-4 h-10 w-auto z-50 select-none"
      />
      <Navigation />
      <main className="pt-20">{children}</main>
    </div>
  );
};

export default Layout; 