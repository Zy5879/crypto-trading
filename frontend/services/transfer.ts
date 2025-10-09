import { auth } from "../services/firebase";

export async function sendTokenViaServer(opts: {
  toUid: string;
  coinId: string;
  amount: number;
  image?: string;
}) {
  const idToken = await auth.currentUser?.getIdToken(true);
  const res = await fetch("http://localhost:8000/transfer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ ...opts, meta: { image: opts.image ?? null } }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "transfer failed");
  return data as { ok: true };
}
