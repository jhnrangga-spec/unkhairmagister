import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateStatusBaru } from "@/lib/actions/admin";
import { Flash, StatusBadge } from "@/components/flash";
import { FileLink } from "@/components/file-link";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DetailBaruPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; info?: string }>;
}) {
  const { id } = await params;
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
  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: p } = await supabase
    .from("pendaftaran_baru")
    .select("*")
    .eq("id", Number(id))
    .single();
  if (!p) notFound();

  const { data: u } = await supabase
    .from("profiles")
    .select("nama")
    .eq("id", p.user_id)
    .single();

  return (
    <div>
      <Link href="/admin?tab=baru" className="mb-3 inline-block text-sm text-slate-600 hover:underline">
        &larr; Kembali
      </Link>
      <h2 className="mb-3 text-xl font-semibold">
        Detail Pendaftaran Mahasiswa Baru #{p.id}
      </h2>
      <Flash error={sp.error} info={sp.info} />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          <Card title="Data Pribadi">
            <Row k="Nama Lengkap" v={p.nama_lengkap} />
            <Row k="NIK" v={p.nik} />
            <Row k="Tempat, Tgl Lahir" v={`${p.tempat_lahir ?? "-"}, ${formatDate(p.tanggal_lahir)}`} />
            <Row k="Jenis Kelamin" v={p.jenis_kelamin ?? "-"} />
            <Row k="No. HP" v={p.no_hp ?? "-"} />
            <Row k="Alamat" v={p.alamat ?? "-"} />
            <Row k="Akun" v={u?.nama ?? "-"} />
          </Card>

          <Card title="Pendidikan S1">
            <Row k="Universitas" v={p.asal_universitas_s1 ?? "-"} />
            <Row k="Program Studi" v={p.program_studi_s1 ?? "-"} />
            <Row k="Tahun Lulus" v={p.tahun_lulus_s1 ?? "-"} />
            <Row k="IPK" v={p.ipk_s1 ?? "-"} />
          </Card>

          <Card title="Pilihan Program S2">
            <Row k="Program Studi Tujuan" v={p.program_studi_tujuan} />
            <Row k="Gelombang" v={p.gelombang ?? "-"} />
          </Card>

          <Card title="Dokumen">
            <ul className="space-y-1 text-sm">
              <FileLink label="Ijazah S1" path={p.file_ijazah} />
              <FileLink label="Transkrip S1" path={p.file_transkrip} />
              <FileLink label="KTP" path={p.file_ktp} />
            </ul>
          </Card>
        </div>

        <div>
          <div className="card p-4">
            <h3 className="mb-2 font-semibold">Verifikasi</h3>
            <p className="mb-3 text-sm">
              Status: <StatusBadge status={p.status} />
            </p>
            <form action={updateStatusBaru} className="space-y-3">
              <input type="hidden" name="id" value={p.id} />
              <div>
                <label className="label">Ubah Status</label>
                <select name="status" defaultValue={p.status} className="input">
                  <option value="menunggu">Menunggu</option>
                  <option value="diterima">Diterima</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>
              <div>
                <label className="label">Catatan</label>
                <textarea name="catatan_admin" rows={4} defaultValue={p.catatan_admin ?? ""} className="input" />
              </div>
              <button type="submit" className="btn-primary w-full">Simpan</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <dl className="grid grid-cols-3 gap-y-1 text-sm">{children}</dl>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <>
      <dt className="col-span-1 text-slate-500">{k}</dt>
      <dd className="col-span-2">{v}</dd>
    </>
  );
}
