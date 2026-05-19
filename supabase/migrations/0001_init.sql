-- =========================================================
-- Skema awal: profiles, pendaftaran mahasiswa baru S2,
-- pendaftaran wisuda S2, plus RLS dan storage bucket.
-- Jalankan di Supabase SQL editor atau via `supabase db push`.
-- =========================================================

-- ---------- Enum status ----------
do $$ begin
  create type public.status_pendaftaran as enum ('menunggu', 'diterima', 'ditolak');
exception when duplicate_object then null; end $$;

-- ---------- Profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text not null,
  role text not null default 'mahasiswa' check (role in ('mahasiswa', 'admin')),
  created_at timestamptz not null default now()
);

-- Auto-create profile saat user baru sign up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nama, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nama', split_part(new.email, '@', 1)),
    'mahasiswa'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: cek apakah user saat ini admin (SECURITY DEFINER untuk hindari rekursi RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ---------- Pendaftaran Mahasiswa Baru S2 ----------
create table if not exists public.pendaftaran_baru (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,

  nama_lengkap text not null,
  nik text not null,
  tempat_lahir text,
  tanggal_lahir date,
  jenis_kelamin text check (jenis_kelamin in ('Laki-laki', 'Perempuan')),
  alamat text,
  no_hp text,

  asal_universitas_s1 text,
  program_studi_s1 text,
  tahun_lulus_s1 int,
  ipk_s1 numeric(3, 2),

  program_studi_tujuan text not null,
  gelombang text,

  file_ijazah text,
  file_transkrip text,
  file_ktp text,

  status public.status_pendaftaran not null default 'menunggu',
  catatan_admin text,
  created_at timestamptz not null default now()
);

create index if not exists idx_pendaftaran_baru_user on public.pendaftaran_baru(user_id);
create index if not exists idx_pendaftaran_baru_status on public.pendaftaran_baru(status);

-- ---------- Pendaftaran Wisuda S2 ----------
create table if not exists public.pendaftaran_wisuda (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,

  nama_lengkap text not null,
  nim text not null,
  program_studi text not null,
  judul_tesis text not null,
  pembimbing_1 text,
  pembimbing_2 text,
  tanggal_yudisium date,
  ipk numeric(3, 2),
  no_hp text,

  file_ijazah_s1 text,
  file_transkrip text,
  file_lembar_pengesahan text,
  file_bebas_pustaka text,

  status public.status_pendaftaran not null default 'menunggu',
  catatan_admin text,
  created_at timestamptz not null default now()
);

create index if not exists idx_pendaftaran_wisuda_user on public.pendaftaran_wisuda(user_id);
create index if not exists idx_pendaftaran_wisuda_status on public.pendaftaran_wisuda(status);

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.pendaftaran_baru enable row level security;
alter table public.pendaftaran_wisuda enable row level security;

-- Profiles: user lihat/edit miliknya, admin lihat semua
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Pendaftaran baru
drop policy if exists "pb_select_own_or_admin" on public.pendaftaran_baru;
create policy "pb_select_own_or_admin" on public.pendaftaran_baru
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "pb_insert_own" on public.pendaftaran_baru;
create policy "pb_insert_own" on public.pendaftaran_baru
  for insert with check (user_id = auth.uid());

drop policy if exists "pb_update_admin" on public.pendaftaran_baru;
create policy "pb_update_admin" on public.pendaftaran_baru
  for update using (public.is_admin()) with check (public.is_admin());

-- Pendaftaran wisuda
drop policy if exists "pw_select_own_or_admin" on public.pendaftaran_wisuda;
create policy "pw_select_own_or_admin" on public.pendaftaran_wisuda
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "pw_insert_own" on public.pendaftaran_wisuda;
create policy "pw_insert_own" on public.pendaftaran_wisuda
  for insert with check (user_id = auth.uid());

drop policy if exists "pw_update_admin" on public.pendaftaran_wisuda;
create policy "pw_update_admin" on public.pendaftaran_wisuda
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------- Storage bucket: documents ----------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Path konvensi: <user_id>/<jenis>/<filename>
drop policy if exists "documents_user_insert" on storage.objects;
create policy "documents_user_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "documents_user_select" on storage.objects;
create policy "documents_user_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

drop policy if exists "documents_user_update" on storage.objects;
create policy "documents_user_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "documents_user_delete" on storage.objects;
create policy "documents_user_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );
