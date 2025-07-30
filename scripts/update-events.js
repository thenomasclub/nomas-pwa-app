// Script to remove all existing events and add recurring weekly events
// Run with: node scripts/update-events.js

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://uhkksexuecjfzmgdbwax.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoa2tzZXh1ZWNqZnptZ2Rid2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMzUyNjcsImV4cCI6MjA2NTYxMTI2N30.RfuUEAu6EMU5LWu9O_sTpH5L_oRH7Z6KfAIql_UL_Bk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to get next occurrence of a day of the week
function getNextOccurrence(dayOfWeek, timeString) {
  const now = new Date();
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Create date for the specified day and time
  const targetDate = new Date();
  targetDate.setHours(hours, minutes, 0, 0);
  
  // Calculate days until next occurrence
  const currentDay = now.getDay();
  const targetDay = dayOfWeek; // 0 = Sunday, 1 = Monday, etc.
  
  let daysUntilNext = targetDay - currentDay;
  if (daysUntilNext <= 0) {
    daysUntilNext += 7; // Next week
  }
  
  targetDate.setDate(now.getDate() + daysUntilNext);
  return targetDate;
}

// Helper function to generate recurring events for the next 12 weeks
function generateRecurringEvents() {
  const events = [];
  
  // Monday: KEEN CAFE, Pererenan / 5k run / 6:15 am, unlimited
  for (let week = 0; week < 12; week++) {
    const eventDate = getNextOccurrence(1, '06:15'); // Monday = 1
    eventDate.setDate(eventDate.getDate() + (week * 7));
    
    events.push({
      title: "Monday Morning Run",
      description: "Start your week with an energizing 5K run at KEEN CAFE in Pererenan. All levels welcome! Meet at the cafe entrance.",
      type: "run",
      date: eventDate.toISOString(),
      duration_minutes: 45,
      location: "KEEN CAFE, Pererenan",
      max_slots: 999, // Unlimited
      is_featured: false,
      is_free: true,
      price_cents: 0,
      pricing_note: "Free for all members"
    });
  }
  
  // Thursday: JUNGLE PADLE, CANGGU / PADLE NIGHT / 5:30PM - 7:30PM, 200,000 IDR, max 24
  for (let week = 0; week < 12; week++) {
    const eventDate = getNextOccurrence(4, '17:30'); // Thursday = 4
    eventDate.setDate(eventDate.getDate() + (week * 7));
    
    events.push({
      title: "Padel Night",
      description: "Join our weekly padel session at JUNGLE PADLE in Canggu. Perfect for all skill levels. Equipment provided. Price: 200,000 IDR per session.",
      type: "padel",
      date: eventDate.toISOString(),
      duration_minutes: 120, // 2 hours
      location: "JUNGLE PADLE, CANGGU",
      max_slots: 24,
      is_featured: true,
      is_free: false,
      price_cents: 20000000, // 200,000 IDR
      pricing_note: "200,000 IDR per session"
    });
  }
  
  // Friday: KYND, CANGGU / GIRLS ONLY 5k run / 7:00am, unlimited
  for (let week = 0; week < 12; week++) {
    const eventDate = getNextOccurrence(5, '07:00'); // Friday = 5
    eventDate.setDate(eventDate.getDate() + (week * 7));
    
    events.push({
      title: "Girls Only Morning Run",
      description: "Ladies, join us for a supportive 5K run at KYND in Canggu. Women-only event to encourage female participation in fitness. Meet at KYND entrance.",
      type: "run",
      date: eventDate.toISOString(),
      duration_minutes: 45,
      location: "KYND, CANGGU",
      max_slots: 999, // Unlimited
      is_featured: false,
      is_free: true,
      price_cents: 0,
      pricing_note: "Free for all members - Women only"
    });
  }
  
  return events;
}

async function updateEvents() {
  try {
    console.log('🔄 Starting event update process...');
    
    // Step 1: Delete all existing events
    console.log('🗑️  Deleting all existing events...');
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all events
    
    if (deleteError) {
      console.error('❌ Error deleting events:', deleteError);
      return;
    }
    
    console.log('✅ All existing events deleted successfully');
    
    // Step 2: Generate new recurring events
    console.log('📅 Generating recurring weekly events...');
    const newEvents = generateRecurringEvents();
    
    console.log(`📝 Created ${newEvents.length} events for the next 12 weeks`);
    
    // Step 3: Insert new events
    console.log('💾 Inserting new events into database...');
    const { data, error: insertError } = await supabase
      .from('events')
      .insert(newEvents)
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting events:', insertError);
      return;
    }
    
    console.log(`✅ Successfully inserted ${data.length} events`);
    
    // Step 4: Display summary
    console.log('\n📊 Event Summary:');
    console.log('==================');
    
    const mondayRuns = newEvents.filter(e => e.title === "Monday Morning Run").length;
    const thursdayPadel = newEvents.filter(e => e.title === "Padel Night").length;
    const fridayRuns = newEvents.filter(e => e.title === "Girls Only Morning Run").length;
    
    console.log(`🏃 Monday Morning Runs: ${mondayRuns} events`);
    console.log(`🎾 Thursday Padel Nights: ${thursdayPadel} events`);
    console.log(`👩 Friday Girls Only Runs: ${fridayRuns} events`);
    
    console.log('\n📅 Next 4 weeks preview:');
    console.log('========================');
    
    const nextFourWeeks = newEvents
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 12);
    
    nextFourWeeks.forEach((event, index) => {
      const date = new Date(event.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const time = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      const price = event.is_free ? 'FREE' : `${(event.price_cents / 100).toLocaleString()} IDR`;
      
      console.log(`${index + 1}. ${dayName} ${time} - ${event.title}`);
      console.log(`   📍 ${event.location}`);
      console.log(`   💰 ${price} (${event.max_slots} spots)`);
      console.log('');
    });
    
    console.log('🎉 Event update completed successfully!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the update
updateEvents(); 