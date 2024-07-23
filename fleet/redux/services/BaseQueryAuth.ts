"use client";

import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { setAuth, logout } from "../features/authSlice";
import { Mutex } from "async-mutex";

export function baseQueryWithReauth(rootPath: string) {
  const mutex = new Mutex();

  const getCsrfToken = () => {
    const match = document.cookie.match(new RegExp('(^| )access=([^;]+)'));
    if (match) {
      return match[2];
    }
    return null;
  };

  const baseQuery = fetchBaseQuery({
    baseUrl: `${process.env.API_URL}/${rootPath}`,
    credentials: "include",
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers.set('X-CSRF-TOKEN', csrfToken);
      }
      return headers;
    }, // TODO: remove is necessary and set JWT CSRF to False in API
  });

  const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
  > = async (args, api, extraOptions) => {
    await mutex.waitForUnlock();
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      if (!mutex.isLocked()) {
        const release = await mutex.acquire();
        try {
          const refreshResult = await baseQuery(
            {
              url: "/v1/auth/token/refresh",
              method: "POST",
            },
            api,
            extraOptions
          );
          if (refreshResult.data) {
            api.dispatch(setAuth());

            result = await baseQuery(args, api, extraOptions);
          } else {
            api.dispatch(logout());
          }
        } finally {
          release();
        }
      } else {
        await mutex.waitForUnlock();
        result = await baseQuery(args, api, extraOptions);
      }
    }
    return result;
  };

  return baseQueryWithReauth;
}
