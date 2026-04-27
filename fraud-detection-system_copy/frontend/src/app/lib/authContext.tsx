import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { fetchApi } from './api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (email: string, password: string) => {
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    // Note: Registration in your backend only returns user, it does NOT return a token.
    // For immediate login after register, we would need to store user and ideally ask for login,
    // but we can trust the registration payload sets the user state if the backend returns it.
    // In many flows, you either automatically login by hitting the login endpoint right after,
    // or you expect a token on register. Your /auth/register doesn't return a token right now.
    // So we'll hit login right after.
    
    await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    
    // Automatically login after successful registration
    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
