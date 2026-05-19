import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export default async function Navbar() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  let nama: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, nama")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? "mahasiswa";
    nama = profile?.nama ?? user.email ?? null;
  }

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold">
          <span className="text-brand">SIM</span> Magister
        </Link>
        <div className="flex items-center gap-1 text-sm">
          {!user ? (
            <>
              <Link href="/login" className="btn-ghost">Login</Link>
              <Link href="/register" className="btn-primary">Daftar Akun</Link>
            </>
          ) : (
            <>
              {role === "admin" ? (
                <Link href="/admin" className="btn-ghost">Admin</Link>
              ) : (
                <>
                  <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
                  <Link href="/pendaftaran-baru" className="btn-ghost">
                    Daftar Baru
                  </Link>
                  <Link href="/pendaftaran-wisuda" className="btn-ghost">
                    Daftar Wisuda
                  </Link>
                </>
              )}
              <span className="px-2 text-slate-500">Hi, {nama}</span>
              <form action={signOut}>
                <button className="btn-ghost text-rose-600" type="submit">
                  Logout
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
