import Link from "next/link";
import { submitPendaftaranBaru } from "@/lib/actions/pendaftaran";
import { Flash } from "@/components/flash";
import { PROGRAM_STUDI } from "@/lib/utils";

export default async function DaftarBaruPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; info?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div>
      <h2 className="mb-3 text-xl font-semibold">Formulir Pendaftaran Mahasiswa Baru S2</h2>
      <Flash error={sp.error} info={sp.info} />

      <form action={submitPendaftaranBaru} encType="multipart/form-data" className="card p-6 space-y-6">
        <section>
          <h3 className="mb-3 font-semibold">Data Pribadi</h3>
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-8">
              <label className="label">Nama Lengkap *</label>
              <input name="nama_lengkap" className="input" required />
            </div>
            <div className="md:col-span-4">
              <label className="label">NIK *</label>
              <input name="nik" className="input" required />
            </div>
            <div className="md:col-span-4">
              <label className="label">Tempat Lahir</label>
              <input name="tempat_lahir" className="input" />
            </div>
            <div className="md:col-span-3">
              <label className="label">Tanggal Lahir</label>
              <input type="date" name="tanggal_lahir" className="input" />
            </div>
            <div className="md:col-span-3">
              <label className="label">Jenis Kelamin</label>
              <select name="jenis_kelamin" className="input">
                <option value="">- pilih -</option>
                <option>Laki-laki</option>
                <option>Perempuan</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">No. HP</label>
              <input name="no_hp" className="input" />
            </div>
            <div className="md:col-span-12">
              <label className="label">Alamat</label>
              <textarea name="alamat" className="input" rows={2} />
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold">Pendidikan S1</h3>
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-6">
              <label className="label">Asal Universitas</label>
              <input name="asal_universitas_s1" className="input" />
            </div>
            <div className="md:col-span-4">
              <label className="label">Program Studi</label>
              <input name="program_studi_s1" className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Tahun Lulus</label>
              <input type="number" min="1980" max="2030" name="tahun_lulus_s1" className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="label">IPK S1</label>
              <input type="number" step="0.01" min="0" max="4" name="ipk_s1" className="input" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold">Pilihan Program S2</h3>
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-8">
              <label className="label">Program Studi Tujuan *</label>
              <select name="program_studi_tujuan" className="input" required>
                <option value="">- pilih -</option>
                {PROGRAM_STUDI.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-4">
              <label className="label">Gelombang</label>
              <select name="gelombang" className="input">
                <option value="">- pilih -</option>
                <option>Gelombang 1</option>
                <option>Gelombang 2</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold">Dokumen (PDF/JPG/PNG, maks 5 MB)</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="label">Ijazah S1</label>
              <input type="file" name="file_ijazah" accept=".pdf,.jpg,.jpeg,.png" className="input" />
            </div>
            <div>
              <label className="label">Transkrip S1</label>
              <input type="file" name="file_transkrip" accept=".pdf,.jpg,.jpeg,.png" className="input" />
            </div>
            <div>
              <label className="label">KTP</label>
              <input type="file" name="file_ktp" accept=".pdf,.jpg,.jpeg,.png" className="input" />
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
