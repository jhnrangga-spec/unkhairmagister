import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <section className="rounded-2xl bg-gradient-to-br from-brand to-indigo-700 p-8 text-white md:p-12">
        <h1 className="text-3xl font-bold md:text-4xl">
          Pendaftaran Mahasiswa Magister (S2)
        </h1>
        <p className="mt-3 max-w-2xl text-white/90">
          Satu portal untuk pendaftaran mahasiswa baru dan pendaftaran wisuda
          program Magister.
        </p>
        <div className="mt-6 flex gap-2">
          {user ? (
            <Link href="/dashboard" className="btn bg-white text-brand hover:bg-slate-100">
              Ke Dashboard
            </Link>
          ) : (
            <>
              <Link href="/register" className="btn bg-white text-brand hover:bg-slate-100">
                Buat Akun
              </Link>
              <Link href="/login" className="btn border border-white/40 text-white hover:bg-white/10">
                Masuk
              </Link>
            </>
          )}
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg font-semibold">Pendaftaran Mahasiswa Baru S2</h3>
          <p className="mt-2 text-sm text-slate-600">
            Lengkapi data pribadi, riwayat pendidikan S1, dan upload dokumen
            (ijazah, transkrip, KTP).
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Data pribadi & alamat</li>
            <li>Pendidikan S1 + IPK</li>
            <li>Pilihan program studi & gelombang</li>
          </ul>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold">Pendaftaran Wisuda S2</h3>
          <p className="mt-2 text-sm text-slate-600">
            Daftarkan diri untuk wisuda dengan melengkapi data akademik dan
            dokumen syarat.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>NIM, program studi, judul tesis</li>
            <li>IPK & tanggal yudisium</li>
            <li>Upload lembar pengesahan & bebas pustaka</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
