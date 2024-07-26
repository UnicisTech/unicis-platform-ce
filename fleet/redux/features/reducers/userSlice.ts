// authorizationSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id?: string;
  name: string;
  firstname: string;
  lastname: string;
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
    name: '',
    firstname: '',
    lastname: '',
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
