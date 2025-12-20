# 🔄 Semantic Similarity Flow Diagram

## System Architecture

```
┌─────────────┐
│ Mobile App  │
│  (Flutter)  │
└──────┬──────┘
       │
       │ HTTP POST /api/posts
       │ { title, description, location, tag_id, ward_no, ... }
       │
       ▼
┌──────────────────────────────────────┐
│         Backend API                  │
│         (Node.js + Express)          │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  POST /api/posts Handler       │ │
│  └────────────────────────────────┘ │
│              │                       │
│              ▼                       │
│  ┌────────────────────────────────┐ │
│  │  Generate Embeddings           │ │
│  │  (Gemini AI - 768 dimensions)  │ │
│  └────────────────────────────────┘ │
│              │                       │
│              ▼                       │
│  ┌────────────────────────────────┐ │
│  │  Query Existing Posts          │ │
│  │  - Same tag_id                 │ │
│  │  - Same ward_no                │ │
│  │  - Has embeddings              │ │
│  └────────────────────────────────┘ │
│              │                       │
│              ▼                       │
│  ┌────────────────────────────────┐ │
│  │  Calculate Similarities        │ │
│  │  (Cosine Similarity)           │ │
│  └────────────────────────────────┘ │
│              │                       │
│         ┌────┴────┐                 │
│         │         │                 │
│    Similarity     │                 │
│      ≥ 40%?       │                 │
│         │         │                 │
│    ┌────┴─────────┴────┐           │
│    │                   │            │
│   YES                 NO            │
│    │                   │            │
│    ▼                   ▼            │
│ ┌───────┐         ┌────────┐       │
│ │Thread │         │New Post│       │
│ └───────┘         └────────┘       │
└──────┬────────────────┬─────────────┘
       │                │
       │                │
       ▼                ▼
┌──────────────────────────────────┐
│         Supabase Database        │
│                                  │
│  ┌────────────┐  ┌─────────────┐│
│  │   posts    │  │post_threads ││
│  │            │  │             ││
│  │ - id       │  │ - id        ││
│  │ - title    │  │ - post_id   ││
│  │ - desc     │  │ - content   ││
│  │ - tag_id   │  │ - image_url ││
│  │ - ward_no  │  │ - user_id   ││
│  └────────────┘  └─────────────┘│
│                                  │
│  ┌─────────────────────────────┐│
│  │    post_embeddings          ││
│  │                             ││
│  │ - id                        ││
│  │ - post_id                   ││
│  │ - embedding (vector(768))   ││
│  └─────────────────────────────┘│
└──────────────────────────────────┘
```

---

## Detailed Flow

### Step 1: User Creates Post
```
Mobile App
    │
    │ User fills form:
    │ - Title: "Road damaged"
    │ - Description: "Big pothole on main road"
    │ - Category: Infrastructure
    │ - Location: Ward 5
    │
    ▼
Click "Create Post" Button
```

### Step 2: Send to Backend
```
Mobile App → Backend API
    │
    │ POST /api/posts
    │
    │ Request Body:
    │ {
    │   "user_id": "uuid-123",
    │   "title": "Road damaged",
    │   "description": "Big pothole on main road",
    │   "tag_id": "infrastructure-uuid",
    │   "ward_no": 5,
    │   "location": "27.6715, 85.4298",
    │   "image_url": "https://..."
    │ }
    │
    ▼
Backend Receives Request
```

### Step 3: Generate Embeddings
```
Backend
    │
    ▼
Call Gemini AI API
    │
    │ Input: "Big pothole on main road"
    │
    ▼
Gemini AI Processing
    │
    │ Analyzes semantic meaning
    │ Converts to 768 numbers
    │
    ▼
Return Embedding
    │
    │ [0.123, -0.456, 0.789, ..., 0.321]
    │ (768 dimensions)
    │
    ▼
Store in Variable
```

### Step 4: Find Similar Posts
```
Backend
    │
    ▼
Query Database
    │
    │ SELECT posts with embeddings
    │ WHERE tag_id = 'infrastructure-uuid'
    │   AND ward_no = 5
    │
    ▼
Found 3 Existing Posts:
    │
    ├─ Post A: "Potholes everywhere"
    │  Embedding: [0.145, -0.423, ...]
    │
    ├─ Post B: "Water supply issue"
    │  Embedding: [-0.567, 0.234, ...]
    │
    └─ Post C: "Street lights broken"
       Embedding: [0.891, -0.123, ...]
```

### Step 5: Calculate Similarities
```
For Each Existing Post:
    │
    ├─ Post A:
    │  cosine_similarity(new_embedding, postA_embedding)
    │  = 0.82 (82% similar) ✓
    │
    ├─ Post B:
    │  cosine_similarity(new_embedding, postB_embedding)
    │  = 0.15 (15% similar) ✗
    │
    └─ Post C:
       cosine_similarity(new_embedding, postC_embedding)
       = 0.23 (23% similar) ✗
       │
       ▼
Highest Similarity: Post A (82%)
```

### Step 6A: Create Thread (if ≥40%)
```
Similarity = 82% ≥ 40% ✓
    │
    ▼
Create Thread/Comment
    │
    │ INSERT INTO post_threads:
    │ {
    │   "post_id": "postA-uuid",
    │   "user_id": "uuid-123",
    │   "content": "Road damaged\n\nBig pothole on main road",
    │   "image_url": "https://...",
    │   "likes_count": 0,
    │   "replies_count": 0
    │ }
    │
    ▼
Update Post A
    │
    │ UPDATE posts
    │ SET threads_count = threads_count + 1
    │ WHERE id = 'postA-uuid'
    │
    ▼
Return Response
    │
    │ {
    │   "success": true,
    │   "type": "thread",
    │   "message": "Similar post found. Created as thread/comment.",
    │   "data": {
    │     "thread_id": "thread-uuid",
    │     "parent_post_id": "postA-uuid",
    │     "parent_post_title": "Potholes everywhere",
    │     "similarity": 0.82
    │   }
    │ }
    │
    ▼
Mobile App Shows:
🟠 "✨ Similar post found!"
```

### Step 6B: Create New Post (if <40%)
```
Similarity = 15% < 40% ✗
    │
    ▼
Create New Post
    │
    │ INSERT INTO posts:
    │ {
    │   "id": "new-post-uuid",
    │   "user_id": "uuid-123",
    │   "title": "Road damaged",
    │   "description": "Big pothole on main road",
    │   "tag_id": "infrastructure-uuid",
    │   "ward_no": 5,
    │   "image_url": "https://...",
    │   "likes_count": 0,
    │   "threads_count": 0
    │ }
    │
    ▼
Store Embeddings
    │
    │ INSERT INTO post_embeddings:
    │ {
    │   "post_id": "new-post-uuid",
    │   "embedding": [0.123, -0.456, ...]
    │ }
    │
    ▼
Return Response
    │
    │ {
    │   "success": true,
    │   "type": "post",
    │   "message": "New post created successfully.",
    │   "data": {
    │     "post_id": "new-post-uuid",
    │     "post": {...},
    │     "similarity": 0.15
    │   }
    │ }
    │
    ▼
Mobile App Shows:
🟢 "✅ New post created successfully"
```

---

## Decision Tree

```
                    ┌─────────────────┐
                    │  User Creates   │
                    │     Post        │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Generate       │
                    │  Embeddings     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Find Posts     │
                    │  (same tag +    │
                    │   ward_no)      │
                    └────────┬────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
                  ▼                     ▼
         ┌─────────────┐      ┌─────────────┐
         │   Posts     │      │   No Posts  │
         │   Found?    │      │   Found     │
         └──────┬──────┘      └──────┬──────┘
                │                    │
           ┌────┴────┐               │
           │  YES    │  NO           │
           ▼         ▼               │
    ┌──────────┐  ┌─────────┐       │
    │Calculate │  │         │       │
    │Similarity│  │         │       │
    └────┬─────┘  │         │       │
         │        │         │       │
         ▼        │         │       │
    ┌─────────┐  │         │       │
    │Highest  │  │         │       │
    │≥ 40%?   │  │         │       │
    └──┬───┬──┘  │         │       │
       │   │     │         │       │
     YES  NO     │         │       │
       │   │     │         │       │
       ▼   └─────┴─────────┴───────┘
  ┌─────────┐                 │
  │ Create  │                 │
  │ Thread  │                 ▼
  │         │        ┌────────────────┐
  │- Add to │        │  Create New    │
  │  parent │        │  Post          │
  │- With   │        │                │
  │  image  │        │- Store in DB   │
  │- +desc  │        │- Save          │
  │         │        │  embeddings    │
  └────┬────┘        └────────┬───────┘
       │                      │
       └──────────┬───────────┘
                  │
                  ▼
         ┌────────────────┐
         │  Return to     │
         │  Mobile App    │
         └────────────────┘
```

---

## Similarity Calculation

### Cosine Similarity Formula

```
Given two vectors A and B:

A = [a₁, a₂, a₃, ..., a₇₆₈]
B = [b₁, b₂, b₃, ..., b₇₆₈]

Cosine Similarity = (A · B) / (||A|| × ||B||)

Where:
- A · B = Dot Product = a₁×b₁ + a₂×b₂ + ... + a₇₆₈×b₇₆₈
- ||A|| = Norm of A = √(a₁² + a₂² + ... + a₇₆₈²)
- ||B|| = Norm of B = √(b₁² + b₂² + ... + b₇₆₈²)

Result: Value between -1 and 1
- 1.0 = Identical (100% similar)
- 0.0 = Orthogonal (no similarity)
- -1.0 = Opposite
```

### Example Calculation

```
Post A: "Road damaged near temple"
Embedding A: [0.5, 0.3, -0.2, ...]

Post B: "Potholes on road near temple"
Embedding B: [0.52, 0.28, -0.18, ...]

Similarity = cosine_similarity(A, B) = 0.85 (85%)

Since 85% ≥ 40% → Create as Thread
```

---

## Data Flow Timeline

```
Time    Event                           Location
----    -----                           --------
0ms     User clicks "Create Post"       Mobile App
        
100ms   Upload image to storage         Supabase Storage
        
500ms   Send POST request               Mobile App → Backend
        
600ms   Receive request                 Backend
        
650ms   Call Gemini API                 Backend → Gemini
        
2000ms  Receive embeddings              Backend ← Gemini
        
2050ms  Query existing posts            Backend → Supabase
        
2150ms  Calculate similarities          Backend
        
2200ms  Create thread/post              Backend → Supabase
        
2250ms  Return response                 Backend → Mobile App
        
2300ms  Show notification               Mobile App
        
2400ms  Navigate to home                Mobile App
```

**Total Time: ~2.4 seconds**

---

## Component Interactions

```
┌──────────────────────────────────────────────────────────┐
│                      Mobile App                          │
│                                                          │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────┐ │
│  │CreatePost   │───▶│PostService   │───▶│HTTP Client │ │
│  │Screen       │    │.createPost() │    │            │ │
│  └─────────────┘    └──────────────┘    └──────┬─────┘ │
│                                                  │       │
└──────────────────────────────────────────────────┼───────┘
                                                   │
                                         HTTP POST │
                                                   │
┌──────────────────────────────────────────────────┼───────┐
│                      Backend API                 │       │
│                                                  ▼       │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────┐ │
│  │Express      │───▶│postController│───▶│Embedding   │ │
│  │Router       │    │.createPost() │    │Service     │ │
│  └─────────────┘    └──────┬───────┘    └──────┬─────┘ │
│                            │                    │       │
│                            │                    ▼       │
│                            │            ┌─────────────┐ │
│                            │            │Gemini AI    │ │
│                            │            │API          │ │
│                            │            └─────────────┘ │
│                            │                            │
│                            ▼                            │
│                     ┌────────────┐                      │
│                     │Supabase    │                      │
│                     │Client      │                      │
│                     └──────┬─────┘                      │
└────────────────────────────┼──────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                   Supabase Database                      │
│                                                          │
│  ┌───────────┐   ┌──────────────┐   ┌────────────────┐ │
│  │  posts    │◀─▶│post_embeddings│◀─▶│post_threads    │ │
│  └───────────┘   └──────────────┘   └────────────────┘ │
│       │                  │                   │          │
│       └──────────────────┴───────────────────┘          │
│                   (Foreign Keys)                        │
└──────────────────────────────────────────────────────────┘
```

---

## Success & Error Paths

### Success Path (Thread Created)
```
1. User submits post
2. Image uploads ✓
3. API call succeeds ✓
4. Embeddings generated ✓
5. Similar post found ✓
6. Thread created ✓
7. Orange notification ✓
8. User sees thread ✓
```

### Success Path (New Post)
```
1. User submits post
2. Image uploads ✓
3. API call succeeds ✓
4. Embeddings generated ✓
5. No similar post found ✓
6. New post created ✓
7. Embeddings stored ✓
8. Green notification ✓
9. User sees post ✓
```

### Error Path
```
1. User submits post
2. API call fails ✗
   ├─ Network error
   ├─ Backend down
   ├─ Invalid data
   └─ Gemini API error
3. Error notification shown
4. User stays on form
5. Can retry submission
```

---

**This diagram explains the complete flow of the semantic similarity feature!**
