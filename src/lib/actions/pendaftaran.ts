"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/utils";

async function uploadIfPresent(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  prefix: string,
  file: File | null,
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error(`Format file '${file.name}' tidak diizinkan (PDF/JPG/PNG).`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Ukuran file '${file.name}' melebihi 5 MB.`);
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${userId}/${prefix}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("documents")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(`Gagal upload ${prefix}: ${error.message}`);
  return path;
}

function num(v: FormDataEntryValue | null): number | null {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function str(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

export async function submitPendaftaranBaru(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const nama_lengkap = str(formData.get("nama_lengkap"));
  const nik = str(formData.get("nik"));
  const program_studi_tujuan = str(formData.get("program_studi_tujuan"));

  if (!nama_lengkap || !nik || !program_studi_tujuan) {
    redirect("/pendaftaran-baru?error=Nama%2C+NIK%2C+dan+program+studi+tujuan+wajib+diisi");
  }

  let file_ijazah: string | null = null;
  let file_transkrip: string | null = null;
  let file_ktp: string | null = null;
  try {
    file_ijazah = await uploadIfPresent(
      supabase, user.id, "ijazah_s1", formData.get("file_ijazah") as File | null,
    );
    file_transkrip = await uploadIfPresent(
      supabase, user.id, "transkrip_s1", formData.get("file_transkrip") as File | null,
    );
    file_ktp = await uploadIfPresent(
      supabase, user.id, "ktp", formData.get("file_ktp") as File | null,
    );
  } catch (e) {
    redirect(`/pendaftaran-baru?error=${encodeURIComponent((e as Error).message)}`);
  }

  const { error } = await supabase.from("pendaftaran_baru").insert({
    user_id: user.id,
    nama_lengkap,
    nik,
    tempat_lahir: str(formData.get("tempat_lahir")),
    tanggal_lahir: str(formData.get("tanggal_lahir")),
    jenis_kelamin: str(formData.get("jenis_kelamin")),
    alamat: str(formData.get("alamat")),
    no_hp: str(formData.get("no_hp")),
    asal_universitas_s1: str(formData.get("asal_universitas_s1")),
    program_studi_s1: str(formData.get("program_studi_s1")),
    tahun_lulus_s1: num(formData.get("tahun_lulus_s1")),
    ipk_s1: num(formData.get("ipk_s1")),
    program_studi_tujuan,
    gelombang: str(formData.get("gelombang")),
    file_ijazah,
    file_transkrip,
    file_ktp,
  });

  if (error) {
    redirect(`/pendaftaran-baru?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/dashboard");
  redirect("/dashboard?info=Pendaftaran+mahasiswa+baru+berhasil+dikirim");
}

export async function submitPendaftaranWisuda(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const nama_lengkap = str(formData.get("nama_lengkap"));
  const nim = str(formData.get("nim"));
  const program_studi = str(formData.get("program_studi"));
  const judul_tesis = str(formData.get("judul_tesis"));

  if (!nama_lengkap || !nim || !program_studi || !judul_tesis) {
    redirect("/pendaftaran-wisuda?error=Nama%2C+NIM%2C+program+studi%2C+dan+judul+tesis+wajib+diisi");
  }

  let file_ijazah_s1: string | null = null;
  let file_transkrip: string | null = null;
  let file_lembar_pengesahan: string | null = null;
  let file_bebas_pustaka: string | null = null;
  try {
    file_ijazah_s1 = await uploadIfPresent(
      supabase, user.id, "wisuda_ijazah_s1", formData.get("file_ijazah_s1") as File | null,
    );
    file_transkrip = await uploadIfPresent(
      supabase, user.id, "wisuda_transkrip", formData.get("file_transkrip") as File | null,
    );
    file_lembar_pengesahan = await uploadIfPresent(
      supabase, user.id, "wisuda_pengesahan", formData.get("file_lembar_pengesahan") as File | null,
    );
    file_bebas_pustaka = await uploadIfPresent(
      supabase, user.id, "wisuda_bebas_pustaka", formData.get("file_bebas_pustaka") as File | null,
    );
  } catch (e) {
    redirect(`/pendaftaran-wisuda?error=${encodeURIComponent((e as Error).message)}`);
  }

  const { error } = await supabase.from("pendaftaran_wisuda").insert({
    user_id: user.id,
    nama_lengkap,
    nim,
    program_studi,
    judul_tesis,
    pembimbing_1: str(formData.get("pembimbing_1")),
    pembimbing_2: str(formData.get("pembimbing_2")),
    tanggal_yudisium: str(formData.get("tanggal_yudisium")),
    ipk: num(formData.get("ipk")),
    no_hp: str(formData.get("no_hp")),
    file_ijazah_s1,
    file_transkrip,
    file_lembar_pengesahan,
    file_bebas_pustaka,
  });

  if (error) {
    redirect(`/pendaftaran-wisuda?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/dashboard");
  redirect("/dashboard?info=Pendaftaran+wisuda+berhasil+dikirim");
}
