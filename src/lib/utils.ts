export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function statusBadgeClass(status: string): string {
  return (
    {
      menunggu: "bg-amber-100 text-amber-800 border-amber-300",
      diterima: "bg-emerald-100 text-emerald-800 border-emerald-300",
      ditolak: "bg-rose-100 text-rose-800 border-rose-300",
    }[status] ?? "bg-gray-100 text-gray-700 border-gray-300"
  );
}

export const PROGRAM_STUDI = [
  "Magister Manajemen",
  "Magister Ilmu Komputer",
  "Magister Pendidikan",
  "Magister Hukum",
  "Magister Teknik",
  "Magister Ilmu Lingkungan",
];
