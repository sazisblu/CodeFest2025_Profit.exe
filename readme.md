# Hamro Chautari - Participatory Budgeting Platform

##  Project Overview

**Hamro Chautari** is a civic engagement platform that empowers local communities to influence how government budgets are allocated. Citizens report community issues, the system identifies high-priority areas through community interaction, and top issues are converted into actionable proposals for democratic voting.

### Mission

Bring decision-making power closer to the people by making budget allocation transparent, participatory, and data-driven.

---

##  How It Works

### **Phase 1: Issue Reporting (Citizen Side)**

Users submit community issues with:

-  **Description** - What's the problem?
-  **Location** - Where is it?
-  **Category** - What type (Infrastructure, Sanitation, Health, etc.)?
-  **Images/Attachments** - Visual evidence (future feature)

**Priority Score Calculation:**

```
Priority = (Number of Likes × 1) + (Posts by User × 2)
```

Higher scores = More community support

---

### **Phase 2: Issue Clustering (System)**

- Use **embeddings** (text vectorization) to find semantically similar issues
- Using the semantic similarity , duplicates or similar posts are located when a new post is created. And these new duplicates are turned into threads instead of a post.


---

### **Phase 3: Proposal Creation (Admin/Expert Side)**

After thread creation:

1. **Admins view** all issues in their area with priority scores
2. **Experts create proposals** from top threads
   - Combine similar issues into actionable plans
   - Assign budget estimates
3. **Proposals are created** ready for voting

---

### **Phase 4: Democratic Voting (Citizen Side)**

Citizens vote on proposals:

- Each user gets **1 vote per proposal**
- Voting is **time-limited** (configurable per proposal)
- **Real-time vote count** visible to all users


---

### **Phase 5: Project Execution (Citizen + Admin)**

- **Winning proposal** is selected automatically
- **Citizens see:** Project status updates, implementation timeline
- **Admins update:** Project milestones, completion status
- **Transparency:** Full lifecycle visible to community

---

##  System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CITIZEN APP (Mobile)                 │
├────────────────────────────────────────────────────────-┤
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

##  Tech Stack

| Layer               | Technology            | Purpose                       |
| ------------------- | --------------------- | ----------------------------- |
| **Mobile App**      | Flutter + Dart        | iOS/Android citizen app       |
| **Admin Dashboard** | React/Vue             | Web admin panel               |
| **Backend**         | Supabase (PostgreSQL) | Database + Auth + Realtime    |
| **Storage**         | Supabase Storage      | Issue images                  |
| **Real-time**       | Supabase Realtime     | Live vote updates             |
| **Authentication**  | Supabase Auth         | Google OAuth + Email/Password |

---
