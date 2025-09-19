import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Plus, Save, Trash2, Edit, Download } from 'lucide-react';
import { Trip, TripDestination } from '../types';
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

export function TripPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [showNewTripForm, setShowNewTripForm] = useState(false);
  const [showDestinationForm, setShowDestinationForm] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7588, -73.9851]); // Default to NYC
  const [newTripName, setNewTripName] = useState('');
  const [destinationForm, setDestinationForm] = useState({
    name: '',
    latitude: '',
    longitude: '',
    description: ''
  });

  useEffect(() => {
    const savedTrips = storage.get<Trip[]>(STORAGE_KEYS.TRIPS) || [];
    setTrips(savedTrips);
    if (savedTrips.length > 0 && !activeTrip) {
      setActiveTrip(savedTrips[0]);
    }
  }, []);

  const saveTrips = (updatedTrips: Trip[]) => {
    setTrips(updatedTrips);
    storage.set(STORAGE_KEYS.TRIPS, updatedTrips);
  };

  const createNewTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTripName.trim()) return;

    const newTrip: Trip = {
      id: Date.now().toString(),
      name: newTripName.trim(),
      destinations: [],
      createdAt: new Date().toISOString(),
      status: 'planning'
    };

    const updatedTrips = [newTrip, ...trips];
    saveTrips(updatedTrips);
    setActiveTrip(newTrip);
    setNewTripName('');
    setShowNewTripForm(false);
  };

  const addDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip || !destinationForm.name.trim() || !destinationForm.latitude || !destinationForm.longitude) {
      alert('Please fill in all required fields');
      return;
    }

    const newDestination: TripDestination = {
      id: Date.now().toString(),
      name: destinationForm.name.trim(),
      latitude: parseFloat(destinationForm.latitude),
      longitude: parseFloat(destinationForm.longitude),
      description: destinationForm.description.trim()
    };

    const updatedTrip = {
      ...activeTrip,
      destinations: [...activeTrip.destinations, newDestination]
    };

    const updatedTrips = trips.map(trip => 
      trip.id === activeTrip.id ? updatedTrip : trip
    );

    saveTrips(updatedTrips);
    setActiveTrip(updatedTrip);
    setDestinationForm({ name: '', latitude: '', longitude: '', description: '' });
    setShowDestinationForm(false);

    // Update map center to new destination
    setMapCenter([newDestination.latitude, newDestination.longitude]);
  };

  const deleteDestination = (destinationId: string) => {
    if (!activeTrip) return;
    
    if (window.confirm('Are you sure you want to delete this destination?')) {
      const updatedTrip = {
        ...activeTrip,
        destinations: activeTrip.destinations.filter(dest => dest.id !== destinationId)
      };

      const updatedTrips = trips.map(trip => 
        trip.id === activeTrip.id ? updatedTrip : trip
      );

      saveTrips(updatedTrips);
      setActiveTrip(updatedTrip);
    }
  };

  const deleteTrip = (tripId: string) => {
    if (window.confirm('Are you sure you want to delete this entire trip?')) {
      const updatedTrips = trips.filter(trip => trip.id !== tripId);
      saveTrips(updatedTrips);
      
      if (activeTrip?.id === tripId) {
        setActiveTrip(updatedTrips.length > 0 ? updatedTrips[0] : null);
      }
    }
  };

  const exportTrip = () => {
    if (!activeTrip) return;
    
    const dataStr = JSON.stringify(activeTrip, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `trip-${activeTrip.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  // Handle map click to add destination
  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng;
    setDestinationForm({
      ...destinationForm,
      latitude: lat.toString(),
      longitude: lng.toString()
    });
    setShowDestinationForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <MapPin className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Trip Planning</h1>
          <p className="text-xl text-gray-600">Plan your journey with interactive maps and destination management</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trip Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">My Trips</h2>
                <button
                  onClick={() => setShowNewTripForm(!showNewTripForm)}
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  title="Create new trip"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {showNewTripForm && (
                <form onSubmit={createNewTrip} className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="text"
                    value={newTripName}
                    onChange={(e) => setNewTripName(e.target.value)}
                    placeholder="Trip name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                    required
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors duration-200"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewTripForm(false);
                        setNewTripName('');
                      }}
                      className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {trips.length === 0 ? (
                <p className="text-gray-500 text-sm">No trips yet. Create your first trip!</p>
              ) : (
                <div className="space-y-2">
                  {trips.map((trip) => (
                    <div
                      key={trip.id}
                      className={`p-3 rounded-lg cursor-pointer border-2 transition-all duration-200 ${
                        activeTrip?.id === trip.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                      }`}
                      onClick={() => setActiveTrip(trip)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{trip.name}</h3>
                          <p className="text-sm text-gray-600">{trip.destinations.length} destinations</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTrip(trip.id);
                          }}
                          className="text-red-600 hover:bg-red-100 p-1 rounded transition-colors duration-200"
                          title="Delete trip"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Trip Details */}
            {activeTrip && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Destinations</h3>
                  <button
                    onClick={exportTrip}
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                    title="Export trip"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => setShowDestinationForm(!showDestinationForm)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 mb-4"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Destination</span>
                </button>

                {showDestinationForm && (
                  <form onSubmit={addDestination} className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                    <input
                      type="text"
                      value={destinationForm.name}
                      onChange={(e) => setDestinationForm({ ...destinationForm, name: e.target.value })}
                      placeholder="Destination name *"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="any"
                        value={destinationForm.latitude}
                        onChange={(e) => setDestinationForm({ ...destinationForm, latitude: e.target.value })}
                        placeholder="Latitude *"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <input
                        type="number"
                        step="any"
                        value={destinationForm.longitude}
                        onChange={(e) => setDestinationForm({ ...destinationForm, longitude: e.target.value })}
                        placeholder="Longitude *"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <textarea
                      value={destinationForm.description}
                      onChange={(e) => setDestinationForm({ ...destinationForm, description: e.target.value })}
                      placeholder="Description (optional)"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors duration-200"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDestinationForm(false);
                          setDestinationForm({ name: '', latitude: '', longitude: '', description: '' });
                        }}
                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-xs text-gray-600">
                      Tip: Click on the map to automatically fill coordinates
                    </p>
                  </form>
                )}

                {activeTrip.destinations.length === 0 ? (
                  <p className="text-gray-500 text-sm">No destinations yet. Add your first destination!</p>
                ) : (
                  <div className="space-y-3">
                    {activeTrip.destinations.map((destination, index) => (
                      <div
                        key={destination.id}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{destination.name}</h4>
                            <p className="text-sm text-gray-600 font-mono">
                              {destination.latitude.toFixed(6)}, {destination.longitude.toFixed(6)}
                            </p>
                            {destination.description && (
                              <p className="text-sm text-gray-700 mt-1">{destination.description}</p>
                            )}
                            <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Stop #{index + 1}
                            </span>
                          </div>
                          <button
                            onClick={() => deleteDestination(destination.id)}
                            className="text-red-600 hover:bg-red-100 p-1 rounded transition-colors duration-200"
                            title="Delete destination"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  {activeTrip ? `${activeTrip.name} - Interactive Map` : 'Interactive Trip Map'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Click on the map to add destinations, or use the form to add them manually
                </p>
              </div>
              <div className="h-96 lg:h-[700px]">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {activeTrip?.destinations.map((destination, index) => (
                    <Marker
                      key={destination.id}
                      position={[destination.latitude, destination.longitude]}
                    >
                      <Popup>
                        <div className="p-2">
                          <h4 className="font-semibold">{destination.name}</h4>
                          <p className="text-sm font-mono">
                            {destination.latitude.toFixed(6)}, {destination.longitude.toFixed(6)}
                          </p>
                          {destination.description && (
                            <p className="text-sm text-gray-600 mt-1">{destination.description}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">Stop #{index + 1}</p>
                        </div>
                      </Popup>
                    </Marker>
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