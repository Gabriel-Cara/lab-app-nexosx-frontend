import { api } from "@/lib/axios";
import { useEffect, useState, type ReactNode, createContext } from "react";

interface AuthContext {
  session: LoginAPIResponse | null;
  save: (data: LoginAPIResponse) => void;
  isLoading: boolean;
  remove: () => void;
}

const LOCAL_STORAGE_KEY = "@nexus"

export const AuthContext = createContext({} as AuthContext);

export function AuthProvider({ children }: { children: ReactNode}) {
  const [session, setSession] = useState<null | LoginAPIResponse>(null)
  const [isLoading, setIsLoading] = useState(true)

  function save(data: LoginAPIResponse) {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}:user`, JSON.stringify(data.user))
    localStorage.setItem(`${LOCAL_STORAGE_KEY}:token`, data.token)

    api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`

    setSession(data);
  }

  function remove() {
    setSession(null);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}:user`)
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}:token`)

    window.location.assign("/")
  }

  function loadUser() {
    const user = localStorage.getItem(`${LOCAL_STORAGE_KEY}:user`)
    const token = localStorage.getItem(`${LOCAL_STORAGE_KEY}:token`)

    if(token && user) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      setSession({
        token,
        user: JSON.parse(user)
      })
    }

    setIsLoading(false);
  }

  useEffect(() => {
    loadUser()
  }, [])
  
  return (
    <AuthContext.Provider value={{ session, save, isLoading, remove }}>
      {children}
    </AuthContext.Provider>
  )
}