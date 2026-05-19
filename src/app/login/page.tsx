import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import { Flash } from "@/components/flash";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; info?: string; next?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h2 className="mb-4 text-xl font-semibold">Login</h2>
        <Flash error={sp.error} info={sp.info} />
        <form action={signIn} className="space-y-3">
          <input type="hidden" name="next" value={sp.next ?? "/dashboard"} />
          <div>
            <label className="label">Email</label>
            <input type="email" name="email" className="input" required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" name="password" className="input" required />
          </div>
          <button className="btn-primary w-full" type="submit">Masuk</button>
        </form>
        <p className="mt-3 text-sm text-slate-600">
          Belum punya akun?{" "}
          <Link href="/register" className="text-brand hover:underline">
            Daftar di sini
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
