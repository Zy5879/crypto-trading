// src/services/transfers.ts
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../services/firebase";

const functions = getFunctions(app);

export async function sendToken(options: {
  toUid: string;
  coinId: string;
  amount: number;
  image?: string;
}) {
  const fn = httpsCallable(functions, "transferToken");
  const res = await fn(options);
  return res.data as { ok: true };
}
