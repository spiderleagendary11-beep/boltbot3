export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  profileImage?: string;
  blockchainId: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPriority: boolean;
}

export interface Trip {
  id: string;
  name: string;
  destinations: TripDestination[];
  createdAt: string;
  status: 'planning' | 'active' | 'completed';
}

export interface TripDestination {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  type: 'incident' | 'observation' | 'emergency';
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved';
  blockchainId?: string;
}

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface DangerZone {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  coordinates: [number, number][];
  alertMessage: string;
}

export interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  sleepMode: boolean;
  currentLocation: GPSLocation | null;
  trackingActive: boolean;
}