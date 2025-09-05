# Event Images Workflow

This guide shows you how to add background images to events through the Supabase admin panel.

## 🚀 Quick Setup

### Step 1: Run the Migration
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the migration file: `supabase/migrations/013_add_event_image_url.sql`
4. This adds the `image_url` column to your events table

### Step 2: Add Images to Events

You have two options for image URLs:

#### Option A: Use Any External Image URL
```sql
UPDATE events 
SET image_url = 'https://your-image-url.com/image.jpg'
WHERE title = 'Your Event Title';
```

#### Option B: Use Supabase Storage (Recommended)
1. Go to **Storage** in Supabase Dashboard
2. Create a bucket called `events` (if it doesn't exist)
3. Upload your image
4. Copy the public URL
5. Paste it in the SQL query above

## 📝 Easy Copy-Paste Templates

### View All Events
```sql
SELECT id, title, type, date, image_url FROM events ORDER BY date;
```

### Add Image to Specific Event
```sql
UPDATE events 
SET image_url = 'PASTE_YOUR_IMAGE_URL_HERE'
WHERE title = 'PASTE_EVENT_TITLE_HERE';
```

### Add Image by Event ID
```sql
UPDATE events 
SET image_url = 'PASTE_YOUR_IMAGE_URL_HERE'
WHERE id = 'PASTE_EVENT_ID_HERE';
```

### Remove Image from Event
```sql
UPDATE events 
SET image_url = NULL
WHERE title = 'PASTE_EVENT_TITLE_HERE';
```

### Check Which Events Have Images
```sql
SELECT title, type, image_url FROM events 
WHERE image_url IS NOT NULL 
ORDER BY date;
```

## 🎯 Workflow Summary

1. **Upload image** → Storage or external hosting
2. **Copy URL** → Get the full image URL
3. **Run SQL** → Update the event with the image URL
4. **Check frontend** → Image appears as event background

## 💡 Pro Tips

- **Image size**: Recommended 1200x600px or larger for best quality
- **Format**: JPG, PNG, or WebP work well
- **URL format**: Make sure it's a direct link to the image file
- **Test**: Check the URL works by pasting it in a browser

## 🔧 Troubleshooting

**Image not showing?**
- Check the URL is correct and accessible
- Ensure the image URL ends with .jpg, .png, etc.
- Verify the event has been updated by running the SELECT query

**Want to change an image?**
- Just run the UPDATE query again with a new URL
