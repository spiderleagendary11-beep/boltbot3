import { useState, useEffect } from 'react';
import { User } from '../types';
import { storage, STORAGE_KEYS } from '../utils/localStorage';
import { generateBlockchainId, isValidBlockchainId } from '../utils/blockchain';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authToken = storage.get<string>(STORAGE_KEYS.AUTH_TOKEN);
    const userData = storage.get<User>(STORAGE_KEYS.USER);
    const blockchainId = storage.get<string>(STORAGE_KEYS.BLOCKCHAIN_ID);
    
    if (authToken && userData) {
      // Ensure user has blockchain ID (for existing users)
      if (!userData.blockchainId && blockchainId) {
        userData.blockchainId = blockchainId;
        storage.set(STORAGE_KEYS.USER, userData);
      }
      
      setIsAuthenticated(true);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call - in production, this would be a real authentication service
    if (username && password) {
      // Get or generate blockchain ID
      let blockchainId = storage.get<string>(STORAGE_KEYS.BLOCKCHAIN_ID);
      
      if (!blockchainId || !isValidBlockchainId(blockchainId)) {
        blockchainId = generateBlockchainId();
        storage.set(STORAGE_KEYS.BLOCKCHAIN_ID, blockchainId);
      }
      
      const mockUser: User = {
        id: '1',
        username,
        email: `${username}@example.com`,
        phone: '+1-555-0123',
        blockchainId
      };
      
      storage.set(STORAGE_KEYS.AUTH_TOKEN, 'mock-jwt-token');
      storage.set(STORAGE_KEYS.USER, mockUser);
      
      setIsAuthenticated(true);
      setUser(mockUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    storage.clear();
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      storage.set(STORAGE_KEYS.USER, updatedUser);
    }
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    updateUser
  };
}