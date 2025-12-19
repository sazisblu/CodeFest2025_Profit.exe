# Hamro Chautari - Participatory Budgeting Platform

## 🎯 Project Overview

**Hamro Chautari** is a civic engagement platform that empowers local communities to influence how government budgets are allocated. Citizens report community issues, the system identifies high-priority areas through community interaction, and top issues are converted into actionable proposals for democratic voting.

### Mission

Bring decision-making power closer to the people by making budget allocation transparent, participatory, and data-driven.

---

## 📊 How It Works

### **Phase 1: Issue Reporting (Citizen Side)**

Users submit community issues with:

- 📝 **Description** - What's the problem?
- 📍 **Location** - Where is it?
- 🏷️ **Category** - What type (Infrastructure, Sanitation, Health, etc.)?
- 📸 **Images/Attachments** - Visual evidence (future feature)

**Priority Score Calculation:**

```
Priority = (Number of Likes × 1) + (Posts by User × 2)
```

Higher scores = More community support

---

### **Phase 2: Issue Clustering (System)**

Issues are grouped into themes for better analysis:

#### **Hackathon Approach (Current):**

- Group issues by **category tags** selected by users
- Simple, fast, requires no ML

#### **Production Approach (Future):**

- Use **embeddings** (text vectorization) to find semantically similar issues
- Better at finding related issues even with different wording

**Alternative for Hackathon:**

- Use **keyword matching** + category grouping
- Weight clusters by total priority score of grouped issues

---

### **Phase 3: Proposal Creation (Admin/Expert Side)**

After clustering:

1. **Admins view** all issues in their area with priority scores
2. **Experts create proposals** from top N clusters
   - Combine similar issues into actionable plans
   - Assign budget estimates (optional for hackathon)
3. **Proposals are created** ready for voting

---

### **Phase 4: Democratic Voting (Citizen Side)**

Citizens vote on proposals:

- Each user gets **1 vote per proposal**
- Voting is **time-limited** (configurable per proposal)
- **Real-time vote count** visible to all users
- Voting results update live

---

### **Phase 5: Project Execution (Citizen + Admin)**

- **Winning proposal** is selected automatically
- **Citizens see:** Project status updates, implementation timeline
- **Admins update:** Project milestones, completion status
- **Transparency:** Full lifecycle visible to community

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CITIZEN APP (Mobile)                 │
├─────────────────────────────────────────────────────────┤
│  • Post Issues                                          │
│  • Like/Interact with Issues                           │
│  • Vote on Proposals                                    │
│  • Track Project Status                                │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────▼──────────┐
         │   SUPABASE (Backend) │
         │  • PostgreSQL DB     │
         │  • Real-time Updates │
         │  • Storage (Images)  │
         │  • Auth              │
         └───────────┬──────────┘
                     │
┌────────────────────▼──────────────────────────────────┐
│           ADMIN DASHBOARD (Web)                       │
├──────────────────────────────────────────────────────┤
│  • View All Issues + Priority Scores                 │
│  • Create Proposals from Clusters                    │
│  • Monitor Live Vote Count                           │
│  • Update Project Status                             │
│  • Manage Proposals & Voting Periods                 │
└──────────────────────────────────────────────────────┘
```

---

## 💾 Database Schema

### **Core Tables:**

```
users
├── id (UUID)
├── email
├── display_name
├── photo_url
├── created_at

issues (posts)
├── id (UUID)
├── user_id (FK → users)
├── title
├── description
├── location
├── tag_id (FK → tags)
├── likes (count)
├── priority_score (calculated)
├── created_at

tags
├── id (UUID)
├── name (category)
├── created_at

issue_clusters
├── id (UUID)
├── name
├── category (or cluster_type)
├── total_priority_score
├── issue_ids (array of issue UUIDs)
├── created_at

proposals
├── id (UUID)
├── cluster_id (FK → issue_clusters)
├── title
├── description
├── budget_estimate (optional)
├── voting_start_date
├── voting_end_date
├── status (draft, voting, completed)
├── winner (boolean)
├── created_at

votes
├── id (UUID)
├── user_id (FK → users)
├── proposal_id (FK → proposals)
├── created_at

projects (executed proposals)
├── id (UUID)
├── proposal_id (FK → proposals)
├── status (in_progress, completed, delayed)
├── progress_percentage
├── updated_at
└── created_at
```

---

## 🔐 Proposed Solutions

### **1️⃣ Issue Clustering**

#### **Hackathon Solution: Category-Based + Priority Weighting**

```
FOR EACH CATEGORY:
  • Group all issues with same tag
  • Calculate cluster_priority = SUM(all_issue_priorities)
  • Sort by cluster_priority DESC
  • Take top 5-10 clusters
```

**Pros:**

- ✅ Simple to implement
- ✅ Fast (no ML needed)
- ✅ Explainable to users

**Alternative: Keyword Matching**

```
• Extract keywords from issue descriptions
• Find issues with 50%+ matching keywords
• Group them together
• Rank by total priority
```

---

### **2️⃣ Voting System Design**

#### **Recommended Approach: Simple 1-User-1-Vote**

```sql
-- Table structure
CREATE TABLE votes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  proposal_id UUID NOT NULL,
  created_at TIMESTAMP,
  UNIQUE(user_id, proposal_id) -- Prevent double voting
);

-- Check if user already voted
SELECT * FROM votes
WHERE user_id = current_user_id
AND proposal_id = current_proposal_id;

-- Cast vote (INSERT or UPDATE)
INSERT INTO votes (user_id, proposal_id)
VALUES (user_id, proposal_id)
ON CONFLICT DO NOTHING;
```

**Security Features:**

- ✅ **Unique constraint** on `(user_id, proposal_id)` = No double voting
- ✅ **RLS Policies** = Users can only see/modify their own votes
- ✅ **Authentication required** = Must be logged in
- ✅ **Immutable votes** = Can't change vote after cast

#### **Real-Time Vote Count**

Use **Supabase Realtime**:

```dart
// Listen to vote changes
Supabase.instance.client
  .from('votes')
  .on(RealtimeListenTypes.postgresChanges,
    event: '*',
    schema: 'public',
    table: 'votes',
    filter: 'proposal_id=eq.$proposalId',
  )
  .subscribe((payload) {
    // Update vote count in real-time
    _updateVoteCount();
  });
```

**Alternative (if realtime fails):** Poll every 5 seconds

```dart
Timer.periodic(Duration(seconds: 5), (_) {
  _fetchVoteCount();
});
```

---

### **3️⃣ Voting Duration**

#### **Recommended Timeline:**

```
HACKATHON:
  • Voting Duration: 7 days (1 week)
  • Reason: Enough time for engagement, fast iteration

PRODUCTION:
  • Voting Duration: 14-21 days (2-3 weeks)
  • Reason: More time for awareness & participation

CONFIGURABLE:
  • Admin can set voting_start_date & voting_end_date
  • Auto-close voting at end_date
  • Calculate winner immediately
```

#### **Implementation:**

```dart
// Check if voting is still active
bool isVotingActive(DateTime votingStartDate, DateTime votingEndDate) {
  final now = DateTime.now();
  return now.isAfter(votingStartDate) && now.isBefore(votingEndDate);
}

// Auto-close voting
Future<void> closeVotingIfExpired() async {
  final expiredProposals = await supabase
    .from('proposals')
    .select()
    .lt('voting_end_date', DateTime.now().toIso8601String())
    .eq('status', 'voting');

  for (var proposal in expiredProposals) {
    await calculateWinner(proposal['id']);
  }
}
```

---

### **4️⃣ Real-Time Vote Count**

#### **Option A: Supabase Realtime (Recommended)**

```dart
class ProposalVotingScreen extends StatefulWidget {
  const ProposalVotingScreen({required this.proposalId});

  final String proposalId;

  @override
  State<ProposalVotingScreen> createState() => _ProposalVotingScreenState();
}

class _ProposalVotingScreenState extends State<ProposalVotingScreen> {
  late final subscription;
  int _voteCount = 0;

  @override
  void initState() {
    super.initState();
    _setupRealtimeListener();
    _fetchInitialVoteCount();
  }

  void _setupRealtimeListener() {
    subscription = Supabase.instance.client
      .from('votes')
      .on(RealtimeListenTypes.postgresChanges,
        event: '*',
        schema: 'public',
        table: 'votes',
        filter: 'proposal_id=eq.${widget.proposalId}',
      )
      .subscribe((payload) {
        _fetchInitialVoteCount(); // Refresh count
      });
  }

  Future<void> _fetchInitialVoteCount() async {
    final response = await Supabase.instance.client
      .from('votes')
      .select()
      .eq('proposal_id', widget.proposalId);

    setState(() {
      _voteCount = (response as List).length;
    });
  }

  @override
  void dispose() {
    subscription.unsubscribe();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Text('Total Votes: $_voteCount');
  }
}
```

#### **Option B: Polling (Fallback)**

```dart
void _startPolling() {
  _votePollTimer = Timer.periodic(Duration(seconds: 5), (_) {
    _fetchInitialVoteCount();
  });
}
```

---

### **5️⃣ Voting Security Measures**

#### **Layer 1: Database Level (RLS)**

```sql
-- Only users can see their own votes
CREATE POLICY "Users can only view their votes"
ON votes FOR SELECT
USING (auth.uid() = user_id);

-- Only users can insert their own votes
CREATE POLICY "Users can only vote once per proposal"
ON votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Prevent vote deletion (immutable)
CREATE POLICY "Votes cannot be deleted"
ON votes FOR DELETE
USING (false);
```

#### **Layer 2: Application Level**

```dart
// 1. Check if user already voted
Future<bool> hasUserVoted(String userId, String proposalId) async {
  final response = await Supabase.instance.client
    .from('votes')
    .select()
    .eq('user_id', userId)
    .eq('proposal_id', proposalId);

  return (response as List).isNotEmpty;
}

// 2. Validate voting is still active
if (!isVotingActive(proposal.votingStartDate, proposal.votingEndDate)) {
  showError('Voting has ended');
  return;
}

// 3. Cast vote only if all checks pass
Future<void> castVote(String proposalId) async {
  final userId = Supabase.instance.client.auth.currentUser!.id;

  if (await hasUserVoted(userId, proposalId)) {
    showError('You have already voted');
    return;
  }

  await Supabase.instance.client
    .from('votes')
    .insert({
      'user_id': userId,
      'proposal_id': proposalId,
    });
}
```

#### **Layer 3: Admin Verification**

```sql
-- Monitor suspicious voting patterns
SELECT
  proposal_id,
  COUNT(*) as vote_count,
  COUNT(DISTINCT user_id) as unique_users
FROM votes
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY proposal_id
ORDER BY vote_count DESC;
```

---

## 📱 Tech Stack

| Layer               | Technology            | Purpose                       |
| ------------------- | --------------------- | ----------------------------- |
| **Mobile App**      | Flutter + Dart        | iOS/Android citizen app       |
| **Admin Dashboard** | React/Vue             | Web admin panel               |
| **Backend**         | Supabase (PostgreSQL) | Database + Auth + Realtime    |
| **Storage**         | Supabase Storage      | Issue images                  |
| **Real-time**       | Supabase Realtime     | Live vote updates             |
| **Authentication**  | Supabase Auth         | Google OAuth + Email/Password |

---

## 🚀 Development Roadmap

### **Phase 1: MVP (Current - Hackathon)**

- ✅ Issue reporting with categories
- ✅ Priority scoring based on likes
- ✅ Category-based clustering
- 🔄 Basic voting system
- 🔄 Admin dashboard
- ⏳ Project status tracking

### **Phase 2: Enhanced (Post-Hackathon)**

- 📌 Image uploads for issues
- 📌 Budget estimation & allocation
- 📌 Embedding-based clustering (ML)
- 📌 Advanced voting analytics
- 📌 SMS notifications

### **Phase 3: Production**

- 🔐 Biometric authentication
- 🗺️ Map-based issue visualization
- 📊 Advanced analytics dashboard
- 🌐 Multi-language support
- 🔄 API for partner integrations

---

## 🛠️ Setup Instructions

### **Prerequisites**

- Flutter SDK (Mobile)
- Node.js + pnpm (Admin)
- Supabase account

### **Installation**

**Mobile App:**

```bash
cd mobile_app
flutter pub get
flutter run
```

**Admin Dashboard:**

```bash
cd admin_panel
pnpm install
pnpm dev
```

**Backend:**

```bash
cd backend
npm install
npm start
```

---

## 📞 Contact & Support

- **Project Lead:** Hamro Chautari Team
- **Repository:** https://github.com/Dipu9813/hamro_chautari
- **Issues:** Use GitHub Issues for bug reports

---

## 📄 License

MIT License - Open source for community benefit

---

## 🎓 Key Learnings

> **Note:** This is a hackathon project. Some features are simplified for rapid development. Production version will include enhanced security, embeddings-based clustering, and advanced analytics.
