import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Flash, StatusBadge } from "@/components/flash";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ info?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role === "admin") redirect("/admin");

  const { data: pb } = await supabase
    .from("pendaftaran_baru")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: pw } = await supabase
    .from("pendaftaran_wisuda")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Dashboard Mahasiswa</h2>
        <div className="flex gap-2">
          <Link href="/pendaftaran-baru" className="btn-primary">+ Pendaftaran Baru S2</Link>
          <Link href="/pendaftaran-wisuda" className="btn-outline">+ Pendaftaran Wisuda</Link>
        </div>
      </div>

      <Flash error={sp.error} info={sp.info} />

      <section className="card mb-4 p-4">
        <h3 className="mb-3 font-semibold">Pendaftaran Mahasiswa Baru S2</h3>
        {pb && pb.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-3 py-2">Tanggal</th>
                  <th className="px-3 py-2">Program Studi</th>
                  <th className="px-3 py-2">Gelombang</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {pb.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2">{formatDateTime(p.created_at)}</td>
                    <td className="px-3 py-2">{p.program_studi_tujuan}</td>
                    <td className="px-3 py-2">{p.gelombang ?? "-"}</td>
                    <td className="px-3 py-2"><StatusBadge status={p.status} /></td>
                    <td className="px-3 py-2 text-slate-600">{p.catatan_admin ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Belum ada pendaftaran.</p>
        )}
      </section>

      <section className="card p-4">
        <h3 className="mb-3 font-semibold">Pendaftaran Wisuda S2</h3>
        {pw && pw.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-3 py-2">Tanggal</th>
                  <th className="px-3 py-2">NIM</th>
                  <th className="px-3 py-2">Program Studi</th>
                  <th className="px-3 py-2">IPK</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {pw.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2">{formatDateTime(p.created_at)}</td>
                    <td className="px-3 py-2">{p.nim}</td>
                    <td className="px-3 py-2">{p.program_studi}</td>
                    <td className="px-3 py-2">{p.ipk ?? "-"}</td>
                    <td className="px-3 py-2"><StatusBadge status={p.status} /></td>
                    <td className="px-3 py-2 text-slate-600">{p.catatan_admin ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Belum ada pendaftaran wisuda.</p>
        )}
      </section>
    </div>
  );
}
