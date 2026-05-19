# SIM Magister — Pendaftaran Mahasiswa Baru & Wisuda S2

Aplikasi web sederhana untuk pendaftaran mahasiswa baru program Magister (S2) dan pendaftaran wisuda S2. Dibangun dengan Flask + SQLite.

## Fitur

- Registrasi & login akun mahasiswa
- Formulir pendaftaran mahasiswa baru S2 (data pribadi, pendidikan S1, prodi tujuan, upload ijazah/transkrip/KTP)
- Formulir pendaftaran wisuda S2 (NIM, judul tesis, pembimbing, IPK, upload syarat)
- Dashboard mahasiswa: riwayat & status pendaftaran
- Dashboard admin: verifikasi, approve/reject, beri catatan, filter status
- Upload file aman (PDF/JPG/PNG, maks 5 MB) dengan kontrol akses

## Cara Menjalankan

```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Buka http://localhost:5000

## Akun Default

- **Admin**: `admin@magister.local` / `admin123`
- Mahasiswa: registrasi mandiri lewat halaman *Daftar Akun*.

> Ubah password admin default sebelum dipakai produksi. Set juga environment variable `SECRET_KEY`.

## Struktur

```
app.py                 # Aplikasi Flask + model + route
requirements.txt
templates/
  base.html, index.html, login.html, register.html, error.html
  student/             # dashboard, daftar_baru, daftar_wisuda
  admin/               # dashboard, detail_baru, detail_wisuda
uploads/               # File upload (dibuat otomatis)
magister.db            # SQLite (dibuat otomatis saat pertama jalan)
```

## Catatan Produksi

- Ganti `SECRET_KEY` (env var) dengan nilai acak yang kuat.
- Ganti password admin default.
- Pertimbangkan database yang lebih kuat (PostgreSQL/MySQL) dan storage berkas terpisah.
- Tambahkan HTTPS di depan (reverse proxy) sebelum deploy publik.
