# ARGhub — Claude Code Developer Brief

## What is ARGhub?

ARGhub is a web platform for the ARG (Alternate Reality Game) community. ARGs are interactive narratives that use the real world as a platform — players receive clues through websites, emails, phone calls, physical locations, and more, all presented as if they are real. ARGhub exists because the ARG community is currently fragmented across Reddit threads, Discord servers, Google Docs, and YouTube — there is no single place that brings it all together.

ARGhub has three types of users:
- **Creators / Puppetmasters** — people who design and run ARGs
- **Solvers** — active participants who crack puzzles and collaborate
- **Lurkers** — passive followers who watch from the sidelines

The platform is a sole proprietorship by Damir Samoilenko. The business model is freemium — most features are free, with paid subscription tiers for power users.

The live site is at: **arghub-xi.vercel.app**
The tech stack is: **vanilla HTML/CSS/JS + Supabase (Postgres + Auth + Storage + Realtime)**
There is no build system, no bundler, no framework. Everything is plain files deployed via Vercel.

---

## Subscription Tiers

| Plan | Price | Key Features |
|---|---|---|
| Freemium | $0 | 2 communities, 1GB storage, public chat |
| Premium | $7.50/mo | 10 communities, 15GB, VIP communities, Evidence Board |
| Puppetmaster | $15/mo | Everything in Premium + 500GB, Creator Dashboard |
| Featured (add-on) | $20/wk | ARG pinned to top of Featured page |

Payment is not yet implemented — buttons exist but trigger a placeholder alert. Stripe or similar needs to be wired in.

---

## File Structure

| File | What it does |
|---|---|
| `index.html` | Homepage — tooltips, feature buttons, classic ARG showcase, manifesto, cosmetic shop button |
| `style.css` | Global styles — navbar, tooltips, cards, layout |
| `supabase-auth.js` | Auth modal, session management, coin system, wardrobe, moderator panel — injected into every page |
| `pricing.html` | Pricing page with billing toggle (monthly/yearly) |
| `discover.html` | Community discovery — search, filter, join, create community |
| `discover-communities.js` | Supabase logic for loading, creating, and editing communities |
| `community.html` | Individual community page — channels, real-time chat, file uploads, admin panel, roles, bans |
| `featured.html` | Featured ARGs — trending strip, new for you, recommended, browse all |
| `featured.css` | Styles for featured page cards and sections |
| `featured.js` | Placeholder ARG data and renders for trending/new/recommended tabs |
| `featured-browse.js` | Supabase browse tab — loads real user-posted ARGs, boost button |
| `dashboard.html` | User dashboard — brainstorm board, post ARG button, my communities |
| `dashboard.css` | Dashboard-specific styles |
| `dashboard.js` | Brainstorm board (drag, connect, delete thoughts) |
| `dashboard-post.js` | Post ARG modal — form, image upload, edit/delete ARGs |
| `contextslips.html` | Context Slips — glossary of ARG terms + notable ARGs archive with submit/edit |
| `recting.html` | Recting Room — YouTube stream embed, schedule, shout-out queue |

---

## Supabase Tables (what currently exists or should exist)

All tables live in a single Supabase project. The anon key and URL are hardcoded in `supabase-auth.js`.

### Tables that must exist (create these if missing):

```sql
-- User profiles (display name + email for mod search)
create table profiles (
  id uuid primary key references auth.users(id),
  display_name text,
  email text
);

-- Promotion Tickets / Coins
create table promotion_tickets (
  user_id uuid primary key references auth.users(id),
  coins int default 0
);

-- Communities
create table communities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  name text not null,
  arg_name text,
  description text,
  rules text,
  type text default 'Public', -- 'Public', 'Invite', 'VIP'
  author text,
  members int default 0,
  created_at timestamptz default now()
);

-- Community members
create table community_members (
  id uuid default gen_random_uuid() primary key,
  community_id uuid references communities(id),
  user_id uuid references auth.users(id),
  display_name text,
  joined_at timestamptz default now()
);

-- Community bans
create table community_bans (
  id uuid default gen_random_uuid() primary key,
  community_id uuid references communities(id),
  user_id uuid references auth.users(id),
  banned_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Channels inside communities
create table channels (
  id uuid default gen_random_uuid() primary key,
  community_id uuid references communities(id),
  name text not null,
  created_at timestamptz default now()
);

-- Messages inside channels
create table messages (
  id uuid default gen_random_uuid() primary key,
  channel_id uuid references channels(id),
  user_id uuid,
  author text,
  content text,
  file_url text,
  file_name text,
  file_type text,
  created_at timestamptz default now()
);

-- Community roles
create table community_roles (
  id uuid default gen_random_uuid() primary key,
  community_id uuid references communities(id),
  name text,
  color text,
  created_at timestamptz default now()
);

-- Role assignments
create table member_roles (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references community_members(id),
  role_id uuid references community_roles(id),
  unique(member_id, role_id)
);

-- Posted ARGs
create table args (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  name text not null,
  author text,
  youtube text,
  website text,
  game text,
  img text, -- base64 image data
  description text,
  genre text,
  status text default 'Active',
  difficulty text,
  platform text,
  trending boolean default false,
  boost_rank int default null, -- null = not boosted, 1-10 = boosted position
  posted_at timestamptz default now()
);

-- Context Slips — community-submitted ARG cards
create table context_slips_args (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  name text,
  year text,
  color text,
  tags text[],
  status text,
  description text,
  notable text,
  arg_creator text,
  story text,
  ciphers_used text,
  links jsonb,
  card_author text,
  created_at timestamptz default now()
);

-- Cosmetics — items a user has purchased
create table cosmetics_owned (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  item_id text not null,
  category text,
  name text,
  purchased_at timestamptz default now()
);

-- Cosmetics — which items are currently active/enabled on a user's profile
create table cosmetics_active (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  item_id text not null,
  category text,
  unique(user_id, category) -- only one active per category at a time
);

-- Recting Room config (stream URL etc.)
create table recting_config (
  id text primary key,
  value text
);

-- Recting Room stream schedule
create table recting_schedule (
  id uuid default gen_random_uuid() primary key,
  title text,
  date date,
  time time,
  created_at timestamptz default now()
);

-- Recting Room shout-out queue
create table recting_shoutouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  arg_name text,
  message text,
  created_at timestamptz default now()
);

-- Recting Room chat (separate from community chat)
create table recting_chat (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  author text,
  message text,
  created_at timestamptz default now()
);
```

### Supabase Storage

One storage bucket is needed:
- **`community-files`** — public bucket used for file attachments sent in community channels (images, audio, video, documents)

### Realtime

Enable realtime on: `messages`, `recting_shoutouts`, `recting_chat`

### Database Triggers

A trigger is needed to auto-increment/decrement the `communities.members` count when rows are inserted/deleted in `community_members`:

```sql
create or replace function update_member_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update communities set members = members + 1 where id = NEW.community_id;
  elsif TG_OP = 'DELETE' then
    update communities set members = greatest(members - 1, 0) where id = OLD.community_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger trg_member_count
after insert or delete on community_members
for each row execute function update_member_count();
```

---

## What Has Been Built (Feature by Feature)

### Auth System (`supabase-auth.js`)
- Sign in with email/password or Google OAuth
- Sign up with display name — name stored in `auth.user_metadata.full_name` and in `profiles` table (including email, so moderator search works)
- Modal injected into every page automatically — no need to add it per page
- Nav button (top right, fixed) shows "Sign In" when logged out, shows name + coin count when logged in
- Session persists across page loads via Supabase's built-in session management

### Coin / Promotion Ticket System
- Users have a coin balance stored in `promotion_tickets` table
- Moderator panel visible **only** to `damiralexsam@gmail.com` inside the auth modal
- Moderator can search any user by display name or email, and grant or remove coins (capped at 5 per user)
- Coin meter shows in the logged-in profile view as a number + 5 pip dots that fill up gold
- Nav button also shows current coin count at all times
- **The mod search requires the `profiles` table to have an `email` column** — this is populated on sign-up. Existing users who signed up before this was added will not appear in search unless their profile row is manually updated.

### Cosmetic Shop (`index.html`)
- Opened via a gold button on the homepage below the manifesto
- 31 cosmetics across 6 categories: Icon Borders, Animated Skins, Banners, Coloured Font, Profile Hats, Backgrounds
- Each cosmetic shows an emoji preview, name, description, coin cost, and a hover tooltip with a more detailed preview description
- Buying deducts coins from `promotion_tickets` and inserts a row into `cosmetics_owned`
- Items you already own show "Owned" and cannot be repurchased
- The shop catalogue is defined in `index.html` as a JS array called `CATALOGUE` — to add more cosmetics, add entries to this array
- **Cosmetics are currently visual data only** — the actual visual effects (coloured username, animated avatar, etc.) have not been implemented in community views. That rendering logic still needs to be built. See Known Bugs / Missing Features.

### Cosmetic Wardrobe (in auth modal, logged-in view)
- Shows all owned cosmetics grouped by category
- Each item has an Enable/Disable toggle
- Only one cosmetic per category can be active at a time — enabling one auto-disables the previous in that category
- Active state stored in `cosmetics_active` table
- **Wardrobe uses `window.__shopCatalogue` to look up emojis** — this variable is set in `index.html`. On other pages the emoji lookup falls back to 🎁. This is fine for now.

### Communities (`discover.html`, `community.html`, `discover-communities.js`)
- Users can browse, search, and filter communities by type (Public, Invite Only, VIP)
- Signed-in users can create communities (Freemium limit: 2 max, enforced client-side and server-side)
- Communities can be linked to an ARG from the posted ARGs list
- Creator can edit community description, rules, and type
- Creator can delete community (wipes members first)
- **Inside a community** (`community.html`):
  - Channels sidebar — creator can add/delete channels from the Admin Console
  - Real-time chat — messages rendered with role tags, file attachments (images, video, audio, documents up to 50MB)
  - Lightbox for images
  - Sign-in gate for non-authenticated users
  - Invite-only gate for communities that require membership
  - Ban gate for banned users
  - Admin Console (creator only) — manage channels, create/delete roles, manage members (assign roles, ban/unban)
  - Leave button for members who aren't the creator
  - System messages when users leave

### Featured ARGs (`featured.html`, `featured.js`, `featured-browse.js`)
- **Trending tab** — auto-scrolling horizontal strip of placeholder ARGs
- **New For You tab** — horizontal drag-scroll row of placeholder ARGs
- **Recommended tab** — vertical list of placeholder ARGs
- **Browse All tab** — loads real user-posted ARGs from Supabase, with search and filter by genre/status/difficulty/platform
- Browse is ordered: boosted ARGs (those with a `boost_rank` of 1–10) appear first in rank order, then the rest by `posted_at` descending
- **Boost Button** — visible in the ARG detail popup only to the owner of that ARG. If the ARG is not in the top 10, user can spend 1 coin to jump it to a random available slot in the top 10. If already in top 10, a green "already in top 10" notice shows instead.

### Dashboard (`dashboard.html`, `dashboard.js`, `dashboard-post.js`)
- Requires auth to access
- **Brainstorm Board** — infinite canvas where users can add text nodes, drag them around, connect them with lines, and delete them. Nodes and connections are in-memory only (not persisted to Supabase).
- **Post New ARG modal** — form to post an ARG with name, author (auto-filled from profile, locked), YouTube/website/game URLs, banner image (base64 upload), description, genre, status, difficulty, platform. Saves to `args` table.
- **My ARGs modal** — lists all ARGs the user has posted, with edit (description, genre, status, difficulty, platform) and delete buttons.
- **Your Communities section** — shows communities the user has created (labelled Creator in orange) and joined (labelled Member in lime), with a Leave button for joined communities.

### Context Slips (`contextslips.html`)
- **Glossary tab** — 32 hardcoded ARG terms with definitions, searchable and filterable by category (Core Concepts, Player Roles, Game Design, Puzzle & Mechanics, Community)
- **Notable ARGs tab** — 10 staff-verified ARG cards (The Beast, I Love Bees, Year Zero, Marble Hornets, Cicada 3301, SCP Foundation, The Jejune Institute, Petscop, The Black Watchmen, 17776) with full stories, ciphers, links, and colour accents. Community members can submit additional cards. Submissions stored in `context_slips_args` table. Submitters can edit or delete their own cards.

### Recting Room (`recting.html`)
- YouTube stream embed — admin pastes a URL, it auto-extracts the video ID and renders the player. Stored in `recting_config` table.
- Live dot pulses red when a stream URL is active, grey when offline
- **Schedule** — fetched from `recting_schedule`, shows upcoming broadcasts with date/title/time
- **Shout-out queue** — users submit their ARG name + message (max 120 chars). Costs 1 Promotion Ticket. Queue is live-updating via Supabase Realtime.
- **Admin panel** — floating ⚙ button (visible to all signed-in users currently — needs to be restricted). Lets admin set stream URL, add/delete schedule items, and delete shout-outs.

### Pricing (`pricing.html`)
- Three plan cards: Freemium ($0), Premium ($7.50/mo), Puppetmaster ($15/mo)
- Featured add-on card ($20/wk)
- Monthly/yearly billing toggle (yearly = 20% discount shown visually)
- Upgrade buttons require auth, then show a placeholder "Payment flow coming soon" alert

---

## Known Bugs and Issues

### Critical

1. **Cosmetic effects are not rendered anywhere.** The shop, wardrobe, and `cosmetics_active` table all work, but nothing reads a user's active cosmetics and applies them visually. When someone has a "Lime Text" coloured font cosmetic active, their username still appears in the default colour in communities, chat, and profiles. **This is the biggest missing piece.** To fix this: on any page that shows a username (community chat, member lists, etc.), fetch that user's active cosmetics from `cosmetics_active` and apply CSS accordingly. A utility function `getActiveCosmetics(userId)` is already exported from `supabase-auth.js`.

2. **Mod search only works for users who signed up after the `email` column was added to `profiles`.** Users who signed up earlier have a `profiles` row without an email. To fix existing users: run a Supabase SQL query to backfill emails from `auth.users` into `profiles`.

3. **Admin panel in Recting Room is visible to all signed-in users.** The `⚙ Manage Stream` button shows for any signed-in user, not just the moderator. It should check `user.email === 'damiralexsam@gmail.com'` before showing the button.

4. **Brainstorm Board is not persisted.** All nodes and connections are lost on page refresh. Needs Supabase storage or localStorage to persist the board state per user.

5. **Community member count trigger may not exist.** If it doesn't, `communities.members` will always show 0. Run the trigger SQL in the Supabase SQL editor (see Supabase Tables section above).

### Medium Priority

6. **`boost_rank` column may not exist on `args` table.** Run: `alter table args add column if not exists boost_rank int default null;` in Supabase SQL editor.

7. **Boosted ARGs never expire.** Once an ARG has a `boost_rank`, it stays boosted forever. There's no timer or expiry. Consider adding a `boost_expires_at` timestamp column and filtering it in `renderBrowse()`.

8. **Image uploads are stored as base64 strings in the `args.img` column.** This is fine for small images but will cause performance issues and bloat the database for large ones. Should be moved to Supabase Storage with a URL reference instead.

9. **No Row Level Security (RLS) policies are set.** Anyone with the anon key can read/write any table. This is a significant security issue. At minimum, add RLS policies so users can only edit/delete their own rows.

10. **Freemium community limit (2 max) is enforced client-side in `discover-communities.js` but not via a database constraint.** A malicious user could bypass it. Add a Postgres check or RLS policy.

11. **The `recting_chat` table exists in the schema but the chat feature was removed from `recting.html`.** The table is harmless but should either be removed or ignored.

12. **Placeholder communities in `discover.html` are hardcoded.** The 23 placeholder communities (Marble Hornets Archive, Cicada 3301 Solvers, etc.) are fake and exist only to make the page look populated. They show "Join" buttons that do nothing real. Real communities from Supabase are prepended to this list with a green "✦ REAL" badge.

### Minor

13. **`featured.js` Browse tab originally read from `localStorage`.** This is now overridden by `featured-browse.js` which reads from Supabase. The old localStorage code in `featured.js` is dead but still present — it can be removed.

14. **The pricing page shows "Your current plan: Freemium" hardcoded.** It does not actually read the user's real subscription from a database. There is no subscriptions table.

15. **Google OAuth redirect may not work in production.** The redirect URL is set to `window.location.href`. Make sure Supabase Auth has `arghub-xi.vercel.app` listed as an allowed redirect URL.

16. **`README.md` currently says "arghub is dead."** This should be updated.

---

## What Still Needs to Be Built

### High Priority

1. **Apply cosmetic effects visually.** In `community.html` (message rendering), in `discover.html` (member cards), and anywhere a username appears — read `cosmetics_active` for that user and apply:
   - `icon-border`: CSS border/box-shadow on avatar element
   - `animated`: CSS animation on avatar
   - `banner`: background image/gradient on profile header
   - `coloured-font`: CSS color on username text
   - `profile-hat`: absolutely-positioned emoji above avatar
   - `background`: CSS background on profile card

2. **Profile page / profile popup.** When clicking a username in a community, there should be a profile popup showing: avatar, display name, active cosmetics (hat, border, banner, background), coin count (maybe), and their ARGs. This does not exist yet.

3. **Payment integration.** The pricing page has placeholder buttons. Wire up Stripe (or similar) to actually charge for Premium and Puppetmaster plans. Store subscription status in a `subscriptions` table and enforce feature gating.

4. **RLS policies.** Every table needs Row Level Security enabled with appropriate policies. At minimum: users can only update/delete rows where `user_id = auth.uid()`.

5. **Brainstorm Board persistence.** Save board state to Supabase (or at minimum localStorage) so it survives page refresh.

6. **Boost expiry.** Add `boost_expires_at timestamptz` to `args`. In `renderBrowse()`, filter to only include rows where `boost_expires_at > now()` or is null. Run a Supabase cron job (pg_cron or Edge Function) to clear expired boosts.

### Medium Priority

7. **Featured plan enforcement.** Users who pay for the Featured add-on should get their ARG pinned to the Trending tab, not just the Browse tab. Currently there is no connection between paying for Featured and the `trending` boolean on the `args` table.

8. **VIP communities.** The VIP type exists in the UI but there's no enforcement that VIP communities require a Premium subscription to view or join.

9. **Evidence Board** (Premium feature on Dashboard). The business plan describes an Evidence Board where users can organize saved files into "File Stacks". This does not exist yet. It was planned as a Dashboard tab for Premium users.

10. **Restrict Recting Room admin panel** to `damiralexsam@gmail.com` only (see bug #3 above).

11. **Backfill existing profiles with email.** Run in Supabase SQL editor:
    ```sql
    update profiles p
    set email = u.email
    from auth.users u
    where p.id = u.id and p.email is null;
    ```

12. **Context Slips moderation.** Community-submitted ARG cards go live immediately with no review. There should be a moderation queue or at least a report button.

13. **Notification system.** No notifications exist anywhere — no alerts for new messages, new communities joining, shout-outs being read, etc.

---

## How the Coin Economy Works (Full Logic)

1. User signs up → starts with 0 coins
2. Moderator (`damiralexsam@gmail.com`) opens their profile modal → uses the mod panel to search a user by name or email → clicks `+ 1` to grant a coin (max 5 per user)
3. User can spend coins two ways:
   - **Boost an ARG** (1 coin): In the ARG detail popup on Featured > Browse, if you own the ARG and it's not in the top 10, a boost button appears. Clicking it deducts 1 coin and sets `args.boost_rank` to a random number 1–10.
   - **Buy a cosmetic** (1–4 coins): In the shop on the homepage, click Buy on any item. Coins are deducted and the item is added to `cosmetics_owned`.
4. Cosmetics are enabled/disabled in the wardrobe (inside the profile modal). Only one per category active at a time.

---

## Tone and Language

ARGhub uses very specific language. When writing UI text, error messages, tooltips, or any copy:

- Users are called **Users** (capital U in official contexts)
- ARG creators are called **Puppetmasters** or **Creators**
- Community entrance points are **Rabbit Holes** or **Trailheads**
- The lore layer of ARGs is called **in-game (IG)**; real-world discussion is **out-of-game (OOG)**
- The philosophy of ARG design is **TINAG** ("This Is Not A Game") — reality is never broken
- The site slogan is: **"This is not a game. This is a website."**
- Tone is dark, minimal, mysterious — black backgrounds, sparse white text, accent colours (lime, violet, orange, cyan, pink) used for specific sections

---

## Page Colour Coding

Each nav section has a distinct accent colour used for hover states, active states, and glows:

| Page | Colour |
|---|---|
| Discover | Orange |
| Pricing | Yellow |
| Featured | Lime |
| Dashboard | Cyan |
| Recting | Pink |
| Context Slips | Violet |

This is defined in `style.css` under `.navbtn` classes and should be respected when adding UI to any page.