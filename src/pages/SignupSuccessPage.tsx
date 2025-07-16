import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail } from 'lucide-react';

const SignupSuccessPage = () => {
  const location = useLocation();
  const state = location.state as { email?: string } | null;
  const email = state?.email ?? 'your email';

  return (
    <div className="h-screen overflow-hidden flex flex-col items-center justify-center bg-background px-4 overscroll-none">
      <div className="w-full max-w-sm animate-fade-in text-center space-y-6">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-4xl font-bold">Confirm your email</h1>
        <p className="text-muted-foreground text-lg">
          We've sent a confirmation link to <span className="font-medium">{email}</span>.
          <br />Please check your inbox and click the link to activate your account.
        </p>
        <Button asChild size="lg" className="w-full h-[40px]">
          <Link to="/login">
            <Mail className="h-4 w-4 mr-2" /> Go to Login
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default SignupSuccessPage; 