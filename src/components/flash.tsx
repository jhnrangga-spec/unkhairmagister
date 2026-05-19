export function Flash({
  error,
  info,
}: {
  error?: string | string[];
  info?: string | string[];
}) {
  const errMsg = Array.isArray(error) ? error[0] : error;
  const infoMsg = Array.isArray(info) ? info[0] : info;
  if (!errMsg && !infoMsg) return null;
  return (
    <div className="mb-4 space-y-2">
      {errMsg && (
        <div className="rounded-md border border-rose-300 bg-rose-50 px-4 py-2 text-sm text-rose-800">
          {errMsg}
        </div>
      )}
      {infoMsg && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {infoMsg}
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const cls = {
    menunggu: "bg-amber-100 text-amber-800 border-amber-300",
    diterima: "bg-emerald-100 text-emerald-800 border-emerald-300",
    ditolak: "bg-rose-100 text-rose-800 border-rose-300",
  }[status] ?? "bg-slate-100 text-slate-700 border-slate-300";
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}
