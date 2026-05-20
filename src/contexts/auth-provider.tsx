import { useEffect, useState, type ReactNode } from "react";
import axios from "axios";

import { getProfile } from "@/api/get-profile";
import { AuthContext } from "@/contexts/auth-context";
import {
  setAuthorizationToken,
  setUnauthorizedHandler,
} from "@/lib/axios";
import { queryClient } from "@/lib/react-query";
import type { AuthSession, AuthUser } from "@/types/auth";

const LOCAL_STORAGE_KEY = "@nexos";
const USER_STORAGE_KEY = `${LOCAL_STORAGE_KEY}:user`;
const TOKEN_STORAGE_KEY = `${LOCAL_STORAGE_KEY}:token`;

type AuthProviderProps = {
  children: ReactNode;
};

function persistSession(data: AuthSession) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
  localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
  setAuthorizationToken(data.token);
}

function clearPersistedSession() {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  setAuthorizationToken(null);
  queryClient.clear();
}

function readStoredSession(): AuthSession | null {
  const userRaw = localStorage.getItem(USER_STORAGE_KEY);
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!token || !userRaw) {
    return null;
  }

  try {
    const user = JSON.parse(userRaw) as AuthUser;
    return { token, user };
  } catch {
    clearPersistedSession();
    return null;
  }
}

function toAuthUser(profile: Awaited<ReturnType<typeof getProfile>>): AuthUser {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    condominiumId: profile.condominiumId ?? null,
  };
}

function isAuthorizationFailure(error: unknown) {
  return (
    axios.isAxiosError(error) &&
    (error.response?.status === 401 || error.response?.status === 403)
  );
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function save(data: AuthSession) {
    persistSession(data);
    setSession(data);
  }

  function remove() {
    clearPersistedSession();
    setSession(null);
  }

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearPersistedSession();
      setSession(null);
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const storedSession = readStoredSession();

    if (!storedSession) {
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setAuthorizationToken(storedSession.token);

    const validateSession = async () => {
      try {
        const profile = await getProfile(storedSession.user.id);

        if (!isMounted) {
          return;
        }

        const nextSession = {
          token: storedSession.token,
          user: toAuthUser(profile),
        };

        persistSession(nextSession);
        setSession(nextSession);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (isAuthorizationFailure(error)) {
          clearPersistedSession();
          setSession(null);
        } else {
          setSession(storedSession);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void validateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, save, isLoading, remove }}>
      {children}
    </AuthContext.Provider>
  );
}
