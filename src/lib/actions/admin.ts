"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const STATUSES = ["menunggu", "diterima", "ditolak"] as const;
type Status = (typeof STATUSES)[number];

async function assertAdmin() {
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
  return supabase;
}

export async function updateStatusBaru(formData: FormData) {
  const supabase = await assertAdmin();
  const id = Number(formData.get("id"));
  const statusRaw = String(formData.get("status") ?? "");
  const status = (STATUSES as readonly string[]).includes(statusRaw)
    ? (statusRaw as Status)
    : "menunggu";
  const catatan_admin = String(formData.get("catatan_admin") ?? "").trim() || null;

  const { error } = await supabase
    .from("pendaftaran_baru")
    .update({ status, catatan_admin })
    .eq("id", id);

  if (error) {
    redirect(`/admin/baru/${id}?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath(`/admin/baru/${id}`);
  revalidatePath("/admin");
  redirect(`/admin/baru/${id}?info=Status+diperbarui`);
}

export async function updateStatusWisuda(formData: FormData) {
  const supabase = await assertAdmin();
  const id = Number(formData.get("id"));
  const statusRaw = String(formData.get("status") ?? "");
  const status = (STATUSES as readonly string[]).includes(statusRaw)
    ? (statusRaw as Status)
    : "menunggu";
  const catatan_admin = String(formData.get("catatan_admin") ?? "").trim() || null;

  const { error } = await supabase
    .from("pendaftaran_wisuda")
    .update({ status, catatan_admin })
    .eq("id", id);

  if (error) {
    redirect(`/admin/wisuda/${id}?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath(`/admin/wisuda/${id}`);
  revalidatePath("/admin");
  redirect(`/admin/wisuda/${id}?info=Status+diperbarui`);
}

export async function getSignedFileUrl(path: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(path, 60 * 10); // 10 menit
  if (error) return null;
  return data.signedUrl;
}
