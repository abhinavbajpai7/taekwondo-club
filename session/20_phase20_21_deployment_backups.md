# Phase 20 & 21: Vercel Deployment & Disaster Recovery Backups

## Date / Session
- Timestamp: 2026-09-09
- Status: Completed

---

## 1. Vercel Deployment Checklist (Phase 20)
1. **GitHub Connection**:
   - Create a repository on GitHub (e.g. `taekwondo-club-pwa`).
   - Push the local repository:
     ```bash
     git remote add origin https://github.com/<your-user>/taekwondo-club-pwa.git
     git push -u origin master
     ```
2. **Import into Vercel**:
   - Log into [Vercel](https://vercel.com).
   - Click **Add New Project** $\rightarrow$ Import your GitHub repository.
   - Framework preset will automatically detect **Next.js**.
3. **Configure Production Environment Variables**:
   In Vercel Project Settings $\rightarrow$ **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Publishable Key.
4. **Deploy**:
   - Trigger deployment. Once complete, your PWA is live on HTTPS (e.g. `https://your-club.vercel.app`).
5. **Mobile Installation (PWA)**:
   - On Android (Chrome/Edge): Tap the 3 dots $\rightarrow$ **Install App** or **Add to Home Screen**.
   - On iPhone (Safari): Tap the Share button $\rightarrow$ **Add to Home Screen**.
   - Launch directly from the home screen as a standalone martial arts app.

---

## 2. Disaster Recovery & Backup Plan (Phase 21)
1. **Cloud Database Backups**:
   - Supabase automatically takes daily backups for PostgreSQL databases.
2. **Instant CSV Exports**:
   - Available on `/admin/reports` and `/admin/settings`.
   - **Student Directory Export**: Generates `tkd_students_<date>.csv` containing all student IDs, codes, names, contact numbers, and joining dates.
   - **Payment Ledger Export**: Generates `tkd_payments_<date>.csv` containing all historical payments with transaction dates, methods, amounts, and receipt numbers.
   - **Emergency Backup**: Single-click full backup download for offline safety.
