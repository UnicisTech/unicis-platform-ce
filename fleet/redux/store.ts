import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './services/apiSlice';
import { accountSlice } from './services/userSlice';

import authReducer from './features/authSlice';
import userReducer from './features/userSlice';


export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [accountSlice.reducerPath]: accountSlice.reducer,
    auth: authReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiSlice.middleware,
      accountSlice.middleware,
    ),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<(typeof store)['getState']>;
export type AppDispatch = (typeof store)['dispatch'];