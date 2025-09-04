import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { logoutUser } from "../services/api";

type User = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  location?: string;
  about?: string;
  company?: string;
  city?: string;
  state?: string;
  is_premium?: boolean;
} | null;

type AuthContextType = {
  user: User;
  login: (token: string) => Promise<void>;
  logout: () => void;
  fetchUserProfile: (token: string) => Promise<void>; // 👈 thêm
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token);
    } else {
      // Nếu không có token, xóa mọi thông tin user khỏi localStorage
      localStorage.removeItem("username");
      localStorage.removeItem("is_premium");
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const res = await axios.get("http://localhost:4001/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      // Chỉ lưu thông tin user khi đăng nhập thành công
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("is_premium", res.data.is_premium ? "true" : "false");
    } catch (err) {
      console.error("Failed to fetch user profile", err);
      logout();
    }
  };

  const login = async (token: string) => {
    localStorage.setItem("token", token);
    await fetchUserProfile(token);
  };

  const logout = () => {
    logoutUser(); // xoá token + info
    setUser(null);
    localStorage.removeItem("username");
    localStorage.removeItem("is_premium");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
