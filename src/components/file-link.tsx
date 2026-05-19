import { getSignedFileUrl } from "@/lib/actions/admin";

export async function FileLink({
  path,
  label,
}: {
  path: string | null;
  label: string;
}) {
  if (!path) {
    return (
      <li>
        {label}: <span className="text-slate-500">-</span>
      </li>
    );
  }
  const url = await getSignedFileUrl(path);
  return (
    <li>
      {label}:{" "}
      {url ? (
        <a className="text-brand hover:underline" href={url} target="_blank" rel="noreferrer">
          lihat
        </a>
      ) : (
        <span className="text-slate-500">tidak tersedia</span>
      )}
    </li>
  );
}
