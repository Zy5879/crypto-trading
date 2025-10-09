// backend/src/routes/transfer.ts
import { Router } from "express";
import { db, authAdmin, FieldValue } from "../firebase";

const transfer = Router();
const round8 = (n: number) => Math.round(n * 1e8) / 1e8;

transfer.post("/", async (req, res) => {
  try {
    // verify Firebase Auth ID token from the client
    const token =
      req.headers.authorization?.replace("Bearer ", "") ||
      (req.body.idToken as string);
    if (!token) return res.status(401).json({ error: "missing idToken" });

    const decoded = await authAdmin.verifyIdToken(token);
    const fromUid = decoded.uid;

    const { toUid, coinId, amount, meta } = req.body ?? {};
    const amt = Number(amount);
    if (!toUid || !coinId || !Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ error: "bad args" });
    }
    if (toUid === fromUid) {
      return res.status(400).json({ error: "cannot send to yourself" });
    }

    const senderRef = db.doc(`users/${fromUid}/holdings/${coinId}`);
    const recipientRef = db.doc(`users/${toUid}/holdings/${coinId}`);

    await db.runTransaction(async (tx) => {
      const [sSnap, rSnap] = await Promise.all([
        tx.get(senderRef),
        tx.get(recipientRef),
      ]);

      const s = sSnap.exists ? sSnap.data()! : {};
      const r = rSnap.exists ? rSnap.data()! : {};

      const sBal = Number(s.amount ?? 0);
      if (sBal < amt) throw new Error("insufficient balance");

      const newS = round8(sBal - amt);
      const newR = round8(Number(r.amount ?? 0) + amt);

      tx.set(
        senderRef,
        { amount: newS, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );

      tx.set(
        recipientRef,
        {
          amount: newR,
          name: r.name ?? s.name ?? coinId,
          symbol: r.symbol ?? s.symbol ?? coinId.toUpperCase(),
          image: r.image ?? s.image ?? meta?.image ?? null,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      const txId = db.collection("_").doc().id;
      const createdAt = FieldValue.serverTimestamp();

      tx.set(db.doc(`users/${fromUid}/transactions/${txId}`), {
        type: "send",
        coinId,
        amount: amt,
        fromUid,
        toUid,
        createdAt,
      });

      tx.set(db.doc(`users/${toUid}/transactions/${txId}`), {
        type: "receive",
        coinId,
        amount: amt,
        fromUid,
        toUid,
        createdAt,
      });
    });

    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? "transfer failed" });
  }
});

export default transfer;
