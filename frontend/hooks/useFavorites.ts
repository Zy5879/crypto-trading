import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

export type Favorite = {
  id: string;
  name: string;
  symbol: string;
  image?: string;
};

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = auth.currentUser;
    if (!u) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, `users/${u.uid}/favorites`),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setFavorites(
        snap.docs.map((d) => {
          const x = d.data() as any;
          return {
            id: d.id,
            name: x.name,
            symbol: (x.symbol ?? "").toUpperCase(),
            image: x.image ?? "",
          };
        })
      );
      setLoading(false);
    });
    return unsub;
  }, []);

  return { favorites, loading };
}
