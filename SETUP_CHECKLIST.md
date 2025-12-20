# ✅ Setup Checklist - Semantic Similarity Feature

Use this checklist to ensure everything is set up correctly.

---

## 📋 Prerequisites

- [ ] Supabase project created
- [ ] Node.js installed (v14 or higher)
- [ ] Flutter SDK installed
- [ ] Google account for Gemini API

---

## 🗄️ Database Setup

- [ ] Open Supabase Dashboard
- [ ] Go to **Database** → **Extensions**
- [ ] Enable **vector** (pgvector) extension
- [ ] Go to **SQL Editor**
- [ ] Copy SQL from `backend/scripts/create_embeddings_table.sql`
- [ ] Run the migration SQL
- [ ] Verify `post_embeddings` table exists
- [ ] Check indexes are created

---

## 🔑 API Keys

- [ ] Go to https://makersuite.google.com/app/apikey
- [ ] Create or get Gemini API key
- [ ] Copy the API key
- [ ] Save for backend configuration

---

## 🖥️ Backend Setup

### Installation
- [ ] Open terminal in `backend` folder
- [ ] Run: `npm install`
- [ ] Verify `node_modules` folder created
- [ ] Check `@google/generative-ai` installed
- [ ] Check `pgvector` installed

### Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Edit `.env` file
- [ ] Add `SUPABASE_URL` (from Supabase Dashboard → Settings → API)
- [ ] Add `SUPABASE_SERVICE_KEY` (service_role key)
- [ ] Add `SUPABASE_ANON_KEY` (anon key)
- [ ] Add `GEMINI_API_KEY` (from Google AI Studio)
- [ ] Set `PORT=5000` (or your preferred port)

### Build & Run
- [ ] Run: `npm run build`
- [ ] Check for no compilation errors
- [ ] Run: `npm run dev`
- [ ] Server starts on port 5000
- [ ] Test: `curl http://localhost:5000/health`
- [ ] Response: `{"status":"OK","message":"Server is running"}`

---

## 📱 Mobile App Setup

### Installation
- [ ] Open terminal in `mobile_app` folder
- [ ] Run: `flutter pub get`
- [ ] Verify packages downloaded
- [ ] Check `http` package in pubspec.yaml

### Configuration
- [ ] Open `lib/config/api_config.dart`
- [ ] Choose correct `baseUrl`:
  - **Android Emulator**: `http://10.0.2.2:5000/api` ✓ (default)
  - **iOS Simulator**: `http://localhost:5000/api`
  - **Physical Device**: `http://YOUR_IP:5000/api`
- [ ] Save the file

### Run
- [ ] Connect device or start emulator
- [ ] Run: `flutter run`
- [ ] App builds and launches
- [ ] No compilation errors

---

## 🧪 Testing

### Test 1: Backend Health Check
- [ ] Backend is running
- [ ] Test: `curl http://localhost:5000/health`
- [ ] Gets successful response

### Test 2: Create First Post
- [ ] Open app
- [ ] Click "Create Post" or "+"
- [ ] Fill in:
  - Title: "Road damage near temple"
  - Description: "There is a big pothole on main road"
  - Category: Select any
  - Location: Get current or enter
- [ ] Click "Create Post"
- [ ] See green notification: "✅ New post created successfully"
- [ ] Post appears in feed

### Test 3: Create Similar Post
- [ ] Click "Create Post" again
- [ ] Fill in:
  - Title: "Pothole issue"
  - Description: "The main road has potholes near temple"
  - **Same category** as first post
  - **Same location/ward** as first post
- [ ] Click "Create Post"
- [ ] See orange notification: "✨ Similar post found!"
- [ ] Message says "Created as thread/comment"

### Test 4: Create Different Post
- [ ] Click "Create Post"
- [ ] Fill in completely different content:
  - Title: "Water supply problem"
  - Description: "No water supply since morning"
  - Different category
- [ ] Click "Create Post"
- [ ] See green notification: "✅ New post created successfully"

### Test 5: Verify Thread Creation
- [ ] Open the first post from Test 2
- [ ] Check threads/comments section
- [ ] Should see the content from Test 3 as a thread
- [ ] Thread should include the description
- [ ] Image should be visible if uploaded

---

## 🔍 Verification

### Backend Logs
- [ ] Check terminal running backend
- [ ] See log: "📊 Generating embedding for description..."
- [ ] See log: "✅ Embedding generated (dimension: 768)"
- [ ] See log: "🔎 Searching for similar posts..."
- [ ] See log: "🎯 Highest similarity: XX.XX%"
- [ ] See either:
  - "✨ Creating as thread to post: ..." (if similar)
  - "📝 Creating as new regular post" (if not similar)

### Database Verification
- [ ] Open Supabase Dashboard
- [ ] Go to **Table Editor**
- [ ] Check `posts` table
- [ ] Verify posts created
- [ ] Check `post_embeddings` table
- [ ] Verify embeddings exist for new posts
- [ ] Check `post_threads` table
- [ ] Verify threads created for similar posts

### App Behavior
- [ ] App doesn't crash
- [ ] Post creation takes 2-5 seconds
- [ ] Correct notifications appear
- [ ] Posts/threads appear in feed
- [ ] No error messages in console

---

## 🐛 Troubleshooting

### Backend Issues

**Port 5000 in use:**
- [ ] Change `PORT` in `.env` to 5001
- [ ] Update `baseUrl` in mobile app

**"Failed to generate embedding":**
- [ ] Check `GEMINI_API_KEY` in `.env`
- [ ] Test key in Google AI Studio
- [ ] Check internet connection
- [ ] Verify Google Cloud billing enabled

**"Cannot find module":**
- [ ] Delete `node_modules`
- [ ] Run `npm install` again

### Database Issues

**"Extension vector does not exist":**
- [ ] Enable pgvector in Supabase
- [ ] Database → Extensions → vector → Enable

**"Table post_embeddings does not exist":**
- [ ] Run migration SQL again
- [ ] Check for SQL errors in execution

### Mobile App Issues

**"Connection refused":**
- [ ] Ensure backend is running
- [ ] Check `baseUrl` in `api_config.dart`
- [ ] For Android: Use `10.0.2.2`
- [ ] For iOS: Use `localhost`
- [ ] For device: Use computer's IP

**"Failed to create post":**
- [ ] Check backend logs for errors
- [ ] Verify all required fields filled
- [ ] Check internet connection
- [ ] Ensure Supabase credentials correct

---

## 📊 Performance Check

- [ ] Post creation completes in 2-5 seconds
- [ ] Backend responds quickly (<1s for health check)
- [ ] No memory leaks in backend
- [ ] App doesn't freeze during post creation
- [ ] Database queries are fast

---

## 🔐 Security Check

- [ ] `.env` file not committed to git
- [ ] `GEMINI_API_KEY` not exposed in app
- [ ] Service role key only on backend
- [ ] RLS policies enabled on `post_embeddings`
- [ ] HTTPS used in production (if deployed)

---

## 📚 Documentation Check

- [ ] Read `SEMANTIC_SIMILARITY_QUICKSTART.md`
- [ ] Skim `SEMANTIC_SIMILARITY_SETUP.md`
- [ ] Review `IMPLEMENTATION_SUMMARY.md`
- [ ] Understand the workflow
- [ ] Know how to adjust threshold

---

## ✅ Final Verification

- [ ] Backend builds without errors
- [ ] Mobile app builds without errors
- [ ] Can create posts successfully
- [ ] Similarity detection works
- [ ] Threads created for similar posts
- [ ] Regular posts created for dissimilar content
- [ ] Notifications show correct messages
- [ ] All logs show expected output

---

## 🎉 Success Criteria

✅ **All checkboxes above are checked**
✅ **Can create at least 3 test posts**
✅ **At least 1 thread created from similarity**
✅ **No errors in logs**
✅ **App works smoothly**

---

## 📞 Need Help?

If stuck:
1. Check backend terminal for error messages
2. Check mobile app console for errors
3. Review `SEMANTIC_SIMILARITY_SETUP.md` troubleshooting section
4. Verify all environment variables are set
5. Test backend independently with curl

---

**Setup Date:** _____________

**Notes:**
_______________________________________
_______________________________________
_______________________________________

---

**Status:** 
- [ ] Setup in progress
- [ ] Setup complete
- [ ] Tested and working
- [ ] Ready for production
