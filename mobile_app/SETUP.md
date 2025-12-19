# Hamro Chautari - Setup Instructions

## Supabase Database Setup

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Copy your project URL and anon key from Settings → API

### 2. Create Database Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert own profile
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget NUMERIC,
  category TEXT,
  location TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read posts
CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT
  USING (true);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own posts
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete own posts
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- Create functions for voting
CREATE OR REPLACE FUNCTION increment_upvotes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET upvotes = upvotes + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_downvotes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET downvotes = downvotes + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;
```

### 3. Enable Google Authentication

1. In Supabase Dashboard, go to Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Get credentials from https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs from Supabase

## Flutter App Setup

### 1. Install Dependencies

```bash
cd mobile_app
flutter pub get
```

### 2. Configure Supabase

Edit `lib/config/supabase_config.dart` and add your credentials:

```dart
static const String supabaseUrl = 'YOUR_SUPABASE_URL';
static const String supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
static const String googleWebClientId = 'YOUR_GOOGLE_WEB_CLIENT_ID';
```

### 3. Android Setup (for Google Sign-In)

Add to `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        minSdkVersion 21  // Required for Google Sign-In
    }
}
```

### 4. iOS Setup (for Google Sign-In)

Add to `ios/Runner/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.YOUR_REVERSED_CLIENT_ID</string>
        </array>
    </dict>
</array>
```

### 5. Run the App

```bash
flutter run -d chrome  # For web testing
# or
flutter run  # For mobile device/emulator
```

## Project Structure

```
lib/
├── config/
│   └── supabase_config.dart       # Supabase configuration
├── models/
│   ├── user_model.dart            # User data model
│   └── post_model.dart            # Post data model
├── services/
│   ├── auth_service.dart          # Authentication logic
│   └── post_service.dart          # Post CRUD operations
├── screens/
│   ├── login_screen.dart          # Login UI
│   ├── home_screen.dart           # Posts feed
│   └── create_post_screen.dart    # Create new post
└── main.dart                      # App entry point
```

## Features Implemented

✅ Google Authentication
✅ User profile creation
✅ Create posts/proposals
✅ View all posts
✅ Upvote/downvote posts
✅ Budget tracking
✅ Category filtering
✅ Location tagging

## Next Steps for Your Hackathon

1. **AI Integration**: Add AI-powered features like:

   - Budget estimation suggestions
   - Proposal categorization
   - Sentiment analysis on proposals
   - Similar proposal detection

2. **Enhanced Features**:

   - Comments on posts
   - Image uploads
   - Search and filtering
   - User profiles
   - Voting history
   - Proposal status tracking

3. **Backend (Supabase)**:
   - Set up Edge Functions for AI integration
   - Add real-time subscriptions
   - Implement advanced RLS policies
   - Add analytics

Good luck with your hackathon! 🚀
