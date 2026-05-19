import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { Flash } from "@/components/flash";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; info?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h2 className="mb-4 text-xl font-semibold">Buat Akun Mahasiswa</h2>
        <Flash error={sp.error} info={sp.info} />
        <form action={signUp} className="space-y-3">
          <div>
            <label className="label">Nama Lengkap</label>
            <input name="nama" className="input" required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" name="email" className="input" required />
          </div>
          <div>
            <label className="label">Password (min. 6 karakter)</label>
            <input type="password" name="password" className="input" required />
          </div>
          <div>
            <label className="label">Konfirmasi Password</label>
            <input type="password" name="password2" className="input" required />
          </div>
          <button className="btn-primary w-full" type="submit">Daftar</button>
        </form>
        <p className="mt-3 text-sm text-slate-600">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-brand hover:underline">Login</Link>.
        </p>
      </div>
    </div>
  );
}
