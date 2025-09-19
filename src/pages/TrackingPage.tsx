import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Navigation2, Play, Square, Trash2, MapPin, Clock, Target } from 'lucide-react';
import { useGPS } from '../hooks/useGPS';
import { GPSLocation } from '../types';
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
  const { currentLocation, isTracking, error, trackingHistory, startTracking, stopTracking, clearHistory } = useGPS();
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7588, -73.9851]); // Default to NYC
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    if (currentLocation) {
      setMapCenter([currentLocation.latitude, currentLocation.longitude]);
    }
  }, [currentLocation]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Navigation2 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">GPS Tracking</h1>
          <p className="text-xl text-gray-600">Real-time location monitoring and tracking history</p>
        </div>

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
                  <p className="text-2xl font-bold text-green-600">
                    {isTracking ? 'LIVE' : 'STOPPED'}
                  </p>
                  <p className="text-sm text-gray-600">Status</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Live Map</h3>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showHistory}
                    onChange={(e) => setShowHistory(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm text-gray-700">Show tracking path</span>
                </label>
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
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}