import { useState, useEffect } from 'react';
import { User } from '../types';
import { storage, STORAGE_KEYS } from '../utils/localStorage';
import { generateBlockchainId, isValidBlockchainId } from '../utils/blockchain';

interface LoginCredentials {
  identifier: string;
  identifierType: 'username' | 'phone';
  password: string;
}

interface SignupData {
  fullName: string;
  username: string;
  phone: string;
  email: string;
  password: string;
}

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

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    // Simulate API call - in production, this would be a real authentication service
    if (credentials.identifier && credentials.password) {
      // Demo credentials validation
      const validCredentials = [
        { identifier: 'demo', type: 'username', password: 'Demo123!' },
        { identifier: '+1234567890', type: 'phone', password: 'Demo123!' }
      ];
      
      const isValidDemo = validCredentials.some(cred => 
        cred.identifier === credentials.identifier && 
        cred.type === credentials.identifierType && 
        cred.password === credentials.password
      );
      
      if (!isValidDemo) {
        return false;
      }
      
      // Get or generate blockchain ID
      let blockchainId = storage.get<string>(STORAGE_KEYS.BLOCKCHAIN_ID);
      
      if (!blockchainId || !isValidBlockchainId(blockchainId)) {
        blockchainId = generateBlockchainId();
        storage.set(STORAGE_KEYS.BLOCKCHAIN_ID, blockchainId);
      }
      
      const mockUser: User = {
        id: '1',
        username: credentials.identifierType === 'username' ? credentials.identifier : 'demo',
        email: `${credentials.identifierType === 'username' ? credentials.identifier : 'demo'}@example.com`,
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

  const signup = async (userData: SignupData): Promise<boolean> => {
    // Simulate API call - in production, this would validate uniqueness and create account
    if (userData.fullName && userData.username && userData.phone && userData.email && userData.password) {
      // Generate blockchain ID for new user
      const blockchainId = generateBlockchainId();
      
      const newUser: User = {
        id: Date.now().toString(),
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        blockchainId
      };
      
      storage.set(STORAGE_KEYS.AUTH_TOKEN, 'mock-jwt-token');
      storage.set(STORAGE_KEYS.USER, newUser);
      storage.set(STORAGE_KEYS.BLOCKCHAIN_ID, blockchainId);
      
      setIsAuthenticated(true);
      setUser(newUser);
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
    signup,
    logout,
    updateUser
  };
}