# SIM Magister — Pendaftaran Mahasiswa Baru & Wisuda S2

Aplikasi web untuk pendaftaran mahasiswa baru program Magister (S2) dan pendaftaran wisuda S2.
**Stack**: Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Auth + Postgres + Storage). Siap deploy ke **Vercel**.

## Fitur

- Registrasi & login email/password via Supabase Auth
- Form pendaftaran mahasiswa baru S2 (data pribadi, pendidikan S1, prodi tujuan, upload ijazah/transkrip/KTP)
- Form pendaftaran wisuda S2 (NIM, judul tesis, pembimbing, IPK, upload syarat)
- Dashboard mahasiswa — riwayat & status pendaftaran (menunggu/diterima/ditolak + catatan admin)
- Dashboard admin — verifikasi, approve/reject, beri catatan, filter status
- Upload dokumen ke Supabase Storage (private bucket, akses via signed URL)
- Row Level Security: mahasiswa hanya bisa melihat datanya sendiri, admin bisa semua

## Setup Supabase

1. Buat project baru di https://supabase.com.
2. Buka **SQL Editor** → tempel isi `supabase/migrations/0001_init.sql` → **Run**.
   Migration ini membuat tabel, RLS policies, trigger auto-create profile, dan storage bucket `documents`.
3. **Authentication → Providers**: pastikan **Email** aktif.
   Untuk pengujian lokal, di **Authentication → Settings** matikan "Confirm email" agar tidak perlu klik link email.
4. Buat akun admin:
   - Daftar lewat aplikasi (atau via Supabase dashboard → Authentication → Add user).
   - Promosikan ke admin lewat SQL Editor:
     ```sql
     update public.profiles set role = 'admin'
     where id = (select id from auth.users where email = 'admin@kampus.id');
     ```

## Setup Lokal

```bash
npm install
cp .env.example .env.local
# isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY dari Project Settings → API
npm run dev
```

Buka http://localhost:3000

## Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Di Vercel → **New Project** → import repo.
3. Tambahkan environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (URL produksi, misal `https://your-app.vercel.app`)
4. Di Supabase **Authentication → URL Configuration**, tambahkan URL Vercel ke "Site URL" dan "Redirect URLs" (`https://your-app.vercel.app/auth/callback`).
5. Deploy. Selesai.

## Struktur

```
supabase/migrations/0001_init.sql   # Skema DB, RLS, trigger, storage bucket
src/
  middleware.ts                     # Refresh sesi & gate halaman
  app/
    layout.tsx, page.tsx, globals.css
    login/, register/, auth/callback/
    dashboard/                      # Dashboard mahasiswa
    pendaftaran-baru/               # Form daftar S2 baru
    pendaftaran-wisuda/             # Form daftar wisuda
    admin/                          # Dashboard admin
    admin/baru/[id]/                # Detail & verifikasi pendaftaran baru
    admin/wisuda/[id]/              # Detail & verifikasi wisuda
  lib/
    supabase/{server,client,middleware}.ts
    actions/{auth,pendaftaran,admin}.ts   # Server Actions
    utils.ts
  components/{navbar,flash,file-link}.tsx
```

## Catatan

- Storage policies membatasi upload pada folder `<user_id>/...`. Admin dapat membaca semua file lewat RLS.
- Verifikasi admin hanya bisa mengubah `status` & `catatan_admin` (RLS).
- Untuk produksi: aktifkan email confirmation dan atur SMTP di Supabase.
