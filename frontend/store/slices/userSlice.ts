import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserState = {
  uid: string | null;
  email: string | null;
  displayName: string | null;
  initialized: boolean;
};

const initialState: UserState = {
  uid: null,
  email: null,
  displayName: null,
  initialized: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(
      state,
      action: PayloadAction<{
        uid: string;
        email: string | null;
        name: string | null;
      }>
    ) {
      (state.uid = action.payload.uid), (state.email = action.payload.email);
      state.displayName = action.payload.name;
      state.initialized = true;
    },

    clearUser(state) {
      state.uid = null;
      state.email = null;
      state.displayName = null;
      state.initialized = true;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
