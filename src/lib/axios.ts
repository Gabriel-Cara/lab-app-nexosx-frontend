import axios from "axios";

let unauthorizedHandler: (() => void) | null = null;

function resolveApiBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_URL?.trim();

  if (!baseUrl) {
    throw new Error("Missing VITE_API_URL. Define it in web/.env before running the app.");
  }

  return baseUrl;
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      unauthorizedHandler?.();
    }

    return Promise.reject(error);
  }
);

export function setAuthorizationToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common["Authorization"];
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}
