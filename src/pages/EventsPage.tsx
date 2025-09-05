import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useMembership } from '@/hooks/useMembership';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PremiumBadge } from '@/components/ui/premium-badge';
import { Calendar, MapPin, Clock, Users, Filter, Search, X, ArrowLeft, Menu, DollarSign } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import EventParticipants from '@/components/EventParticipants';
import PaymentModal from '@/components/PaymentModal';

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'run' | 'pilates' | 'padel' | 'event';
  date: string;
  duration_minutes: number;
  location: string;
  max_slots: number;
  is_featured: boolean;
  is_free: boolean;
  price_cents: number;
  pricing_note?: string;
  bookings_count?: number;
  is_booked?: boolean;
  booking_status?: string | null;
  payment_status?: string;
  image_url?: string | null;
}

// Helper to determine if a hex color is perceived as dark
const isColorDark = (hex: string): boolean => {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);
  // Perceived brightness formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 140; // threshold – tweak as needed
};

// Shared color palette for activity types
const typeColors: Record<string, string> = {
  run: '#888268',
  padel: '#142B14',
  event: '#A37D4F',
  pilates: '#F5BAC9',
};

const EventsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { isPremiumMember, isSubscriptionHealthy } = useMembership();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get('type') || 'all');
  const [dateFilter, setDateFilter] = useState<string>('upcoming');
  const [pricingFilter, setPricingFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const eventId = searchParams.get('id');

  const formatIDR = (val: number) => {
    // Ensure proper formatting for Indonesian Rupiah
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(val);
  };

  // Determine if any filter is active or panel is open
  const isFilterActive = [
    typeFilter !== 'all',
    dateFilter !== 'upcoming',
    pricingFilter !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length > 0 || showFilters;

  useEffect(() => {
    fetchEvents();
  }, [typeFilter, dateFilter, pricingFilter, user, eventId]);



  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // If we have an event ID, fetch just that event
      if (eventId) {
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            bookings!left(count)
          `)
          .eq('id', eventId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          // Get confirmed bookings count
          const { data: confirmedCounts } = await supabase
            .from('bookings')
            .select('event_id')
            .eq('status', 'confirmed')
            .eq('event_id', data.id);
          
          const bookingCount = confirmedCounts?.length || 0;
          
          // Check if user has booked this event
          let userBooking = null;
          if (user) {
            const { data: userBookingData } = await supabase
              .from('bookings')
              .select('status')
              .eq('user_id', user.id)
              .eq('event_id', data.id)
              .single();
            
            userBooking = userBookingData;
          }
          
          const eventWithBookingStatus = {
            ...data,
            bookings_count: bookingCount,
            is_booked: !!userBooking,
            booking_status: userBooking?.status || null
          };
          
          setEvents([eventWithBookingStatus]);
          setSelectedEvent(eventWithBookingStatus);
          return;
        }
      }
      
      // Otherwise fetch all events with filters
      // Note: Sorting is handled client-side to ensure upcoming events appear first, then past events
      let query = supabase
        .from('events')
        .select(`
          *,
          bookings!left(count)
        `);

      // Apply type filter
      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }

      // Apply date filter
      const now = new Date();
      if (dateFilter === 'upcoming') {
        query = query.gte('date', now.toISOString());
      } else if (dateFilter === 'past') {
        query = query.lt('date', now.toISOString());
      } else if (dateFilter === 'this-week') {
        query = query.gte('date', startOfWeek(now).toISOString())
                     .lte('date', endOfWeek(now).toISOString());
      } else if (dateFilter === 'this-month') {
        query = query.gte('date', startOfMonth(now).toISOString())
                     .lte('date', endOfMonth(now).toISOString());
      }
      // Note: 'all' filter doesn't add any date constraints, showing both upcoming and past events

      // Apply pricing filter
      if (pricingFilter === 'free') {
        query = query.eq('is_free', true);
      } else if (pricingFilter === 'paying') {
        query = query.eq('is_free', false);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get confirmed bookings count for each event
      if (data) {
        const eventIds = data.map(event => event.id);
        
        // Get confirmed bookings count
        const { data: confirmedCounts } = await supabase
          .from('bookings')
          .select('event_id')
          .eq('status', 'confirmed')
          .eq('event_id', eventIds);

        // Count bookings per event
        const bookingCounts = confirmedCounts?.reduce((acc, booking) => {
          acc[booking.event_id] = (acc[booking.event_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        // Check if user has booked each event
        let userBookings: any[] = [];
        if (user) {
          const { data: userBookingData } = await supabase
            .from('bookings')
            .select('event_id, status')
            .eq('user_id', user.id)
            .in('event_id', eventIds);
          
          userBookings = userBookingData || [];
        }

        const userBookingMap = userBookings.reduce((acc, booking) => {
          acc[booking.event_id] = booking.status;
          return acc;
        }, {} as Record<string, string>);

        const eventsWithBookingStatus = data.map(event => ({
          ...event,
          bookings_count: bookingCounts[event.id] || 0,
          is_booked: !!userBookingMap[event.id],
          booking_status: userBookingMap[event.id] || null
        }));

        setEvents(eventsWithBookingStatus);
        setSelectedEvent(null);
      } else {
        setEvents([]);
        setSelectedEvent(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (eventId: string, isBooked: boolean) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setBookingLoading(eventId);
    try {
      if (isBooked) {
        // Cancel booking
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);

        if (error) throw error;

        toast.success('Booking cancelled successfully');
      } else {
        // Get event details
        const event = events.find(e => e.id === eventId);
        if (!event) throw new Error('Event not found');

        // Check if user is premium member
        const hasActivePremium = isPremiumMember && isSubscriptionHealthy;

        // Check if event requires payment for this user
        const requiresPayment = !event.is_free && !hasActivePremium;

        if (requiresPayment) {
          // Create payment intent
          try {
            const response = await supabase.functions.invoke('create-event-payment', {
              body: { eventId, userId: user.id }
            });

            if (response.error) {
              throw new Error(response.error.message);
            }

            const { client_secret, amount, event_title, currency } = response.data;
            
            // Open payment modal
            setPaymentData({
              clientSecret: client_secret,
              amount,
              eventTitle: event_title,
              currency: currency || 'idr'
            });
            setShowPaymentModal(true);
            
          } catch (paymentError: any) {
            if (paymentError.message.includes('Premium members get free access')) {
              toast.error('You already have premium access to all events');
            } else if (paymentError.message.includes('already has a booking')) {
              toast.error('You already have a booking for this event');
            } else {
              toast.error(paymentError.message || 'Payment setup failed');
            }
            return;
          }
        } else {
          // Free booking for premium members or free events
          const isFullyBooked = (event.bookings_count || 0) >= event.max_slots;
          
          // Create booking with appropriate status
          const { error } = await supabase
            .from('bookings')
            .insert({
              user_id: user.id,
              event_id: eventId,
              status: isFullyBooked ? 'waitlisted' : 'confirmed',
              payment_status: requiresPayment ? 'pending' : 'not_required'
            });

          if (error) throw error;

          // Show appropriate success message
          if (isFullyBooked) {
            toast.success('Added to waitlist! You\'ll be notified if a spot opens up.');
          } else {
            toast.success('Booking confirmed! Check your Bookings page for event details and updates.', {
              action: {
                label: 'View Bookings',
                onClick: () => navigate('/bookings')
              }
            });
          }
        }
      }

      // Refresh events
      await fetchEvents();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
      setError(err.message);
    } finally {
      setBookingLoading(null);
    }
  };

  const handlePaymentSuccess = async () => {
    toast.success('Payment successful! Your booking has been confirmed.', {
      action: {
        label: 'View Bookings',
        onClick: () => navigate('/bookings')
      }
    });
    await fetchEvents();
  };

  // Icons and gradients by type removed; styling handled via image/background only.

  // Enhanced search and filter functionality
  const filteredEvents = events.filter(event => {
    // Apply search filter with enhanced search capabilities
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const searchTerms = searchLower.split(' ').filter(term => term.length > 0);
      
      // Check if all search terms match any field
      const matchesSearch = searchTerms.every(term => {
        return (
          event.title.toLowerCase().includes(term) ||
          event.description.toLowerCase().includes(term) ||
          event.location.toLowerCase().includes(term) ||
          event.type.toLowerCase().includes(term) ||
          (event.pricing_note && event.pricing_note.toLowerCase().includes(term)) ||
          // Search in formatted date
          format(new Date(event.date), 'EEEE, MMMM d, yyyy').toLowerCase().includes(term) ||
          format(new Date(event.date), 'h:mm a').toLowerCase().includes(term)
        );
      });
      
      if (!matchesSearch) {
        return false;
      }
    }
    
    // Apply pricing filter client-side
    if (pricingFilter === 'free') {
      return event.is_free || event.price_cents === 0;
    }
    if (pricingFilter === 'paying') {
      return !event.is_free && event.price_cents > 0;
    }
    return true; // 'all'
  }).sort((a, b) => {
    const now = new Date();
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    // Separate upcoming and past events
    const aIsUpcoming = dateA >= now;
    const bIsUpcoming = dateB >= now;
    
    // If one is upcoming and other is past, upcoming comes first
    if (aIsUpcoming && !bIsUpcoming) return -1;
    if (!aIsUpcoming && bIsUpcoming) return 1;
    
    // Both are upcoming: sort by date ascending (earliest first)
    if (aIsUpcoming && bIsUpcoming) {
      return dateA.getTime() - dateB.getTime();
    }
    
    // Both are past: sort by date descending (most recent first)
    return dateB.getTime() - dateA.getTime();
  });

  const clearFilters = () => {
    setTypeFilter('all');
    setDateFilter('upcoming');
    setPricingFilter('all');
    setSearchTerm('');
    setSearchParams({});
  };

  const activeFiltersCount = [
    typeFilter !== 'all',
    dateFilter !== 'upcoming',
    pricingFilter !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <Skeleton className="h-10 w-64 mb-4" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          {!selectedEvent && (
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold">
                  Welcome back, {user?.user_metadata?.display_name ?? user?.email?.split('@')[0]}! 👋
                </h1>
                <PremiumBadge isPremium={isPremiumMember} size="lg" />
              </div>
              <p className="text-muted-foreground mt-1">
                Explore upcoming activities and events
              </p>
            </div>
          )}
          {selectedEvent ? (
            // Single event view
            <div className="animate-fade-in">
              <Button
                variant="ghost"
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('id');
                  setSearchParams(newParams);
                  setSelectedEvent(null);
                }}
                className="mb-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
              
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex gap-2">
                      {selectedEvent.is_featured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Featured
                        </Badge>
                      )}
                      {selectedEvent.booking_status === 'confirmed' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Booked
                        </Badge>
                      )}
                      {selectedEvent.booking_status === 'waitlisted' && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          Waitlisted
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-2xl">
                    {selectedEvent.title}
                  </CardTitle>
                  <CardDescription className="space-y-3 mt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(selectedEvent.date), 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(selectedEvent.date), 'h:mm a')} ({selectedEvent.duration_minutes} minutes)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedEvent.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {selectedEvent.bookings_count || 0}/{selectedEvent.max_slots} participants
                        {(selectedEvent.bookings_count || 0) >= selectedEvent.max_slots && 
                          " (Fully Booked)"}
                      </span>
                    </div>
                    {/* Pricing */}
                    {(() => {
                      const priceVal: number = selectedEvent.is_free ? 0 : selectedEvent.price_cents / 100;
                      return (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>{priceVal === 0 ? 'Free' : formatIDR(priceVal)}</span>
                        </div>
                      );
                    })()}
                    {/* Location link */}
                    <div className="flex items-center gap-2">
                      🔗
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-600 hover:text-blue-800"
                      >
                        View on Map
                      </a>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-medium mb-2">About this event</h3>
                  <p className="text-muted-foreground whitespace-pre-line mb-6">
                    {selectedEvent.description}
                  </p>

                  {/* Participants */}
                  <h4 className="text-md font-semibold mb-2">Who's joining</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.bookings_count || 0} participant(s) booked.
                  </p>
                </CardContent>
                <CardFooter>
                  {new Date(selectedEvent.date) >= new Date() && (
                    <Button
                      className="w-full"
                      variant={selectedEvent.is_booked ? "outline" : "default"}
                      style={
                        selectedEvent.is_booked
                          ? undefined
                          : {
                              backgroundColor: typeColors[selectedEvent.type] ?? '#000000',
                              border: `1px solid ${isColorDark(typeColors[selectedEvent.type] ?? '#000000') ? '#E9E2B8' : '#152B14'}`,
                              color: isColorDark(typeColors[selectedEvent.type] ?? '#000000')
                                ? '#E9E2B8'
                                : '#152B14',
                            }
                      }
                      disabled={
                        (!selectedEvent.is_booked &&
                          (selectedEvent.bookings_count || 0) >= selectedEvent.max_slots &&
                          selectedEvent.booking_status !== 'waitlisted') ||
                        bookingLoading === selectedEvent.id
                      }
                      onClick={() => handleBooking(selectedEvent.id, selectedEvent.is_booked || false)}
                    >
                      {bookingLoading === selectedEvent.id ? (
                        <span className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : selectedEvent.booking_status === 'confirmed' ? (
                        'Cancel Join'
                      ) : selectedEvent.booking_status === 'waitlisted' ? (
                        'Leave Waitlist'
                      ) : (selectedEvent.bookings_count || 0) >= selectedEvent.max_slots ? (
                        'Join Waitlist'
                      ) : (
                        'Join'
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          ) : (
            // Events list view
            <>
              <div className="mb-8 animate-fade-in">
                {/* Search + Filter Row */}
                <div className="flex flex-col gap-4">
                                    <div className="flex flex-row flex-wrap items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search events, locations, dates, types..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowSearchSuggestions(e.target.value.length > 0);
                        }}
                        onFocus={() => setShowSearchSuggestions(searchTerm.length > 0)}
                        onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                        className="pl-10 pr-10"
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setSearchTerm('');
                            setShowSearchSuggestions(false);
                          }
                        }}
                      />
                      {searchTerm && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setShowSearchSuggestions(false);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          title="Clear search"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      
                      {/* Search Suggestions */}
                      {showSearchSuggestions && searchTerm && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                          <div className="p-2">
                            <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Quick searches:</div>
                            {[
                              'run', 'pilates', 'padel', 'event',
                              'Central Park', 'Studio', 'Beach',
                              'beginner', 'advanced', 'tournament',
                              'free', 'paid', 'featured'
                            ].filter(suggestion => 
                              suggestion.toLowerCase().includes(searchTerm.toLowerCase())
                            ).slice(0, 6).map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setSearchTerm(suggestion);
                                  setShowSearchSuggestions(false);
                                }}
                                className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded transition-colors"
                              >
                                <Search className="inline h-3 w-3 mr-2 text-muted-foreground" />
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`gap-2 whitespace-nowrap ${isFilterActive ? '' : ''}`}
                        style={isFilterActive ? { backgroundColor: '#152B14', color: '#EBE4B7' } : { backgroundColor: '#EBE5B7', color: '#152B14', borderColor: '#152B14' }}
                      >
                        <Filter className="h-4 w-4" /> Filters
                        {activeFiltersCount > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="text-muted-foreground whitespace-nowrap"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Filters Panel */}
                  {showFilters && (
                    <Card className="p-2 sm:p-3 animate-slide-down border border-[#152B14]/30 rounded-xl bg-background/70 backdrop-blur">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="flex-1">
                          <Label className="text-sm mb-2 block">Activity Type</Label>
                          <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className={typeFilter !== 'all' ? 'border-[#152B14] text-[#152B14]' : ''}>
                              <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="run">Run</SelectItem>
                              <SelectItem value="pilates">Pilates</SelectItem>
                              <SelectItem value="padel">Padel</SelectItem>
                              <SelectItem value="event">Events</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex-1">
                          <Label className="text-sm mb-2 block">Date Range</Label>
                          <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className={dateFilter !== 'upcoming' ? 'border-[#152B14] text-[#152B14]' : ''}>
                              <SelectValue placeholder="Filter by date" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="upcoming">Upcoming</SelectItem>
                              <SelectItem value="this-week">This Week</SelectItem>
                              <SelectItem value="this-month">This Month</SelectItem>
                              <SelectItem value="past">Past Events</SelectItem>
                              <SelectItem value="all">All Dates</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex-1">
                          <Label className="text-sm mb-2 block">Pricing</Label>
                          <Select value={pricingFilter} onValueChange={setPricingFilter}>
                            <SelectTrigger className={pricingFilter !== 'all' ? 'border-[#152B14] text-[#152B14]' : ''}>
                              <SelectValue placeholder="Filter by pricing" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="paying">Paying</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6 animate-slide-down">
                  {error}
                </div>
              )}

              {filteredEvents.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-muted-foreground text-lg mb-4">
                      {searchTerm 
                        ? `No events found for "${searchTerm}"`
                        : 'No events found matching your filters.'}
                    </p>
                    {searchTerm && (
                      <div className="mb-4 text-sm text-muted-foreground">
                        <p>Try searching for:</p>
                        <ul className="mt-2 space-y-1">
                          <li>• Event types: "run", "pilates", "padel", "event"</li>
                          <li>• Locations: "Central Park", "Studio A", "Beach"</li>
                          <li>• Dates: "today", "this week", "next month"</li>
                          <li>• Keywords: "beginner", "advanced", "tournament"</li>
                        </ul>
                      </div>
                    )}
                    <Button variant="outline" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                        {searchTerm && (
                          <span className="ml-1">
                            for "<span className="font-medium">{searchTerm}</span>"
                          </span>
                        )}
                      </p>
                      {searchTerm && (
                        <Badge variant="outline" className="text-xs">
                          Search Results
                        </Badge>
                      )}
                    </div>
                    {filteredEvents.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {events.length !== filteredEvents.length && (
                          <span>Filtered from {events.length} total events</span>
                        )}
                      </div>
                    )}
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event, index) => {
                    const actualBookings = event.bookings_count || 0;
                    // If no bookings yet, generate a deterministic pseudo-random number for UI testing
                    const seed = parseInt(event.id.replace(/-/g, '').substring(0, 8), 16) || index;
                    const simulatedBookings = (actualBookings === 0)
                      ? (seed % event.max_slots) + 1 // at least 1 booking
                      : actualBookings;

                    const displayBookings = simulatedBookings;
                    const isFullyBooked = displayBookings >= event.max_slots;
                    const spotsLeft = event.max_slots - displayBookings;
                    const isPast = new Date(event.date) < new Date();
                    const spotPercentage = (displayBookings / event.max_slots) * 100;

                    // Background images are currently disabled for a cleaner look
                    const bgUrl: string | undefined = event.image_url || undefined;

                    // Color accents by activity type
                    const typeColor = typeColors[event.type] || '#000000';
                    const buttonTextColor = isColorDark(typeColor) ? '#E9E2B8' : '#152B14';

                    return (
                      <Card
                        key={event.id}
                        className={`group relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/10 animate-scale-in bg-transparent aspect-[4/5] ${isPast ? 'opacity-60' : ''}`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Background image */}
                        {bgUrl && (
                          <img
                            src={bgUrl}
                            alt="event background"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )}

                        {/* Background overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                        {/* Card content */}
                        <div className="relative z-10 flex h-full flex-col justify-between p-5 text-[#142B13]">
                          {/* Top information */}
                          <div className="space-y-3 text-sm">
                            <h3 className="text-xl font-bold leading-tight">
                              {event.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                            {/* Date */}
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(event.date), 'EEE, MMM d')}</span>
                            </div>
                            {/* Time */}
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{format(new Date(event.date), 'h:mm a')}</span>
                            </div>
                            {(() => {
                              const priceVal: number = event.is_free ? 0 : event.price_cents / 100;
                              return (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  <span>{priceVal === 0 ? 'Free' : formatIDR(priceVal)}</span>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Booking status & CTA */}
                          <div className="space-y-3">
                            {/* Booking count */}
                            {displayBookings > 0 && (
                              <p className="text-xs font-medium">{displayBookings} participant(s)</p>
                            )}
                            {/* Capacity bar */}
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/30">
                              <div
                                className="h-full"
                                style={{ width: `${spotPercentage}%`, backgroundColor: '#800020' }}
                              />
                            </div>

                            {/* Spots left */}
                            <div className="text-xs font-medium">
                              {isFullyBooked ? (
                                <span className="text-red-200">Full</span>
                              ) : (
                                <span className="text-[#142B13]">{spotsLeft} spots left</span>
                              )}
                            </div>

                            {/* Action button */}
                            {new Date(event.date) >= new Date() && (
                              <Button
                                className="w-full"
                                size="sm"
                                variant={event.is_booked ? 'outline' : 'secondary'}
                                style={
                                  event.is_booked
                                    ? undefined
                                    : {
                                        backgroundColor: typeColor,
                                        border: `1px solid ${buttonTextColor}`,
                                        color: buttonTextColor,
                                      }
                                }
                                disabled={
                                  isPast ||
                                  bookingLoading === event.id ||
                                  (!event.is_booked && isFullyBooked && event.booking_status !== 'waitlisted')
                                }
                                onClick={() => handleBooking(event.id, event.is_booked || false)}
                              >
                                {bookingLoading === event.id
                                  ? '...'
                                  : event.is_booked
                                  ? 'Cancel'
                                  : isFullyBooked
                                  ? 'Waitlist'
                                  : 'Join'}
                              </Button>
                            )}
                          </div>

                          {/* Burger/Menu icon with dialog */}
                          <div className="absolute top-2 right-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <button className="p-1 rounded-full bg-white/70 hover:bg-white focus:outline-none">
                                  <Menu className="h-4 w-4 text-[#142B13]" />
                                </button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    {event.title}
                                  </DialogTitle>
                                  <DialogDescription className="space-y-2 mt-2">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      <span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      <span>{format(new Date(event.date), 'h:mm a')} ({event.duration_minutes} min)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="underline"
                                      >
                                        {event.location}
                                      </a>
                                    </div>
                                    {(() => {
                                      const priceVal: number = event.is_free ? 0 : event.price_cents / 100;
                                      return (
                                        <div className="flex items-center gap-2">
                                          <DollarSign className="h-4 w-4" />
                                          <span>{priceVal === 0 ? 'Free' : formatIDR(priceVal)}</span>
                                        </div>
                                      );
                                    })()}
                                    <div className="flex items-center gap-2">
                                      <Users className="h-4 w-4" />
                                      <span>{displayBookings}/{event.max_slots} participants</span>
                                    </div>
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="mt-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                                  <p className="text-sm text-muted-foreground whitespace-pre-line">{event.description}</p>
                                  
                                  {/* Event Participants */}
                                  <div className="border-t pt-4">
                                    <EventParticipants 
                                      eventId={event.id}
                                      maxSlots={event.max_slots}
                                      bookingsCount={displayBookings}
                                    />
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>

                          {/* Past event badge */}
                          {isPast && (
                            <div className="absolute bottom-3 right-3 z-20 px-2 py-1 text-xs font-semibold rounded-md"
                                 style={{ backgroundColor: '#7C2D12', color: '#FCE7DB' }}>
                              Past Event
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {paymentData && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentData(null);
          }}
          eventTitle={paymentData.eventTitle}
          amount={paymentData.amount}
          currency={paymentData.currency}
          clientSecret={paymentData.clientSecret}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </Layout>
  );
};

export default EventsPage; 