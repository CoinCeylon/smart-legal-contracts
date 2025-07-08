import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";

import { useWallet } from "@meshsdk/react";

interface Contract {
  id: string;
  name: string;
  type: string;
  status: "draft" | "created" | "pending" | "signed";
  createdAt: string;
  signers: number;
  completedSigners: number;
}

interface WalletDetails {
  address: string;
  balance: string;
  network: string;
  isConnected: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  company?: string;
  phone?: string;
  address?: string;
  joinedAt: string;
  walletAddress?: string;
  enabled?: boolean;
}

interface VerificationStatus {
  isVerified: boolean;
  isVerifying: boolean;
  verificationError: string | null;
  lastVerifiedAt: string | null;
}

interface UserContextType {
  user: UserProfile | null;
  wallet: WalletDetails | null;
  contracts: Contract[];
  verificationStatus: VerificationStatus;
  isAuthenticated: boolean;
  token: string | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  setWallet: (wallet: WalletDetails | null) => void;
  addContract: (contract: Contract) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  deleteContract: (id: string) => void;
  verifyUser: (walletAddress: string) => Promise<void>;
  resetVerification: () => void;
  setVerificationError: (error: string | null) => void;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => void;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
  initialEnable: (
    walletAddress: string,
    transactionHash: string
  ) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<WalletDetails | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("bearerToken")
  );
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(false);

  const { disconnect } = useWallet();

  // Add verification state
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>({
      isVerified: false,
      isVerifying: false,
      verificationError: null,
      lastVerifiedAt: null,
    });

  // Get base URL from environment
  const baseUrl = import.meta.env.VITE_API_APP_BACKEND_URL;

  // Check authentication status on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("bearerToken");
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      // Optionally fetch user profile here
    }
  }, []);

  // Login function
  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean = false) => {
      setLoading(true);
      try {
        const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Login failed");
        }

        const data = await response.json();
        const newToken = data.token || data.accessToken || data.access_token;

        if (!newToken) {
          throw new Error("No token received from server");
        }

        // Store token
        setToken(newToken);
        setIsAuthenticated(true);

        if (rememberMe) {
          localStorage.setItem("bearerToken", newToken);
        } else {
          sessionStorage.setItem("bearerToken", newToken);
        }

        // Set user data if provided in response
        if (data.user) {
          setUser(data.user);

          if (data.user.enabled === true) {
            setVerificationStatus({
              isVerified: true,
              isVerifying: false,
              verificationError: null,
              lastVerifiedAt: new Date().toISOString(),
            });

            user.enabled = true;
          }
        }

        console.log("Login successful");
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl]
  );

  // Logout function
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setWallet(null);
    setContracts([]);
    setIsAuthenticated(false);
    setVerificationStatus({
      isVerified: false,
      isVerifying: false,
      verificationError: null,
      lastVerifiedAt: null,
    });

    localStorage.removeItem("bearerToken");
    sessionStorage.removeItem("bearerToken");

    // Disconnect wallet using MeshJS
    try {
      disconnect();
      console.log("Wallet disconnected successfully");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }

    console.log("Logged out successfully");
  }, []);

  // Authenticated fetch helper
  const authenticatedFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const currentToken =
        token ||
        localStorage.getItem("bearerToken") ||
        sessionStorage.getItem("bearerToken");

      if (!currentToken) {
        throw new Error("No authentication token found");
      }

      const defaultHeaders = {
        Authorization: `Bearer ${currentToken}`,
      };

      if (!(options.body instanceof FormData)) {
        defaultHeaders["Content-Type"] = "application/json";
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (response.status === 401) {
        logout();
        throw new Error("Authentication failed. Please login again.");
      }

      return response;
    },
    [token, logout]
  );

  // Keep verifyUser for contract operations only
  const verifyUser = useCallback(
    async (walletAddress: string): Promise<void> => {
      setVerificationStatus((prev) => ({
        ...prev,
        isVerifying: true,
        verificationError: null,
      }));

      try {
        const response = await authenticatedFetch(
          `${baseUrl}/api/v1/contracts/verify-user`,
          {
            method: "POST",
            body: JSON.stringify({
              walletAddress: walletAddress,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Verification failed: ${response.statusText}`
          );
        }

        const data = await response.json();
        setUser(data.user);
        setUser((prev) => ({
          ...prev,
          walletAddress: walletAddress,
          enabled: true,
        }));

        setVerificationStatus({
          isVerified: true,
          isVerifying: false,
          verificationError: null,
          lastVerifiedAt: new Date().toISOString(),
        });

        console.log("User verified successfully:", data);
      } catch (error) {
        console.error("Verification error:", error);
        setVerificationStatus((prev) => ({
          ...prev,
          isVerified: false,
          isVerifying: false,
          verificationError:
            error instanceof Error ? error.message : "Verification failed",
        }));
      }
    },
    [baseUrl, authenticatedFetch]
  );

  // Separate initialEnable function for the initial payment
  const initialEnable = useCallback(
    async (walletAddress: string, transactionHash: string): Promise<void> => {
      setLoading(true);
      try {
        const response = await authenticatedFetch(
          `${baseUrl}/api/v1/users/initial-enable`,
          {
            method: "POST",
            body: JSON.stringify({
              walletAddress: walletAddress,
              initialTransactionHash: transactionHash,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Initial enable failed: ${response.statusText}`
          );
        }

        const data = await response.json();

        // Update user with enabled status
        if (data.user) {
          setUser(data.user);
        }

        console.log("User initial enable successful:", data);
        return data;
      } catch (error) {
        console.error("Initial enable error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, authenticatedFetch]
  );

  // Reset verification
  const resetVerification = useCallback(() => {
    setVerificationStatus({
      isVerified: false,
      isVerifying: false,
      verificationError: null,
      lastVerifiedAt: null,
    });
  }, []);

  // Set verification error
  const setVerificationError = useCallback((error: string | null) => {
    setVerificationStatus((prev) => ({
      ...prev,
      verificationError: error,
      isVerifying: false,
    }));
  }, []);

  const addContract = (contract: Contract) => {
    setContracts((prev) => [contract, ...prev]);
  };

  const updateContract = (id: string, updates: Partial<Contract>) => {
    setContracts((prev) =>
      prev.map((contract) =>
        contract.id === id ? { ...contract, ...updates } : contract
      )
    );
  };

  const deleteContract = (id: string) => {
    setContracts((prev) => prev.filter((contract) => contract.id !== id));
  };

  const value: UserContextType = {
    user,
    wallet,
    contracts,
    verificationStatus,
    isAuthenticated,
    token,
    loading,
    setUser,
    setWallet,
    addContract,
    updateContract,
    deleteContract,
    verifyUser,
    resetVerification,
    setVerificationError,
    login,
    logout,
    authenticatedFetch,
    initialEnable,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
