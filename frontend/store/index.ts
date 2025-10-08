import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import userReducer from "./slices/userSlice";
import portfolioReducer from "./slices/portfolioSlice";
import { marketApi } from "./api/marketApi";

export const store = configureStore({
  reducer: {
    user: userReducer,
    portfolio: portfolioReducer,
    [marketApi.reducerPath]: marketApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(marketApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
