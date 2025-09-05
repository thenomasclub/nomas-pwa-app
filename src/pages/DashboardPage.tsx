import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Activity, Users, Trophy, TrendingUp, Clock, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Layout from '@/components/Layout';

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  location: string;
}

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [nextEvent, setNextEvent] = useState<UpcomingEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNextEvent();
  }, [user]);

  const fetchNextEvent = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          event_id,
          events (
            id,
            title,
            date,
            type,
            location
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .gte('events.date', new Date().toISOString())
        .order('events(date)', { ascending: true })
        .limit(1)
        .single();

      if (!error && data && data.events) {
        const eventData = data.events as any;
        if (!Array.isArray(eventData)) {
          setNextEvent(eventData);
        }
      }
    } catch (err) {
      console.error('Error fetching next event:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Bookings',
      value: '12',
      subtitle: 'This month',
      icon: Activity,
      trend: '+15%',
      gradient: 'gradient-primary',
      backgroundImage: 'https://uhkksexuecjfzmgdbwax.supabase.co/storage/v1/object/sign/image/APP%20EVENT%204.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YzRiNGZjNC0yZTMzLTRiNzYtODk1ZS1lM2FjOGNlODI2YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9BUFAgRVZFTlQgNC5qcGciLCJpYXQiOjE3NTM4NzExMDgsImV4cCI6MTgxNjk0MzEwOH0.le4hDC-cC0STT18TBfLnbm5pwgieuaQWRrI0KnwApBw'
    },
    {
      title: 'Activities Joined',
      value: '8',
      subtitle: 'Different types',
      icon: Users,
      trend: '+2',
      gradient: 'gradient-success',
      backgroundImage: 'https://uhkksexuecjfzmgdbwax.supabase.co/storage/v1/object/sign/image/APP%20EVENT%203.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YzRiNGZjNC0yZTMzLTRiNzYtODk1ZS1lM2FjOGNlODI2YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9BUFAgRVZFTlQgMy5qcGciLCJpYXQiOjE3NTM4NzEwODIsImV4cCI6MTgxNjk0MzA4Mn0.29pC3af8PaMR3lhpT5ESmhSYxZ1QE7v4VkT63CzZuJc'
    },
    {
      title: 'Achievement',
      value: 'Active',
      subtitle: 'Member status',
      icon: Trophy,
      trend: 'Gold',
      gradient: 'gradient-warning',
      backgroundImage: 'https://uhkksexuecjfzmgdbwax.supabase.co/storage/v1/object/sign/image/APP%20EVENT%204.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YzRiNGZjNC0yZTMzLTRiNzYtODk1ZS1lM2FjOGNlODI2YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9BUFAgRVZFTlQgNC5qcGciLCJpYXQiOjE3NTM4NzExMDgsImV4cCI6MTgxNjk0MzEwOH0.le4hDC-cC0STT18TBfLnbm5pwgieuaQWRrI0KnwApBw'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        
        <div className="container mx-auto px-4 py-8 relative">
          {/* Dashboard Header */}
          <div className="mb-8 animate-fade-in text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Your activity overview and next events</p>
          </div>

          {/* Next Event Card */}
          {!loading && nextEvent && (
            <Card className="mb-8 glass border-primary/20 shadow-xl animate-slide-up relative overflow-hidden">
              {/* Background image for next event */}
              <div className="absolute inset-0">
                <img
                  src="https://uhkksexuecjfzmgdbwax.supabase.co/storage/v1/object/sign/image/APP%20EVENT%203.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YzRiNGZjNC0yZTMzLTRiNzYtODk1ZS1lM2FjOGNlODI2YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9BUFAgRVZFTlQgMy5qcGciLCJpYXQiOjE3NTM4NzEwODIsImV4cCI6MTgxNjk0MzA4Mn0.29pC3af8PaMR3lhpT5ESmhSYxZ1QE7v4VkT63CzZuJc"
                  alt="Next event background"
                  className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5" />
              </div>
              
              <div className="relative z-10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-2xl font-semibold">Your Next Activity</CardTitle>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      Upcoming
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-2xl font-semibold">{nextEvent.title}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{format(new Date(nextEvent.date), 'EEEE, MMMM d at h:mm a')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{nextEvent.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-end justify-end gap-2">
                      <Button size="sm" asChild variant="outline">
                        <Link to="/bookings">View All Bookings</Link>
                      </Button>
                      <Button size="sm">
                        Add to Calendar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          )}

          <Separator className="my-8" />

          {/* Stats Section */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card 
                    key={stat.title} 
                    className="relative overflow-hidden animate-slide-up group hover:shadow-xl transition-all duration-300 border-primary/10"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Background image */}
                    <div className="absolute inset-0">
                      <img
                        src={stat.backgroundImage}
                        alt={`${stat.title} background`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40" />
                    </div>
                    
                    <div className="relative z-10">
                      <div className={`absolute top-0 right-0 w-32 h-32 ${stat.gradient} opacity-10 blur-3xl`} />
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white">
                          {stat.title}
                        </CardTitle>
                        <div className={`p-2 rounded-full ${stat.gradient} text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-baseline justify-between">
                          <div>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <p className="text-xs text-white/80">
                              {stat.subtitle}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium text-green-300">
                            <TrendingUp className="h-3 w-3" />
                            {stat.trend}
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Motivational Quote */}
          <Card className="mt-8 glass border-primary/20 shadow-xl relative overflow-hidden animate-fade-in">
            {/* Background image for motivational quote */}
            <div className="absolute inset-0">
              <img
                src="https://uhkksexuecjfzmgdbwax.supabase.co/storage/v1/object/sign/image/APP%20EVENT%204.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83YzRiNGZjNC0yZTMzLTRiNzYtODk1ZS1lM2FjOGNlODI2YjMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS9BUFAgRVZFTlQgNC5qcGciLCJpYXQiOjE3NTM4NzExMDgsImV4cCI6MTgxNjk0MzEwOH0.le4hDC-cC0STT18TBfLnbm5pwgieuaQWRrI0KnwApBw"
                alt="Motivational background"
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5" />
            </div>
            
            <CardContent className="p-6 text-center relative z-10">
              <p className="text-lg font-medium italic">
                "The only bad workout is the one that didn't happen"
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                - Keep pushing forward! 💪
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage; 