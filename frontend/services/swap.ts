import { db, auth } from "../services/firebase";
import {
  runTransaction,
  doc,
  increment,
  serverTimestamp,
  collection,
} from "firebase/firestore";

export type SwapArgs = {
  fromId: string;
  toId: string;
  amountFrom: number;
  amountTo: number;
  image?: string | null;
  toName?: string;
  toSymbol?: string;
};

export async function swap({
  fromId,
  toId,
  amountFrom,
  amountTo,
  image,
  toName,
  toSymbol,
}: SwapArgs) {
  if (fromId === toId) throw new Error("same-asset");
  if (!(amountFrom > 0) || !(amountTo > 0)) throw new Error("bad-amount");

  const uid = auth.currentUser!.uid;
  const fromRef = doc(db, `users/${uid}/holdings/${fromId}`);
  const toRef = doc(db, `users/${uid}/holdings/${toId}`);
  const txRef = doc(collection(db, `users/${uid}/transactions`));

  await runTransaction(db, async (tx) => {
    // ---- ALL READS FIRST ----
    const [fromSnap, toSnap] = await Promise.all([
      tx.get(fromRef),
      tx.get(toRef),
    ]);

    const have = Number(fromSnap.data()?.amount ?? 0);
    if (have < amountFrom) throw new Error("insufficient-funds");

    const toPrev: any = toSnap.exists() ? toSnap.data() : {};

    // ---- THEN ALL WRITES ----
    const now = serverTimestamp();

    // subtract from source
    tx.set(
      fromRef,
      { amount: increment(-amountFrom), updatedAt: now },
      { merge: true }
    );

    // add to destination + fill metadata once
    const toUpdate: any = {
      amount: increment(amountTo),
      updatedAt: now,
    };
    if (!toPrev.name) toUpdate.name = toName ?? toId;
    if (!toPrev.symbol) toUpdate.symbol = (toSymbol ?? toId).toUpperCase();
    if (!toPrev.image) toUpdate.image = image ?? ""; // never undefined

    tx.set(toRef, toUpdate, { merge: true });

    // transaction record (omit image if undefined)
    const txDoc: any = {
      type: "swap",
      fromId,
      toId,
      amountFrom,
      amountTo,
      createdAt: now,
    };
    if (image) txDoc.image = image;

    tx.set(txRef, txDoc);
  });
}
