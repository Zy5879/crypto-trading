import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type HoldingRow = {
  id: string; // coinId
  image: string;
  name: string;
  symbol: string;
  amount: number;
  valueUsd: number; // computed/joined
  deltaUsd24h: number; // computed/joined
};

type PortfolioState = {
  holdings: HoldingRow[];
};

const initialState: PortfolioState = { holdings: [] };

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    setHoldings(state, action: PayloadAction<HoldingRow[]>) {
      state.holdings = action.payload;
    },
    upsertHolding(state, action: PayloadAction<HoldingRow>) {
      const i = state.holdings.findIndex((h) => h.id === action.payload.id);
      if (i >= 0) state.holdings[i] = action.payload;
      else state.holdings.push(action.payload);
    },
    clearPortfolio(state) {
      state.holdings = [];
    },
  },
});

export const { setHoldings, upsertHolding, clearPortfolio } =
  portfolioSlice.actions;
export default portfolioSlice.reducer;
