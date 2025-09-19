import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, AlertTriangle, FileText, Navigation2, Shield, Camera, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { shortenBlockchainId } from '../utils/blockchain';

export function HomePage() {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'Emergency SOS',
      description: 'Instant emergency alert system',
      icon: AlertTriangle,
      link: '/sos',
      color: 'bg-red-500 hover:bg-red-600',
      textColor: 'text-white'
    },
    {
      title: 'GPS Tracking',
      description: 'Real-time location monitoring',
      icon: Navigation2,
      link: '/tracking',
      color: 'bg-green-500 hover:bg-green-600',
      textColor: 'text-white'
    },
    {
      title: 'Plan Trip',
      description: 'Interactive trip planning',
      icon: MapPin,
      link: '/trip',
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white'
    },
    {
      title: 'Safety Reports',
      description: 'Document incidents and observations',
      icon: FileText,
      link: '/report',
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-white'
    }
  ];

  const features = [
    {
      title: 'Profile Verification',
      description: 'Secure selfie verification system',
      icon: Camera,
      link: '/profile'
    },
    {
      title: 'Geofencing Alerts',
      description: 'AI-powered danger zone detection',
      icon: Shield,
      link: '/dashboard'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Welcome back, {user?.username}!
            </h1>
            {user?.blockchainId && (
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Lock className="h-4 w-4 text-blue-300" />
                <span className="text-sm text-blue-200 font-mono">
                  Blockchain ID: {shortenBlockchainId(user.blockchainId)}
                </span>
              </div>
            )}
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Your safety is our priority. Access all your safety tools and stay protected while traveling.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map(({ title, description, icon: Icon, link, color, textColor }) => (
              <Link
                key={title}
                to={link}
                className={`${color} ${textColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
              >
                <div className="flex flex-col items-center text-center">
                  <Icon className="h-12 w-12 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{title}</h3>
                  <p className="text-sm opacity-90">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Safety Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map(({ title, description, icon: Icon, link }) => (
              <Link
                key={title}
                to={link}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl border border-gray-100 transform hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600">{description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Safety Status */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Safety Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Protected</h4>
              <p className="text-gray-600">All systems operational</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Navigation2 className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">GPS Ready</h4>
              <p className="text-gray-600">Location services active</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">SOS Ready</h4>
              <p className="text-gray-600">Emergency system standby</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}