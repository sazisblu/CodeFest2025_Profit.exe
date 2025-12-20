# Semantic Similarity Post Creation - Setup Guide

This guide will help you set up the semantic similarity feature for post creation using Google Gemini AI and pgvector.

## Overview

When a user creates a post, the system:
1. **Generates embeddings** for the post description using Gemini AI
2. **Stores embeddings** in the `post_embeddings` table using pgvector
3. **Checks similarity** with existing posts that have the same tag and ward number
4. **If similarity ≥ 40%**: Creates the post as a **thread/comment** to the most similar post
5. **If similarity < 40%**: Creates a **new regular post**

## Prerequisites

- Supabase project with database access
- Google Cloud account with Gemini API access
- Node.js and npm installed
- Flutter SDK installed

## Step 1: Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **"Get API Key"**
3. Create a new API key or use an existing one
4. Copy the API key - you'll need it in Step 3

## Step 2: Setup Database (Supabase)

### 2.1 Enable pgvector Extension

1. Open your **Supabase Dashboard**
2. Go to **Database** → **Extensions**
3. Search for **"vector"** (pgvector)
4. Click **Enable** next to the vector extension

### 2.2 Run Migration SQL

1. Go to **SQL Editor** in Supabase Dashboard
2. Create a new query
3. Copy the contents from `backend/scripts/create_embeddings_table.sql`
4. Run the query

This will create:
- `post_embeddings` table with vector column
- Indexes for fast similarity searches
- RLS policies for security
- Helper functions for finding similar posts

## Step 3: Configure Backend

### 3.1 Install Dependencies

```bash
cd backend
npm install
```

This installs:
- `@google/generative-ai` - Google Gemini AI SDK
- `pgvector` - Vector database client

### 3.2 Setup Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and add your credentials:
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_from_step_1

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Where to find Supabase keys:**
- Go to Supabase Dashboard → Settings → API
- Copy URL, anon key, and service_role key

### 3.3 Start Backend Server

```bash
npm run dev
```

You should see:
```
✅ Server running on port 5000
📊 Health check: http://localhost:5000/health
```

## Step 4: Configure Mobile App

### 4.1 Install Dependencies

```bash
cd mobile_app
flutter pub get
```

This installs the `http` package for API calls.

### 4.2 Update API Configuration (Optional)

Edit `mobile_app/lib/config/api_config.dart`:

**For Android Emulator** (default):
```dart
static const String baseUrl = 'http://10.0.2.2:5000/api';
```

**For iOS Simulator**:
```dart
static const String baseUrl = 'http://localhost:5000/api';
```

**For Physical Device**:
```dart
static const String baseUrl = 'http://YOUR_COMPUTER_IP:5000/api';
```

To find your computer's IP:
- **Windows**: `ipconfig` (look for IPv4 Address)
- **Mac/Linux**: `ifconfig` or `ip addr`

### 4.3 Run Mobile App

```bash
flutter run
```

## Step 5: Testing

### 5.1 Test Backend API

Test if the backend is running:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{"status":"OK","message":"Server is running"}
```

### 5.2 Test Post Creation

1. Open the mobile app
2. Click the **"+"** button or **"What's on your mind?"**
3. Fill in the post details:
   - Title
   - Description
   - Location (or use current location)
   - Select a category tag
   - Add an image (optional)
4. Click **"Create Post"**

### Expected Behavior:

**Scenario 1: New Unique Post**
- A new post is created
- Message: "✅ New post created successfully."
- The post appears in the feed

**Scenario 2: Similar Post Found (≥40% similarity)**
- The content is added as a thread/comment to the existing similar post
- Message: "✨ Similar post found! Similar post found. Created as thread/comment."
- The thread appears under the original post

## How It Works

### Backend Flow (`backend/src/controllers/postController.ts`):

```
1. Receive post data from mobile app
   ↓
2. Generate embeddings using Gemini AI
   ↓
3. Query existing posts with same tag_id and ward_no
   ↓
4. Calculate cosine similarity with each post
   ↓
5. Find highest similarity score
   ↓
6. IF similarity ≥ 40%:
      → Create thread/comment to similar post
      → Increment threads_count
   ELSE:
      → Create new post
      → Store embeddings in post_embeddings
   ↓
7. Return response with type ('post' or 'thread')
```

### Mobile App Flow (`mobile_app/lib/services/post_service.dart`):

```
1. User fills post form
   ↓
2. Upload image to Supabase Storage (if provided)
   ↓
3. Call backend API: POST /api/posts
   ↓
4. Receive response with type and message
   ↓
5. Show appropriate message to user
   ↓
6. Navigate back to home screen
```

## Database Schema

### `post_embeddings` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| post_id | UUID | Foreign key to posts table |
| embedding | vector(768) | Vector embedding from Gemini |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### Indexes:
- `post_embeddings_embedding_idx`: IVFFlat index for fast similarity search
- `post_embeddings_post_id_idx`: B-tree index on post_id

## Similarity Threshold

The default similarity threshold is **40%** (0.40).

To change it:
- **Backend**: Edit `SIMILARITY_THRESHOLD` in `backend/src/controllers/postController.ts`
- **Database Function**: Edit the default parameter in the SQL function `find_similar_posts()`

## Troubleshooting

### Backend Issues

**Error: "Failed to generate embedding"**
- Check that `GEMINI_API_KEY` is set correctly in `.env`
- Verify the API key is valid in Google AI Studio
- Check your Google Cloud project billing is enabled

**Error: "Cannot find module"**
- Run `npm install` in the backend directory
- Check that `node_modules` folder exists

**Error: "Port 5000 already in use"**
- Change `PORT` in `.env` to a different port (e.g., 5001)
- Update `baseUrl` in mobile app's `api_config.dart`

### Database Issues

**Error: "extension vector does not exist"**
- Enable pgvector extension in Supabase Dashboard
- Go to Database → Extensions → Enable "vector"

**Error: "relation post_embeddings does not exist"**
- Run the migration SQL from `backend/scripts/create_embeddings_table.sql`

### Mobile App Issues

**Error: "Connection refused" or "Failed to connect"**
- Make sure backend server is running (`npm run dev`)
- Check `baseUrl` in `api_config.dart` matches your setup:
  - Android Emulator: `http://10.0.2.2:5000/api`
  - iOS Simulator: `http://localhost:5000/api`
  - Physical Device: `http://YOUR_IP:5000/api`

**Error: "Image upload failed"**
- Check Supabase Storage bucket "post-images" exists
- Verify RLS policies allow uploads

## API Documentation

### POST `/api/posts`

Create a new post with semantic similarity check.

**Request Body:**
```json
{
  "user_id": "uuid",
  "title": "string",
  "description": "string",
  "location": "string",
  "tag_id": "uuid",
  "image_url": "string (optional)",
  "latitude": "number (optional)",
  "longitude": "number (optional)",
  "ward_no": "integer (optional)"
}
```

**Response (New Post):**
```json
{
  "success": true,
  "type": "post",
  "message": "New post created successfully.",
  "data": {
    "post_id": "uuid",
    "post": {...},
    "similarity": 0.25
  }
}
```

**Response (Thread Created):**
```json
{
  "success": true,
  "type": "thread",
  "message": "Similar post found. Created as thread/comment.",
  "data": {
    "thread_id": "uuid",
    "parent_post_id": "uuid",
    "parent_post_title": "string",
    "similarity": 0.75
  }
}
```

### GET `/api/posts/:id`

Get a post by ID with embeddings.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    ...
    "post_embeddings": [
      {
        "embedding": [0.123, 0.456, ...]
      }
    ]
  }
}
```

## Advanced Configuration

### Adjusting Similarity Algorithm

The cosine similarity is calculated using:

```typescript
cosineSimilarity = dotProduct / (normA * normB)
```

You can modify this in `backend/src/services/embeddingService.ts`.

### Using Different Embedding Models

To use a different Gemini model:

Edit `backend/src/services/embeddingService.ts`:
```typescript
const model = genAI.getGenerativeModel({ model: 'embedding-001' });
// Change to: 'text-embedding-004' or other available models
```

Note: Different models may have different embedding dimensions. Update the vector size in the database accordingly.

### Performance Optimization

For large datasets:
1. Adjust IVFFlat lists parameter in the index
2. Use approximate nearest neighbor search
3. Implement caching for frequently accessed embeddings

## Security Considerations

- The `GEMINI_API_KEY` should never be exposed to the client
- All AI operations happen on the backend
- RLS policies protect database access
- Service role key is used only on the backend

## Next Steps

- Monitor API usage in Google Cloud Console
- Set up rate limiting for the backend API
- Implement analytics to track thread creation vs new posts
- Add user notifications when their post becomes a thread

## Support

If you encounter issues:
1. Check the backend logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test the backend API independently using curl or Postman
4. Check Supabase logs in the Dashboard

## License

This feature is part of the Hamro Chautari project.
