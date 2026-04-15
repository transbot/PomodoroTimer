import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  initializeAuth,
  getUser,
  isSupabaseConfigured,
  CloudUser,
} from '../services';

interface UserContextType {
  userId: string | null;
  cloudUser: CloudUser | null;
  isConfigured: boolean;
  isLoading: boolean;
  isRegistered: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [cloudUser, setCloudUser] = useState<CloudUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  // Initial auth setup (runs once)
  useEffect(() => {
    const initAuth = async () => {
      if (!isConfigured) {
        setIsLoading(false);
        return;
      }

      try {
        const authId = await initializeAuth();
        if (!authId) {
          setIsLoading(false);
          return;
        }

        setUserId(authId);

        // Try to get or register user profile
        let user = await getUser(authId);
        if (!user) {
          // Import registerUser only when needed
          const { registerUser } = await import('../services');
          user = await registerUser(authId);
        }
        setCloudUser(user);
      } catch (error) {
        console.error('Failed to initialize user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [isConfigured]);

  // Fast refresh - only fetch user data, don't re-init auth
  const refreshUser = useCallback(async () => {
    if (!isConfigured || !userId) {
      return;
    }

    try {
      const user = await getUser(userId);
      if (user) {
        setCloudUser(user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, [isConfigured, userId]);

  return (
    <UserContext.Provider
      value={{
        userId,
        cloudUser,
        isConfigured,
        isLoading,
        isRegistered: cloudUser !== null,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
