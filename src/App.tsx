import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useMembership } from '@/hooks/useMembership';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import InstallPrompt from '@/components/InstallPrompt';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Eager load core pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import SignupSuccessPage from '@/pages/SignupSuccessPage';
import MembershipSelectionPage from '@/pages/MembershipSelectionPage';
import EventsPage from '@/pages/EventsPage';
import BookingsPage from '@/pages/BookingsPage';
import UpdatePasswordPage from '@/pages/UpdatePasswordPage';

// Lazy load less frequently used pages
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Auth handler component to manage first-time user redirects
const AuthHandler = () => {
  const { user } = useAuthStore();
  const { membershipTier, loading: membershipLoading } = useMembership();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user || membershipLoading) return;

    // Check if user has completed onboarding before
    const onboardingKey = `onboarding_completed_${user.id}`;
    const hasCompletedOnboarding = localStorage.getItem(onboardingKey) === 'true';

    // Only redirect if:
    // 1. User is logged in
    // 2. User has free tier 
    // 3. User has NOT completed onboarding before (first time)
    // 4. Not already on membership, signup, or home pages
    if (
      user && 
      !membershipLoading && 
      membershipTier === 'free' && 
      !hasCompletedOnboarding &&
      !location.pathname.includes('/membership') &&
      !location.pathname.includes('/signup') &&
      location.pathname !== '/' && // Don't redirect from homepage
      location.pathname !== '/home' // Don't redirect from events page
    ) {
      console.log('Redirecting first-time user to membership selection');
      navigate('/membership-selection', { 
        state: { 
          email: user.email, 
          firstName: user.user_metadata?.display_name || user.email?.split('@')[0],
          userId: user.id,
          isFirstTime: true
        } 
      });
    }
  }, [user, membershipTier, membershipLoading, navigate, location.pathname]);

  return null; // This component doesn't render anything
};

function App() {
  const { setUser, setSession, setLoading } = useAuthStore();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setLoading]);

  return (
    <Router>
      <Toaster 
        position="top-center"
        richColors
        closeButton
      />
      <Analytics />
      <InstallPrompt />
      <AuthHandler />
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/membership-selection" element={<MembershipSelectionPage />} />
        <Route path="/signup-success" element={<SignupSuccessPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        {/* Legacy dashboard redirect */}
        <Route path="/dashboard" element={<Navigate to="/home" />} />
        {/* Legacy fallback route */}
        <Route path="/events" element={<Navigate to="/home" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
