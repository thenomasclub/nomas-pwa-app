import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';

interface Participant {
  id: string;
  display_name: string;
  profile_picture_url: string | null;
  email: string;
}

interface EventParticipantsProps {
  eventId: string;
  maxSlots: number;
  bookingsCount: number;
}

const EventParticipants = ({ eventId, maxSlots, bookingsCount }: EventParticipantsProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchParticipants();
  }, [eventId]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          user_id,
          profiles!inner (
            id,
            display_name,
            profile_picture_url,
            email
          )
        `)
        .eq('event_id', eventId)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const participantsData = data?.map((booking: any) => ({
        id: booking.profiles.id,
        display_name: booking.profiles.display_name || booking.profiles.email?.split('@')[0] || 'Anonymous',
        profile_picture_url: booking.profiles.profile_picture_url,
        email: booking.profiles.email || ''
      })) || [];

      setParticipants(participantsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="font-medium">Participants ({bookingsCount}/{maxSlots})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[...Array(Math.min(bookingsCount, 6))].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="font-medium">Participants ({bookingsCount}/{maxSlots})</span>
        </div>
        <p className="text-sm text-muted-foreground">Unable to load participants</p>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="font-medium">Participants ({bookingsCount}/{maxSlots})</span>
        </div>
        <p className="text-sm text-muted-foreground">No participants yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span className="font-medium">Participants ({bookingsCount}/{maxSlots})</span>
      </div>
      
      <div className="space-y-2">
        {participants.map((participant) => (
          <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={participant.profile_picture_url || undefined} 
                alt={participant.display_name}
              />
              <AvatarFallback className="text-xs">
                {participant.display_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{participant.display_name}</p>
            </div>
          </div>
        ))}
      </div>
      
      {bookingsCount < maxSlots && (
        <p className="text-xs text-muted-foreground">
          {maxSlots - bookingsCount} spot{maxSlots - bookingsCount !== 1 ? 's' : ''} remaining
        </p>
      )}
    </div>
  );
};

export default EventParticipants; 