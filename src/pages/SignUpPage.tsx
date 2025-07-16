import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, ArrowRight, Calendar, Upload, X, User, Eye, EyeOff } from 'lucide-react';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePicturePreview('');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Production authentication flow

      let profilePictureUrl = '';

      // Upload profile picture to Supabase Storage if provided
      if (profilePicture) {
        try {
          const fileExt = profilePicture.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `profile-pictures/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, profilePicture);

          if (uploadError) {
            console.warn('Profile picture upload failed:', uploadError);
            // Continue with signup even if upload fails
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath);
            profilePictureUrl = publicUrl;
          }
        } catch (error) {
          console.warn('Profile picture upload error:', error);
          // Continue with signup even if upload fails
        }
      }

      // Sign up the user (with email confirmation disabled)
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
          data: {
            profile_picture: profilePictureUrl || null,
            date_of_birth: dateOfBirth,
            display_name: firstName,
          },
        },
      });

      if (signUpError) {
        console.error('Signup error details:', signUpError);
        throw signUpError;
      }

      // Redirect to membership selection page
      // Get user ID and redirect to membership selection
      const userId = authData?.user?.id;
      navigate('/membership-selection', { state: { email, firstName, userId } });
    } catch (error: any) {
      console.error('Full signup error:', error);
      
      // Provide more specific error messages
      let userFriendlyMessage = error.message;
      
      if (error.message?.includes('already registered')) {
        userFriendlyMessage = 'An account with this email already exists. Please try logging in instead.';
      } else if (error.message?.includes('Password')) {
        userFriendlyMessage = 'Password is too weak. Please include uppercase, lowercase, and numbers.';
      } else if (error.message?.includes('database')) {
        userFriendlyMessage = 'Database connection issue. Please try again in a moment.';
      } else if (error.message?.includes('Invalid input')) {
        userFriendlyMessage = 'Please check all fields are filled correctly.';
      }
      
      setError(userFriendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm animate-fade-in">

        {/* Logo top-left */}
        <img
          src="https://uhkksexuecjfzmgdbwax.supabase.co/storage/v1/object/public/logo//SCR-20250716-knzf.png"
          alt="Nomas Club logo"
          className="absolute top-4 left-4 h-10 w-auto select-none"
        />

        {/* Heading */}
        <div className="mb-6 text-center pt-16">
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight mb-2">
            Sign up
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Join Nomas and transform your fitness journey
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-3 pt-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md animate-slide-down">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="first-name"
                type="text"
                placeholder="Your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Include uppercase, lowercase, and numbers for security
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-picture">Profile Picture</Label>
            <div className="relative">
              {!profilePicturePreview ? (
                <label 
                  htmlFor="profile-picture"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                  </div>
                  <input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative flex justify-center">
                  <img
                    src={profilePicturePreview}
                    alt="Profile preview"
                    className="w-32 h-32 object-cover rounded-full border-4 border-muted"
                  />
                  <button
                    type="button"
                    onClick={removeProfilePicture}
                    className="absolute -top-1 -right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Optional: Upload a profile picture from your device
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-of-birth">Date of Birth</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="date-of-birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              You must be 18 or older to join
            </p>
          </div>



          <div className="flex flex-col space-y-3 pb-4">
            <Button
              type="submit"
              className="w-full h-[40px] group mt-2"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                'Creating account...'
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
            
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage; 