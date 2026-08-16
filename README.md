# ⏱️ Smart Queue Management System

### *Because standing in a line for 45 minutes was never a personality trait worth having.*

A real-time, no-nonsense digital queue system built for hospitals, banks, government offices, colleges, and anywhere else that thought "just take a number and wait" was an acceptable customer experience. It wasn't. This fixes that. 💅

---

## ✨ What This Actually Does

Book a token from your phone. Watch your position update *live* — no refreshing like it's 2009. Get nudged when your turn is close. Show up exactly when you need to, not a second before. Meanwhile, admins get a clean live dashboard to call, skip, or complete tokens — plus analytics that actually mean something (peak hours, no-show rate, average wait — the real tea ☕).

No more crowded waiting rooms. No more "beta thoda aur wait karo." Just a queue that respects everyone's time — finally.

---

## 🛠️ Built With

| Layer | Tech |
|---|---|
| 🎨 Frontend | Next.js + Tailwind CSS |
| 🗄️ Database & Backend | Supabase (PostgreSQL) |
| 🔐 Auth | Supabase Auth |
| ⚡ Real-Time Magic | Supabase Realtime |
| 🚀 Hosting | Vercel |

---

## 🧠 Core Features

**For users:**
- 🔑 Secure sign-up & login
- 🔍 Browse services/departments
- 🎟️ Book a digital token, zero paper involved
- 📍 Live queue position — updates itself, no refresh needed
- ⏳ Estimated wait time, so you can actually plan your life
- 🔔 "Your turn is near" notification, not a rude surprise
- 🕰️ Token history — receipts, basically
- ❌ Cancel or reschedule, commitment-free

**For admins:**
- 🛡️ Role-based secure login
- 🧩 Create, edit, delete service queues
- 👀 Monitor live tokens in real time
- ⏭️ Call Next, Skip, or Complete — full control, zero chaos
- 🧑‍💼 Manage multiple counters and staff
- 📊 Analytics: average wait time, peak hours, served count, no-show rate

**Real-time, always:**
- 🔄 Every queue change syncs instantly — Supabase Realtime does the heavy lifting
- 🔒 Row-Level Security keeps every organization's data in its own lane

---

## 🚀 Deploy It Yourself — Baby Steps

No dev experience? No panic. Follow exactly this, in exactly this order.

### 1️⃣ Get the code onto your computer
\`\`\`bash
git clone <your-repo-url>
cd smart-queue
\`\`\`

### 2️⃣ Install the dependencies
\`\`\`bash
npm install
\`\`\`
Grab a coffee ☕ — takes a minute or two.

### 3️⃣ Set up your database (Supabase)
1. Go to [supabase.com](https://supabase.com) → sign up → **New Project**
2. Pick a name, a strong password (save it!), and region **South Asia (Mumbai)** if you're in India
3. Once it's ready, go to **SQL Editor → New Query**
4. Paste in everything from `sql/schema.sql`, hit **Run**
5. "Success. No rows returned" = you did it right ✅

### 4️⃣ Connect your app to Supabase
1. In Supabase: **Project Settings → API** → copy your **Project URL** and **anon public key**
2. In your code, create a file named exactly `.env.local` and add:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`
3. Save the file 💾

### 5️⃣ Run it locally to make sure it works
\`\`\`bash
npm run dev
\`\`\`
Open `localhost:3000` in your browser. If you see the homepage — you're golden. ✨

### 6️⃣ Push it to GitHub
\`\`\`bash
git add .
git commit -m "Smart Queue is alive"
git push
\`\`\`

### 7️⃣ Deploy on Vercel (the fun part)
1. Go to [vercel.com](https://vercel.com) → sign in with GitHub
2. **Add New Project** → import your repo
3. Under **Environment Variables**, add the same two keys from your `.env.local`
4. Hit **Deploy**
5. Wait ~60-90 seconds ⏱️
6. You'll get a live link like `smart-queue-yourname.vercel.app` — **that's it, you're deployed** 🎉

---

## 🩷 A Note From the Build

Every RLS policy, every real-time channel, every "Call Next" button — built to actually work, not just look good in a screenshot. Make your admin account, book a test token, call it from the other side, and watch it sync live. That's the whole point.

**Go be untouchable. Deploy it.** 🚀
