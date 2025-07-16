import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Activity, Users, Trophy, TrendingUp, Clock, MapPin, LogOut } from 'lucide-react';
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
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    signOut();
    navigate('/');
  };

  const activities = [
    {
      title: 'Run',
      icon: '🏃',
      description: 'Join group runs',
      gradient: 'gradient-primary',
      link: '/events?type=run'
    },
    {
      title: 'Pilates',
      icon: '🧘',
      description: 'Strengthen your core',
      gradient: 'gradient-purple',
      link: '/events?type=pilates'
    },
    {
      title: 'Padel',
      icon: '🎾',
      description: 'Play padel tennis',
      gradient: 'gradient-success',
      link: '/events?type=padel'
    },
    {
      title: 'Events',
      icon: '🎉',
      description: 'Special activities',
      gradient: 'gradient-warning',
      link: '/events?type=event'
    }
  ];

  const stats = [
    {
      title: 'Total Bookings',
      value: '12',
      subtitle: 'This month',
      icon: Activity,
      trend: '+15%',
      gradient: 'gradient-primary'
    },
    {
      title: 'Activities Joined',
      value: '8',
      subtitle: 'Different types',
      icon: Users,
      trend: '+2',
      gradient: 'gradient-success'
    },
    {
      title: 'Achievement',
      value: 'Active',
      subtitle: 'Member status',
      icon: Trophy,
      trend: 'Gold',
      gradient: 'gradient-warning'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          {/* Dashboard Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>

          {/* Next Event Card */}
          {!loading && nextEvent && (
            <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 animate-slide-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Your Next Activity</CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-background">
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
                    className="relative overflow-hidden animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 ${stat.gradient} opacity-10 blur-3xl`} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <div className={`p-2 rounded-full ${stat.gradient} text-white`}>
                        <Icon className="h-4 w-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline justify-between">
                        <div>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <p className="text-xs text-muted-foreground">
                            {stat.subtitle}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                          <TrendingUp className="h-3 w-3" />
                          {stat.trend}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Motivational Quote */}
          <Card className="mt-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6 text-center">
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