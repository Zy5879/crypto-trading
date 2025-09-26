import { Router } from "express";

export const getCoin = Router();

getCoin.get("/", async (_req, res) => {
  try {
    const url =
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=layer-1&price_change_percentage=24h&per_page=250&sparkline=true";

    const response = await fetch(url, {
      method: "GET",
      headers: { "x-cg-demo-api-key": process.env.COINGECKOAPI as string },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.log(err);
  }
});

getCoin.get("/trending", async (_req, res) => {
  try {
    const url = "https://api.coingecko.com/api/v3/search/trending";

    const response = await fetch(url, {
      method: "GET",
      headers: { "x-cg-demo-api-key": process.env.COINGECKOAPI as string },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.log(err);
  }
});

getCoin.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${id}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "x-cg-demo-api-key": process.env.COINGECKOAPI as string },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.log(err);
  }
});
