// authorizationSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id?: string;
  username?: string;
  get_full_name: string;
  first_name: string;
  last_name: string;
  other_name: string;
  email: string;
}

interface AuthorizationState {
  user?: User;
  uid?: string;
  role?: string;
}

const initialState: AuthorizationState = {
  user: {
    id: undefined,
    username: undefined,
    get_full_name: '',
    first_name: '',
    last_name: '',
    other_name: '',
    email: ''
  },
  uid: undefined,
  role: 'basic',
};

const authorizationSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | undefined>) => {
      state.user = action.payload;
    },
    setUID: (state, action: PayloadAction<string | undefined>) => {
      state.uid = action.payload;
    },
    setRole: (state, action: PayloadAction<string | undefined>) => {
      state.role = action.payload;
    },
  },
});

export const { setUser, setUID, setRole } = authorizationSlice.actions;
export default authorizationSlice.reducer;
