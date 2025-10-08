import { Router } from "express";
import { db } from "../firebase";

export const holdingsRouter = Router();

holdingsRouter.get("/:id", async (req, res) => {
  try {
    const snap = await db.collection(`users/${req.params.id}/holdings`).get();
    const holdings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(holdings);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});
