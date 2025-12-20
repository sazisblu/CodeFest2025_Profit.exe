# 🚀 Quick Start: Semantic Similarity Post Creation

## What's New?

When users create a post, the system automatically:
- 🤖 Uses **Google Gemini AI** to understand the content
- 🔍 Searches for **similar posts** in the same area and category
- 🧵 If **40%+ similar**, creates it as a **thread/comment** instead of a new post
- ✅ If **less similar**, creates a **normal post**

This prevents duplicate posts and groups similar issues together!

---

## ⚡ 3-Step Setup

### 1️⃣ Database Setup (2 minutes)

**Run this SQL in Supabase:**

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Run the full migration
```

Copy all SQL from: [`backend/scripts/create_embeddings_table.sql`](backend/scripts/create_embeddings_table.sql)

Paste in: **Supabase Dashboard → SQL Editor → Run**

---

### 2️⃣ Get Gemini API Key (2 minutes)

1. Go to: https://makersuite.google.com/app/apikey
2. Click **"Get API Key"**
3. Copy the key

---

### 3️⃣ Configure & Run (3 minutes)

**Backend:**
```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env and add:
# - GEMINI_API_KEY=your_key_here
# - Your Supabase credentials

# Install & run
npm install
npm run dev
```

**Mobile App:**
```bash
cd mobile_app

# Install dependencies
flutter pub get

# Run the app
flutter run
```

---

## 🎯 How to Use

1. Open the app
2. Click **"Create Post"**
3. Fill in the details
4. Click **"Post"**

**Results:**
- ✨ **Orange notification**: "Similar post found! Created as thread/comment"
- ✅ **Green notification**: "New post created successfully"

---

## 📝 Configuration

### Change Similarity Threshold

**Default**: 40% similarity

**To change**: Edit `backend/src/controllers/postController.ts`
```typescript
const SIMILARITY_THRESHOLD = 0.40; // Change this (0.0 to 1.0)
```

### API URLs

**For Android Emulator** (default):
```dart
// mobile_app/lib/config/api_config.dart
static const String baseUrl = 'http://10.0.2.2:5000/api';
```

**For iOS Simulator**:
```dart
static const String baseUrl = 'http://localhost:5000/api';
```

**For Physical Device**:
```dart
static const String baseUrl = 'http://YOUR_IP:5000/api';
```

---

## 🔍 Testing

1. **Create first post**: "Road damaged near temple"
   - Result: ✅ New post created

2. **Create similar post**: "Potholes on road near temple"
   - Result: ✨ Created as thread to first post

3. **Create different post**: "Water supply issue"
   - Result: ✅ New post created

---

## 📚 Full Documentation

See [`SEMANTIC_SIMILARITY_SETUP.md`](SEMANTIC_SIMILARITY_SETUP.md) for:
- Detailed setup instructions
- Troubleshooting guide
- API documentation
- Architecture explanation
- Security considerations

---

## ⚙️ What Got Added

### Backend Files:
- `src/controllers/postController.ts` - Post creation with similarity
- `src/services/embeddingService.ts` - Gemini AI integration
- `src/routes/posts.ts` - API routes
- `scripts/create_embeddings_table.sql` - Database migration

### Mobile App Files:
- `lib/config/api_config.dart` - API configuration
- Updated `lib/services/post_service.dart` - API integration
- Updated `lib/screens/create_post_screen.dart` - Response handling

### Database:
- `post_embeddings` table - Stores AI-generated vectors
- Similarity search functions
- Optimized indexes

---

## 🐛 Common Issues

**Backend won't start:**
- Check `.env` file has all required variables
- Verify Gemini API key is valid

**"Connection refused" in app:**
- Make sure backend is running (`npm run dev`)
- Check API URL matches your setup (emulator/simulator/device)

**"Extension vector does not exist":**
- Enable pgvector in Supabase Dashboard → Database → Extensions

---

## 📊 API Endpoints

**POST** `/api/posts` - Create post with similarity check
- Returns: `{ type: 'post' | 'thread', message, data }`

**GET** `/api/posts/:id` - Get post by ID

---

## 🎓 How It Works (Simple)

```
User creates post
    ↓
Backend generates AI embedding (768 numbers)
    ↓
Compare with existing posts (same tag + ward)
    ↓
Calculate similarity (0% to 100%)
    ↓
If ≥ 40% similar:
  → Add as thread to similar post
Else:
  → Create new post
```

---

## 🔐 Security

- ✅ API key stays on backend (never in app)
- ✅ Database has Row Level Security (RLS)
- ✅ All requests go through backend

---

## 💡 Tips

- Similarity works best with **clear, detailed descriptions**
- Posts must have **same category and ward** to be compared
- Adjust threshold based on your needs (higher = stricter)

---

## 🆘 Need Help?

1. Check backend logs for errors
2. See full documentation: `SEMANTIC_SIMILARITY_SETUP.md`
3. Test backend independently: `curl http://localhost:5000/health`

---

**That's it! You're ready to use AI-powered post grouping! 🎉**
