import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/flash";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SP = { tab?: string; status?: string };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const tab = sp.tab === "wisuda" ? "wisuda" : "baru";
  const status = sp.status ?? "semua";

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
  if (profile?.role !== "admin") redirect("/dashboard");

  let baruQuery = supabase
    .from("pendaftaran_baru")
    .select("id, created_at, nama_lengkap, program_studi_tujuan, gelombang, status, user_id")
    .order("created_at", { ascending: false });
  let wisudaQuery = supabase
    .from("pendaftaran_wisuda")
    .select("id, created_at, nama_lengkap, nim, program_studi, ipk, status, user_id")
    .order("created_at", { ascending: false });
  if (status !== "semua") {
    baruQuery = baruQuery.eq("status", status);
    wisudaQuery = wisudaQuery.eq("status", status);
  }

  const [{ data: baruList }, { data: wisudaList }] = await Promise.all([
    baruQuery,
    wisudaQuery,
  ]);

  const [
    { count: baruTotal },
    { count: baruMenunggu },
    { count: wisudaTotal },
    { count: wisudaMenunggu },
  ] = await Promise.all([
    supabase.from("pendaftaran_baru").select("*", { count: "exact", head: true }),
    supabase
      .from("pendaftaran_baru")
      .select("*", { count: "exact", head: true })
      .eq("status", "menunggu"),
    supabase.from("pendaftaran_wisuda").select("*", { count: "exact", head: true }),
    supabase
      .from("pendaftaran_wisuda")
      .select("*", { count: "exact", head: true })
      .eq("status", "menunggu"),
  ]);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Dashboard Admin</h2>

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <StatCard label="Total Pendaftar Baru" value={baruTotal ?? 0} />
        <StatCard label="Baru Menunggu" value={baruMenunggu ?? 0} accent="text-amber-600" />
        <StatCard label="Total Pendaftar Wisuda" value={wisudaTotal ?? 0} />
        <StatCard label="Wisuda Menunggu" value={wisudaMenunggu ?? 0} accent="text-amber-600" />
      </div>

      <div className="border-b">
        <nav className="flex gap-1 text-sm">
          <TabLink href={`/admin?tab=baru&status=${status}`} active={tab === "baru"}>
            Pendaftaran Mahasiswa Baru
          </TabLink>
          <TabLink href={`/admin?tab=wisuda&status=${status}`} active={tab === "wisuda"}>
            Pendaftaran Wisuda
          </TabLink>
        </nav>
      </div>

      <div className="card rounded-t-none border-t-0 p-4">
        <form className="mb-3 flex items-end gap-2">
          <input type="hidden" name="tab" value={tab} />
          <div>
            <label className="label">Filter Status</label>
            <select name="status" defaultValue={status} className="input">
              {["semua", "menunggu", "diterima", "ditolak"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button className="btn-outline" type="submit">Terapkan</button>
        </form>

        {tab === "baru" ? (
          <TableBaru rows={baruList ?? []} />
        ) : (
          <TableWisuda rows={wisudaList ?? []} />
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="card p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-2xl font-semibold ${accent ?? ""}`}>{value}</div>
    </div>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-t-md border border-b-0 px-4 py-2 ${
        active
          ? "border-slate-200 bg-white font-medium text-brand"
          : "border-transparent text-slate-600 hover:text-slate-900"
      }`}
    >
      {children}
    </Link>
  );
}

function TableBaru({
  rows,
}: {
  rows: Array<{
    id: number;
    created_at: string;
    nama_lengkap: string;
    program_studi_tujuan: string;
    gelombang: string | null;
    status: string;
  }>;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">Tidak ada data.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-600">
          <tr>
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Tanggal</th>
            <th className="px-3 py-2">Nama</th>
            <th className="px-3 py-2">Prodi Tujuan</th>
            <th className="px-3 py-2">Gelombang</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-3 py-2">{r.id}</td>
              <td className="px-3 py-2">{formatDateTime(r.created_at)}</td>
              <td className="px-3 py-2">{r.nama_lengkap}</td>
              <td className="px-3 py-2">{r.program_studi_tujuan}</td>
              <td className="px-3 py-2">{r.gelombang ?? "-"}</td>
              <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
              <td className="px-3 py-2">
                <Link className="btn-outline px-2 py-1 text-xs" href={`/admin/baru/${r.id}`}>
                  Detail
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableWisuda({
  rows,
}: {
  rows: Array<{
    id: number;
    created_at: string;
    nama_lengkap: string;
    nim: string;
    program_studi: string;
    ipk: number | null;
    status: string;
  }>;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">Tidak ada data.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-600">
          <tr>
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Tanggal</th>
            <th className="px-3 py-2">Nama</th>
            <th className="px-3 py-2">NIM</th>
            <th className="px-3 py-2">Prodi</th>
            <th className="px-3 py-2">IPK</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="px-3 py-2">{r.id}</td>
              <td className="px-3 py-2">{formatDateTime(r.created_at)}</td>
              <td className="px-3 py-2">{r.nama_lengkap}</td>
              <td className="px-3 py-2">{r.nim}</td>
              <td className="px-3 py-2">{r.program_studi}</td>
              <td className="px-3 py-2">{r.ipk ?? "-"}</td>
              <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
              <td className="px-3 py-2">
                <Link className="btn-outline px-2 py-1 text-xs" href={`/admin/wisuda/${r.id}`}>
                  Detail
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
