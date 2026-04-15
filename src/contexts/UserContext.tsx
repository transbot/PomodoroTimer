import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getOrCreateUserId,
  registerUser,
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

  const refreshUser = useCallback(async () => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      const id = getOrCreateUserId();
      setUserId(id);

      // Try to get or register user
      let user = await getUser(id);
      if (!user) {
        user = await registerUser(id);
      }
      setCloudUser(user);
    } catch (error) {
      console.error('Failed to initialize user:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

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
