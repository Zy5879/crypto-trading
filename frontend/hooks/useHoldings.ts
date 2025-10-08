import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { auth, db } from "../services/firebase";

export type HoldingDoc = {
  symbol: string;
  name: string;
  amount: number;
  // optional fields you may store:
  avg_cost_basis?: number;
  invested_usd?: number;
};

export type RowItem = {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  valueUsd: number; // computed later (0 for now)
  deltaUsd24h: number; // computed later (0 for now)
};

export function useHoldings() {
  const [data, setData] = useState<RowItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) {
      setData([]);
      setLoading(false);
      return;
    }

    const colRef = collection(db, `users/${u.uid}/holdings`);
    const unsub = onSnapshot(
      colRef,
      (snap: QuerySnapshot<DocumentData>) => {
        const rows = snap.docs.map((d) => {
          const h = d.data() as HoldingDoc;
          return {
            id: d.id,
            name: h.name,
            symbol: h.symbol,
            amount: h.amount,
            valueUsd: 0, // you can join prices later
            deltaUsd24h: 0, // you can compute 24h P/L later
          } satisfies RowItem;
        });
        setData(rows);
        setLoading(false);
      },
      (e) => {
        setError(e as Error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { data: data ?? [], loading, error };
}
