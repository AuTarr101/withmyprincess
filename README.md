# Ever, Together ♡ — Product & Technical Implementation

> **Private, responsive web application for two authorized users to preserve monthly rankings, shared experiences, and relationship memories in an evolving archive.**

---

## 🌟 Visual Identity & Design System

The visual design is directly tailored to your reference aesthetic:
- **Palette**: Warm ivory/cream background (`#FDFBF7`, `#FAF6F0`), deep wine/burgundy primary accents (`#7E3B4D`, `#6E2D3B`), soft dusty rose (`#EFE5E2`, `#855F68`), muted sage (`#6E8171`), and subtle gold accents.
- **Typography**: Editorial romantic serif (`Fraunces` / `Playfair Display`) paired with clean humanist sans-serif (`Plus Jakarta Sans`).
- **Cards & Elements**: Scrapbook cards with rounded corners (`rounded-3xl`), polaroid framing, subtle warm borders, and delicate watermarks.
- **Exact Hero Banner**: 1:1 replication of the design provided in your reference image (`SHARED UNIVERSE ACTIVE` pill tag, `Preserving every chapter of us.`, greeting for the active partner, `Open October Chapter ->` and `+ Add New Memory`).

---

## 🧭 Core Structure & Pages

1. **Home (`/`)**:
   - Exact hero banner matching your reference screenshot.
   - October 2026 chapter snapshot with real-time submission progress bars for both Alex and Taylor.
   - Quick access to the 5 categories with current winner / latest memory tags.
   - Anniversary countdown widget & memory reflection quotes.
2. **Rankings (`/rankings`)**:
   - Monthly chapter cover, title, subtitle, and draft/revealed/finalized status badges.
   - Standard monthly workflow:
     1. Create/edit chapter
     2. Add entries with photos & emotional reflection (*"Why this mattered to us"*)
     3. Submit personal ratings (1.0–10.0), tiers (S, A, B, C, Honorable Mention), and private notes
     4. Dramatic reveal ceremony with celebratory confetti animation
     5. Automatic scoring or manual selection of category winners (🏆 Winner, 🥈 Runner-up, 🥉 Honorable Mention)
     6. Monthly reflection quote
     7. Finalize chapter into the timeline (remains persistently editable by authorized users)
   - One-click partner switcher between Alex and Taylor to test and preview both sides of the relationship experience.
3. **Timeline (`/timeline`)**:
   - Chronological monthly archive (October 2026, September 2026, August 2026).
   - Monthly chapter covers, reflection spreads, and the 5 category winners for every completed chapter.
   - Filter by year and modal to start a new monthly chapter.
4. **Our Story (`/our-story`)**:
   - Mutual 9.5+ favorites Hall of Fame (where both Alex and Taylor gave top marks).
   - Category Winners Hall of Fame.
   - Category taste distribution and relationship milestone statistics.
5. **Keepsakes (`/keepsakes`)**:
   - Love letters & personal reflections.
   - Sealed time capsules with automated countdown locks (e.g. sealed until 4th Anniversary).
   - Relationship milestones.
   - "Write a Keepsake" modal.

---

## 🗄️ Database & Supabase Integration

### Local Vault Mode (Out-of-the-Box)
The application works immediately in your browser with full persistent state stored in `localStorage`, pre-seeded with rich, realistic memory chapters for October, September, and August 2026.

### Live Supabase PostgreSQL Connection
To connect to your private Supabase cluster:
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and run the migration script located at:
   `supabase/migrations/20261019000000_init_schema.sql`
   *(Or click the Database icon in the navigation bar to copy the SQL schema with one click!)*
3. Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Restart the development server. Row Level Security (RLS) ensures that only the two authenticated couple members can ever read or update your private space.

---

## 🚀 Running the Project

```bash
# Navigate to the project directory
cd ever-together

# Install dependencies (already completed)
npm install

# Run the development server
npm run dev

# Or run the optimized production build
npm run build
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to view and experience **Ever, Together ♡**.
