import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type MarketCoin = {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  current_price: number;
  price_change_percentage_24h_in_currency?: number;
};

export type SearchResult = {
  id: string;
  name: string;
  symbol: string;
  image: string; // from thumb/large
};

export const marketApi = createApi({
  reducerPath: "marketApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.coingecko.com/api/v3",
    prepareHeaders: (h) => {
      const key =
        process.env.EXPO_PUBLIC_COINGECKO_KEY || process.env.COINGECKO_KEY;
      if (key) h.set("x-cg-demo-api-key", key);
      return h;
    },
  }),
  keepUnusedDataFor: 24 * 60 * 60, // seconds (24h)
  endpoints: (build) => ({
    getMarket: build.query<
      MarketCoin[],
      { category?: string; perPage?: number; vs?: "usd" | "eur" | "gbp" }
    >({
      query: ({ category = "layer-1", perPage = 250, vs = "usd" } = {}) =>
        `/coins/markets?vs_currency=${vs}&category=${encodeURIComponent(
          category
        )}&per_page=${perPage}&price_change_percentage=24h`,
    }),

    // 🔎 Search any asset by text
    searchCoins: build.query<SearchResult[], { q: string }>({
      query: ({ q }) => `/search?query=${encodeURIComponent(q)}`,
      transformResponse: (r: any): SearchResult[] =>
        (r?.coins ?? []).map((c: any) => ({
          id: c.id,
          name: c.name,
          symbol: c.symbol?.toUpperCase?.() ?? "",
          image: c.thumb || c.large || "",
        })),
    }),

    // 💲 Fetch price for one or many coin ids
    getMarketByIds: build.query<MarketCoin[], { ids: string[]; vs?: "usd" }>({
      query: ({ ids, vs = "usd" }) =>
        `/coins/markets?vs_currency=${vs}&ids=${ids.join(
          ","
        )}&price_change_percentage=24h`,
    }),
  }),
});

export const {
  useGetMarketQuery,
  useLazySearchCoinsQuery,
  useGetMarketByIdsQuery,
} = marketApi;
