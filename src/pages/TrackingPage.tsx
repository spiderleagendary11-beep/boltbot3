import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Navigation2, Play, Square, Trash2, MapPin, Clock, Target, AlertTriangle, X, Shield } from 'lucide-react';
import { useGPS } from '../hooks/useGPS';
import { GPSLocation } from '../types';
import { DANGER_ZONES, getRiskLevelColor } from '../utils/geofencing';
import { storage, STORAGE_KEYS } from '../utils/localStorage';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function TrackingPage() {
  const { currentLocation, isTracking, error, trackingHistory, activeAlerts, startTracking, stopTracking, clearHistory, dismissAlert } = useGPS();
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7588, -73.9851]); // Default to NYC
  const [showHistory, setShowHistory] = useState(true);
  const [showDangerZones, setShowDangerZones] = useState(true);
  const [sleepMode, setSleepMode] = useState(() => storage.get<boolean>(STORAGE_KEYS.SLEEP_MODE) || false);

  useEffect(() => {
    if (currentLocation) {
      setMapCenter([currentLocation.latitude, currentLocation.longitude]);
    }
  }, [currentLocation]);

  // Monitor sleep mode changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newSleepMode = storage.get<boolean>(STORAGE_KEYS.SLEEP_MODE) || false;
      setSleepMode(newSleepMode);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getTrackingPath = (): [number, number][] => {
    return trackingHistory.map(location => [location.latitude, location.longitude]);
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy <= 10) return 'text-green-600 bg-green-100';
    if (accuracy <= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getActiveAlertZones = () => {
    return DANGER_ZONES.filter(zone => activeAlerts.includes(zone.id));
  };

  const createDangerZonePolygon = (coordinates: [number, number][]) => {
    return coordinates.map(coord => [coord[0], coord[1]] as [number, number]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Geofencing Alert Modals */}
      {!sleepMode && getActiveAlertZones().map((zone) => (
        <div
          key={zone.id}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-l-4 border-red-500">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${zone.riskLevel === 'critical' ? 'bg-red-100' : zone.riskLevel === 'high' ? 'bg-orange-100' : 'bg-yellow-100'}`}>
                  <AlertTriangle className={`h-6 w-6 ${zone.riskLevel === 'critical' ? 'text-red-600' : zone.riskLevel === 'high' ? 'text-orange-600' : 'text-yellow-600'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Geofencing Alert</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(zone.riskLevel)}`}>
                    {zone.riskLevel.toUpperCase()} RISK
                  </span>
                </div>
              </div>
              <button
                onClick={() => dismissAlert(zone.id)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">{zone.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{zone.description}</p>
              <div className={`p-3 rounded-lg border-l-4 ${zone.riskLevel === 'critical' ? 'bg-red-50 border-red-400' : zone.riskLevel === 'high' ? 'bg-orange-50 border-orange-400' : 'bg-yellow-50 border-yellow-400'}`}>
                <p className="text-sm font-medium text-gray-800">{zone.alertMessage}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => dismissAlert(zone.id)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
              >
                I Understand
              </button>
              <button
                onClick={() => {
                  dismissAlert(zone.id);
                  // In a real app, this would trigger navigation away
                  alert('Navigation feature would redirect you to a safer route.');
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Find Safe Route
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Navigation2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">GPS Tracking</h1>
          <p className="text-xl text-gray-600">Real-time location monitoring with AI-powered geofencing alerts</p>
        </div>

        {/* Sleep Mode Warning */}
        {sleepMode && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-purple-900">Sleep Mode Active</h3>
                <p className="text-purple-700">GPS tracking and geofencing alerts are paused to conserve battery.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tracking Controls */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tracking Controls</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={isTracking ? stopTracking : startTracking}
                  className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    isTracking
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isTracking ? <Square className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  <span>{isTracking ? 'Stop Tracking' : 'Start Tracking'}</span>
                </button>

                {trackingHistory.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Clear History</span>
                  </button>
                )}
              </div>

              {/* Status Indicator */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="font-medium text-gray-900">
                    Status: {isTracking ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {!sleepMode && (
                  <div className="flex items-center space-x-3 mt-2">
                    <div className={`w-3 h-3 rounded-full ${activeAlerts.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                    <span className="font-medium text-gray-900">
                      Geofencing: {activeAlerts.length > 0 ? `${activeAlerts.length} Alert(s)` : 'Safe'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Current Location */}
            {currentLocation && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Current Location
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Coordinates</p>
                    <p className="font-mono text-sm text-gray-900">
                      {formatCoordinates(currentLocation.latitude, currentLocation.longitude)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Accuracy</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAccuracyColor(currentLocation.accuracy)}`}>
                      ±{Math.round(currentLocation.accuracy)}m
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-sm text-gray-900 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTime(currentLocation.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tracking Statistics */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{trackingHistory.length}</p>
                  <p className="text-sm text-gray-600">Points Recorded</p>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${activeAlerts.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {sleepMode ? 'SLEEP' : isTracking ? 'LIVE' : 'STOPPED'}
                  </p>
                  <p className="text-sm text-gray-600">Status</p>
                </div>
              </div>
              
              {!sleepMode && activeAlerts.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-800">Active Alerts</span>
                  </div>
                  {getActiveAlertZones().map(zone => (
                    <div key={zone.id} className="text-xs text-red-700 mb-1">
                      • {zone.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Live Map</h3>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showHistory}
                      onChange={(e) => setShowHistory(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="text-sm text-gray-700">Show path</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showDangerZones}
                      onChange={(e) => setShowDangerZones(e.target.checked)}
                      className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                    />
                    <span className="text-sm text-gray-700">Show danger zones</span>
                  </label>
                </div>
              </div>
              <div className="h-96 lg:h-[600px]">
                <MapContainer
                  center={mapCenter}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {currentLocation && (
                    <Marker position={[currentLocation.latitude, currentLocation.longitude]}>
                      <Popup>
                        <div className="p-2">
                          <p className="font-semibold">Current Position</p>
                          <p className="text-sm">
                            {formatCoordinates(currentLocation.latitude, currentLocation.longitude)}
                          </p>
                          <p className="text-xs text-gray-600">
                            Accuracy: ±{Math.round(currentLocation.accuracy)}m
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatTime(currentLocation.timestamp)}
                          </p>
                          {activeAlerts.length > 0 && (
                            <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                              <p className="text-xs font-semibold text-red-800">⚠️ In Danger Zone</p>
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  
                  {showHistory && trackingHistory.length > 1 && (
                    <Polyline
                      positions={getTrackingPath()}
                      pathOptions={{
                        color: '#3b82f6',
                        weight: 3,
                        opacity: 0.8,
                      }}
                    />
                  )}
                  
                  {/* Render Danger Zones */}
                  {showDangerZones && DANGER_ZONES.map((zone) => (
                    <Polyline
                      key={zone.id}
                      positions={createDangerZonePolygon(zone.coordinates)}
                      pathOptions={{
                        color: zone.riskLevel === 'critical' ? '#dc2626' : zone.riskLevel === 'high' ? '#ea580c' : '#d97706',
                        weight: 2,
                        opacity: 0.8,
                        fillColor: zone.riskLevel === 'critical' ? '#fecaca' : zone.riskLevel === 'high' ? '#fed7aa' : '#fde68a',
                        fillOpacity: activeAlerts.includes(zone.id) ? 0.4 : 0.2,
                        fill: true
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h4 className="font-semibold text-gray-900">{zone.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{zone.description}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(zone.riskLevel)}`}>
                            {zone.riskLevel.toUpperCase()} RISK
                          </span>
                          {activeAlerts.includes(zone.id) && (
                            <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                              <p className="text-xs font-semibold text-red-800">⚠️ CURRENTLY INSIDE</p>
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Polyline>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}