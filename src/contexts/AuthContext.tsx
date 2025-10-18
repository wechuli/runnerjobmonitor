import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { login: string; avatar_url: string } | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ login: string; avatar_url: string } | null>(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem('gh-runner-auth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      setUser({
        login: 'demo-user',
        avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=DU',
      });
    }
  }, []);

  const login = () => {
    const mockUser = {
      login: 'demo-user',
      avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=DU',
    };
    setIsAuthenticated(true);
    setUser(mockUser);
    localStorage.setItem('gh-runner-auth', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('gh-runner-auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
