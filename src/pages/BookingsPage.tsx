import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Clock, Download } from 'lucide-react';
import { format } from 'date-fns';
import Layout from '@/components/Layout';

interface Booking {
  id: string;
  status: string;
  created_at: string;
  event: {
    id: string;
    title: string;
    description: string;
    type: string;
    date: string;
    duration_minutes: number;
    location: string;
  };
}

const BookingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          created_at,
          event:events (
            id,
            title,
            description,
            type,
            date,
            duration_minutes,
            location
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type assertion to handle Supabase's response structure
      const typedData = data as any[];
      const formattedBookings: Booking[] = typedData.map(item => ({
        id: item.id,
        status: item.status,
        created_at: item.created_at,
        event: item.event
      }));

      setBookings(formattedBookings);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      const booking = bookings.find(b => b.id === bookingId);
      const isWaitlisted = booking?.status === 'waitlisted';
      
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      // Remove from local state
      setBookings(bookings.filter(b => b.id !== bookingId));
      
      // Show appropriate success message
      if (isWaitlisted) {
        toast.success('Removed from waitlist');
      } else {
        toast.success('Booking cancelled successfully');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel booking');
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const generateCalendarLink = (event: Booking['event']) => {
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + event.duration_minutes * 60000);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const details = encodeURIComponent(event.description);
    const location = encodeURIComponent(event.location);
    const title = encodeURIComponent(event.title);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${details}&location=${location}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'run': return '🏃';
      case 'pilates': return '🧘';
      case 'padel': return '🎾';
      case 'event': return '🎉';
      default: return '📅';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const upcomingBookings = bookings.filter(b => new Date(b.event.date) >= new Date() && b.status === 'confirmed');
  const waitlistedBookings = bookings.filter(b => new Date(b.event.date) >= new Date() && b.status === 'waitlisted');
  const pastBookings = bookings.filter(b => new Date(b.event.date) < new Date());

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <Button onClick={() => navigate('/events')}>
              Browse Events
            </Button>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {bookings.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">You haven't booked any activities yet.</p>
                <Button onClick={() => navigate('/events')}>
                  Explore Activities
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Upcoming Bookings */}
              {upcomingBookings.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Upcoming Activities</h2>
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl flex items-center gap-2">
                                <span className="text-2xl">{getTypeIcon(booking.event.type)}</span>
                                {booking.event.title}
                              </CardTitle>
                              <CardDescription className="mt-2 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  {format(new Date(booking.event.date), 'EEEE, MMMM d, yyyy')}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  {format(new Date(booking.event.date), 'h:mm a')} ({booking.event.duration_minutes} min)
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {booking.event.location}
                                </div>
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Confirmed
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {booking.event.description}
                          </p>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(generateCalendarLink(booking.event), '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Add to Calendar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={cancellingId === booking.id}
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Waitlisted Bookings */}
              {waitlistedBookings.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Waitlisted Activities</h2>
                  <div className="space-y-4">
                    {waitlistedBookings.map((booking) => (
                      <Card key={booking.id} className="border-orange-200 bg-orange-50/50">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl flex items-center gap-2">
                                <span className="text-2xl">{getTypeIcon(booking.event.type)}</span>
                                {booking.event.title}
                              </CardTitle>
                              <CardDescription className="mt-2 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  {format(new Date(booking.event.date), 'EEEE, MMMM d, yyyy')}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  {format(new Date(booking.event.date), 'h:mm a')} ({booking.event.duration_minutes} min)
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {booking.event.location}
                                </div>
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                              Waitlisted
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            {booking.event.description}
                          </p>
                          <p className="text-sm text-orange-700 font-medium">
                            You'll be notified if a spot becomes available.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={cancellingId === booking.id}
                            onClick={() => handleCancelBooking(booking.id)}
                            className="border-orange-300 hover:bg-orange-100"
                          >
                            {cancellingId === booking.id ? 'Leaving...' : 'Leave Waitlist'}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Bookings */}
              {pastBookings.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Past Activities</h2>
                  <div className="space-y-4">
                    {pastBookings.map((booking) => (
                      <Card key={booking.id} className="opacity-60">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg flex items-center gap-2">
                                <span>{getTypeIcon(booking.event.type)}</span>
                                {booking.event.title}
                              </CardTitle>
                              <CardDescription>
                                {format(new Date(booking.event.date), 'PPP')}
                              </CardDescription>
                            </div>
                            <Badge variant="secondary">Completed</Badge>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BookingsPage; 