// Simple script to seed events for development
// Run with: node scripts/seed-events.js

const events = [
  // Running events
  {
    title: "Morning Run in Central Park",
    description: "Start your day with an energizing 5K run through Central Park. All levels welcome!",
    type: "run",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    duration_minutes: 45,
    location: "Central Park West Entrance",
    max_slots: 20,
    is_featured: true
  },
  {
    title: "Sunset Beach Run",
    description: "Experience the beauty of sunset while running along the beach. 3-5K at your own pace.",
    type: "run",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    duration_minutes: 60,
    location: "Santa Monica Beach",
    max_slots: 15,
    is_featured: false
  },
  
  // Pilates events
  {
    title: "Core Power Pilates",
    description: "Strengthen your core with this intermediate pilates class. Mats provided.",
    type: "pilates",
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    duration_minutes: 50,
    location: "Nomas Studio A",
    max_slots: 12,
    is_featured: true
  },
  {
    title: "Beginner's Pilates",
    description: "New to pilates? This gentle introduction class is perfect for beginners.",
    type: "pilates",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    duration_minutes: 45,
    location: "Nomas Studio B",
    max_slots: 10,
    is_featured: false
  },
  
  // Padel events
  {
    title: "Padel Tournament",
    description: "Join our monthly padel tournament! Prizes for top 3 teams. All skill levels.",
    type: "padel",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    duration_minutes: 180,
    location: "Nomas Padel Courts",
    max_slots: 16,
    is_featured: true
  },
  {
    title: "Padel Basics Workshop",
    description: "Learn the fundamentals of padel from our expert coaches. Equipment provided.",
    type: "padel",
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    duration_minutes: 90,
    location: "Nomas Padel Court 1",
    max_slots: 8,
    is_featured: false
  },
  
  // Special events
  {
    title: "Summer Fitness Festival",
    description: "A day of fitness fun! Try different activities, meet instructors, and enjoy healthy snacks.",
    type: "event",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    duration_minutes: 240,
    location: "Nomas Main Campus",
    max_slots: 100,
    is_featured: true
  },
  {
    title: "Nutrition Workshop",
    description: "Learn about sports nutrition and meal planning with our certified nutritionist.",
    type: "event",
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
    duration_minutes: 60,
    location: "Nomas Conference Room",
    max_slots: 25,
    is_featured: false
  }
];

console.log('Sample events for development:');
console.log('==============================');
events.forEach((event, index) => {
  console.log(`\n${index + 1}. ${event.title}`);
  console.log(`   Type: ${event.type}`);
  console.log(`   Date: ${event.date.toLocaleDateString()} ${event.date.toLocaleTimeString()}`);
  console.log(`   Location: ${event.location}`);
  console.log(`   Capacity: ${event.max_slots} spots`);
});

console.log('\n\nTo add these events:');
console.log('1. Use the Supabase dashboard to insert them directly');
console.log('2. Or run SQL commands to insert the events');
console.log('3. Or use the Supabase CLI to seed the database'); 