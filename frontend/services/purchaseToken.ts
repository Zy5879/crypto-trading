// src/services/trading.ts
import {
  doc,
  collection,
  runTransaction,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";

export async function purchaseToken(params: {
  coinId: string; // "bitcoin"
  name: string; // "Bitcoin"
  symbol: string; // "BTC"
  image?: string; // logo url (optional)
  priceUsd: number; // current price (from RTKQ)
  usdAmount: number; // how much user wants to spend
}) {
  const u = auth.currentUser;
  if (!u) throw new Error("Not signed in");
  if (!(params.priceUsd > 0) || !(params.usdAmount > 0)) {
    throw new Error("Enter positive amount and valid price");
  }

  const qty = params.usdAmount / params.priceUsd;

  const userRef = doc(db, `users/${u.uid}`);
  const holdingRef = doc(db, `users/${u.uid}/holdings/${params.coinId}`);
  const txRef = doc(collection(db, `users/${u.uid}/transactions`));

  await runTransaction(db, async (tx) => {
    // read current holding (if any)
    const snap = await tx.get(holdingRef);
    const prev = snap.exists() ? (snap.data() as any) : {};

    const prevAmt = Number(prev.amount ?? 0);
    const prevInv = Number(prev.invested_usd ?? 0);

    const newAmt = prevAmt + qty;
    const newInv = prevInv + params.usdAmount;
    const newAvg = newAmt > 0 ? newInv / newAmt : 0;

    // upsert holding
    tx.set(
      holdingRef,
      {
        name: params.name,
        symbol: params.symbol,
        image: params.image ?? prev.image ?? "",
        amount: newAmt,
        invested_usd: newInv,
        avg_cost_basis: newAvg,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // add a transaction record
    tx.set(txRef, {
      type: "BUY",
      coinId: params.coinId,
      symbol: params.symbol,
      qty,
      priceUsd: params.priceUsd,
      usdAmount: params.usdAmount,
      createdAt: serverTimestamp(),
    });

    // bump user's total_invested (atomic)
    tx.set(
      userRef,
      {
        total_invested: increment(params.usdAmount),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });

  return { qty };
}
