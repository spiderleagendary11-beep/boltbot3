import { useState, useEffect, useCallback, useRef } from 'react';
import { GPSLocation } from '../types';
import { checkGeofenceViolations } from '../utils/geofencing';
import { storage, STORAGE_KEYS } from '../utils/localStorage';

export function useGPS() {
  const [currentLocation, setCurrentLocation] = useState<GPSLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingHistory, setTrackingHistory] = useState<GPSLocation[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);
  const watchIdRef = useRef<number | null>(null);

  const sleepMode = storage.get<boolean>(STORAGE_KEYS.SLEEP_MODE) || false;

  useEffect(() => {
    const savedHistory = storage.get<GPSLocation[]>(STORAGE_KEYS.TRACKING_HISTORY) || [];
    setTrackingHistory(savedHistory);
  }, []);

  // Monitor sleep mode changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newSleepMode = storage.get<boolean>(STORAGE_KEYS.SLEEP_MODE) || false;
      if (newSleepMode && activeAlerts.length > 0) {
        // Clear alerts when sleep mode is activated
        setActiveAlerts([]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [activeAlerts.length]);

  const handleLocationUpdate = useCallback((position: GeolocationPosition) => {
    const currentSleepMode = storage.get<boolean>(STORAGE_KEYS.SLEEP_MODE) || false;
    
    const location: GPSLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: Date.now()
    };

    setCurrentLocation(location);
    setError(null);

    // Add to tracking history
    setTrackingHistory(prev => {
      const updated = [...prev, location];
      storage.set(STORAGE_KEYS.TRACKING_HISTORY, updated.slice(-1000)); // Keep last 1000 points
      return updated;
    });

    // Check geofencing only if not in sleep mode
    if (!currentSleepMode) {
      const violations = checkGeofenceViolations(location);
      const currentViolationIds = violations.map(zone => zone.id);
      
      // Update active alerts
      setActiveAlerts(currentViolationIds);
      
      // Log violations for debugging
      if (violations.length > 0) {
        console.log('Geofence violations detected:', violations.map(v => v.name));
      }
    } else {
      // Clear alerts in sleep mode
      setActiveAlerts([]);
    }
  }, []);

  const handleLocationError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = '';
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied by user.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out.';
        break;
      default:
        errorMessage = 'An unknown error occurred while retrieving location.';
    }
    setError(errorMessage);
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    const currentSleepMode = storage.get<boolean>(STORAGE_KEYS.SLEEP_MODE) || false;
    if (currentSleepMode) {
      setError('GPS tracking is disabled in sleep mode.');
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleLocationUpdate,
      handleLocationError,
      options
    );

    setIsTracking(true);
    setError(null);
  }, [handleLocationUpdate, handleLocationError]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setActiveAlerts([]); // Clear alerts when stopping tracking
  }, []);

  const getCurrentPosition = useCallback(() => {
    return new Promise<GPSLocation>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: GPSLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          resolve(location);
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  const clearHistory = useCallback(() => {
    setTrackingHistory([]);
    storage.remove(STORAGE_KEYS.TRACKING_HISTORY);
  }, []);

  const dismissAlert = useCallback((zoneId: string) => {
    setActiveAlerts(prev => prev.filter(id => id !== zoneId));
  }, []);
  // Stop tracking when component unmounts
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    currentLocation,
    isTracking,
    error,
    trackingHistory,
    activeAlerts,
    startTracking,
    stopTracking,
    getCurrentPosition,
    clearHistory,
    dismissAlert
  };
}