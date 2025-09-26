import { MarketCoin } from "../models/MarketCoinModel";

export async function fetchMarket(): Promise<MarketCoin[]> {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=layer-1&price_change_percentage=24h&per_page=250&sparkline=true",
    {
      headers: {
        method: "GET",
        "x-cg-demo-api-key": process.env.EXPO_PUBLIC_API_KEY,
      },
    }
  );

  const data = await response.json();
  if (!data) {
    throw new Error(`HTTP ${response.status}`);
  }

  return data;
}
