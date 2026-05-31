import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, tokenStore, userStore, companyStore, type User, type Company } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  company: Company | null; // populated when role === "company"
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  companyLogin: (email: string, password: string) => Promise<User>;
  companyRegister: (name: string, email: string, password: string, description?: string) => Promise<User>;
  logout: () => void;
  refreshCompany: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = userStore.get();
    setUser(u);
    if (u?.role === "company") setCompany(companyStore.get());
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await api.login({ email, password });
    tokenStore.set(token);
    userStore.set(user);
    setUser(user);
    return user;
  };

  const register = async (name: string, email: string, password: string) => {
    const { token, user } = await api.register({ name, email, password });
    tokenStore.set(token);
    userStore.set(user);
    setUser(user);
    return user;
  };

  const companyLogin = async (email: string, password: string) => {
    const { token, user, company } = await api.companyLogin({ email, password });
    tokenStore.set(token);
    userStore.set(user);
    companyStore.set(company);
    setUser(user);
    setCompany(company);
    return user;
  };

  const companyRegister = async (name: string, email: string, password: string, description?: string) => {
    const { token, user, company } = await api.companyRegister({ name, email, password, description });
    tokenStore.set(token);
    userStore.set(user);
    companyStore.set(company);
    setUser(user);
    setCompany(company);
    return user;
  };

  const logout = () => {
    tokenStore.clear();
    companyStore.clear();
    setUser(null);
    setCompany(null);
  };

  const refreshCompany = () => {
    setCompany(companyStore.get());
  };

  return (
    <AuthContext.Provider value={{ user, company, loading, login, register, companyLogin, companyRegister, logout, refreshCompany }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
