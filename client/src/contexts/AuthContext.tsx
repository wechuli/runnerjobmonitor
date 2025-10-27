import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { generateState, generateOAuthUrl } from "@/config/oauth";

interface User {
  id: number;
  login: string;
  name?: string;
  email?: string;
  avatar_url: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  login: () => void;
  logout: () => void;
  handleCallback: (code: string, state: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored auth on mount
    const storedToken = localStorage.getItem("gh_access_token");
    const storedUser = localStorage.getItem("gh_user");

    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = () => {
    // Generate a random state for CSRF protection
    const state = generateState();
    sessionStorage.setItem("oauth_state", state);

    // Redirect to GitHub OAuth
    const oauthUrl = generateOAuthUrl(state);
    window.location.href = oauthUrl;
  };

  const handleCallback = async (code: string, state: string) => {
    try {
      // Exchange code for access token via backend
      const response = await fetch("http://localhost:8080/api/auth/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, state }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Authentication failed");
      }

      const data = await response.json();

      // Store auth data
      localStorage.setItem("gh_access_token", data.access_token);
      localStorage.setItem("gh_user", JSON.stringify(data.user));

      setAccessToken(data.access_token);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("OAuth callback error:", error);
      throw error;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("gh_access_token");
    localStorage.removeItem("gh_user");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        accessToken,
        login,
        logout,
        handleCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
