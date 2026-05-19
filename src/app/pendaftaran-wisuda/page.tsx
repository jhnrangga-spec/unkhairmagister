import Link from "next/link";
import { submitPendaftaranWisuda } from "@/lib/actions/pendaftaran";
import { Flash } from "@/components/flash";
import { PROGRAM_STUDI } from "@/lib/utils";

export default async function DaftarWisudaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; info?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div>
      <h2 className="mb-3 text-xl font-semibold">Formulir Pendaftaran Wisuda S2</h2>
      <Flash error={sp.error} info={sp.info} />

      <form action={submitPendaftaranWisuda} encType="multipart/form-data" className="card p-6 space-y-6">
        <section>
          <h3 className="mb-3 font-semibold">Data Mahasiswa</h3>
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-7">
              <label className="label">Nama Lengkap *</label>
              <input name="nama_lengkap" className="input" required />
            </div>
            <div className="md:col-span-3">
              <label className="label">NIM *</label>
              <input name="nim" className="input" required />
            </div>
            <div className="md:col-span-2">
              <label className="label">No. HP</label>
              <input name="no_hp" className="input" />
            </div>
            <div className="md:col-span-6">
              <label className="label">Program Studi *</label>
              <select name="program_studi" className="input" required>
                <option value="">- pilih -</option>
                {PROGRAM_STUDI.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="label">IPK</label>
              <input type="number" step="0.01" min="0" max="4" name="ipk" className="input" />
            </div>
            <div className="md:col-span-3">
              <label className="label">Tanggal Yudisium</label>
              <input type="date" name="tanggal_yudisium" className="input" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold">Data Tesis</h3>
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-12">
              <label className="label">Judul Tesis *</label>
              <textarea name="judul_tesis" rows={2} className="input" required />
            </div>
            <div className="md:col-span-6">
              <label className="label">Pembimbing 1</label>
              <input name="pembimbing_1" className="input" />
            </div>
            <div className="md:col-span-6">
              <label className="label">Pembimbing 2</label>
              <input name="pembimbing_2" className="input" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold">Dokumen Syarat (PDF/JPG/PNG, maks 5 MB)</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="label">Salinan Ijazah S1</label>
              <input type="file" name="file_ijazah_s1" accept=".pdf,.jpg,.jpeg,.png" className="input" />
            </div>
            <div>
              <label className="label">Transkrip Nilai S2</label>
              <input type="file" name="file_transkrip" accept=".pdf,.jpg,.jpeg,.png" className="input" />
            </div>
            <div>
              <label className="label">Lembar Pengesahan Tesis</label>
              <input type="file" name="file_lembar_pengesahan" accept=".pdf,.jpg,.jpeg,.png" className="input" />
            </div>
            <div>
              <label className="label">Surat Bebas Pustaka</label>
              <input type="file" name="file_bebas_pustaka" accept=".pdf,.jpg,.jpeg,.png" className="input" />
            </div>
          </div>
        </section>

        <div className="flex gap-2">
          <button className="btn-primary" type="submit">Kirim Pendaftaran</button>
          <Link href="/dashboard" className="btn-outline">Batal</Link>
        </div>
      </form>
    </div>
  );
}
