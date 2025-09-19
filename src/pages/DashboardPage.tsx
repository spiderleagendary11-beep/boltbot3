import React, { useState, useEffect } from 'react';
import { BarChart3, MapPin, FileText, AlertTriangle, Navigation2, TrendingUp, Shield, Users } from 'lucide-react';
import { Trip, Report, EmergencyContact } from '../types';
import { storage, STORAGE_KEYS } from '../utils/localStorage';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalReports: 0,
    totalContacts: 0,
    activeTrips: 0,
    pendingReports: 0,
    emergencyReports: 0
  });

  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    type: 'trip' | 'report' | 'contact';
    action: string;
    timestamp: string;
    details: string;
  }>>([]);

  useEffect(() => {
    // Load data from localStorage
    const trips = storage.get<Trip[]>(STORAGE_KEYS.TRIPS) || [];
    const reports = storage.get<Report[]>(STORAGE_KEYS.REPORTS) || [];
    const contacts = storage.get<EmergencyContact[]>(STORAGE_KEYS.CONTACTS) || [];

    // Calculate statistics
    setStats({
      totalTrips: trips.length,
      totalReports: reports.length,
      totalContacts: contacts.length,
      activeTrips: trips.filter(trip => trip.status === 'active').length,
      pendingReports: reports.filter(report => report.status === 'pending').length,
      emergencyReports: reports.filter(report => report.type === 'emergency').length
    });

    // Generate recent activity
    const activity: Array<{
      id: string;
      type: 'trip' | 'report' | 'contact';
      action: string;
      timestamp: string;
      details: string;
    }> = [];

    // Add recent trips
    trips
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .forEach(trip => {
        activity.push({
          id: trip.id,
          type: 'trip',
          action: 'Created trip',
          timestamp: trip.createdAt,
          details: `${trip.name} with ${trip.destinations.length} destinations`
        });
      });

    // Add recent reports
    reports
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3)
      .forEach(report => {
        activity.push({
          id: report.id,
          type: 'report',
          action: 'Filed report',
          timestamp: report.timestamp,
          details: `${report.type}: ${report.title}`
        });
      });

    // Sort activity by timestamp
    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setRecentActivity(activity.slice(0, 8));
  }, []);

  const quickActions = [
    {
      title: 'Plan New Trip',
      description: 'Start planning your next adventure',
      icon: MapPin,
      link: '/trip',
      color: 'bg-blue-500 hover:bg-blue-600',
      count: stats.totalTrips
    },
    {
      title: 'Create Report',
      description: 'Document safety observations',
      icon: FileText,
      link: '/report',
      color: 'bg-green-500 hover:bg-green-600',
      count: stats.totalReports
    },
    {
      title: 'Emergency SOS',
      description: 'Access emergency services',
      icon: AlertTriangle,
      link: '/sos',
      color: 'bg-red-500 hover:bg-red-600',
      count: stats.totalContacts
    },
    {
      title: 'GPS Tracking',
      description: 'Monitor your location',
      icon: Navigation2,
      link: '/tracking',
      color: 'bg-purple-500 hover:bg-purple-600',
      count: 'LIVE'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trip': return MapPin;
      case 'report': return FileText;
      case 'contact': return Users;
      default: return Shield;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'trip': return 'text-blue-600 bg-blue-100';
      case 'report': return 'text-green-600 bg-green-100';
      case 'contact': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <BarChart3 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Safety Dashboard</h1>
          <p className="text-xl text-gray-600">Monitor your safety activities and access key insights</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTrips}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">{stats.activeTrips} active</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Safety Reports</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalReports}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">{stats.pendingReports} pending</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emergency Contacts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalContacts}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-xl">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">SOS ready</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emergency Reports</p>
                <p className="text-3xl font-bold text-gray-900">{stats.emergencyReports}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">Critical incidents</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map(({ title, description, icon: Icon, link, color, count }) => (
                  <Link
                    key={title}
                    to={link}
                    className={`${color} text-white rounded-xl p-6 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Icon className="h-8 w-8" />
                      <span className="text-xl font-bold opacity-75">{count}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{title}</h3>
                    <p className="text-sm opacity-90">{description}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Safety Status */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="h-6 w-6 mr-2 text-blue-600" />
                Safety Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-green-900">GPS Tracking</span>
                  </div>
                  <span className="text-green-700 text-sm">Active</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-blue-900">SOS System</span>
                  </div>
                  <span className="text-blue-700 text-sm">Ready</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="font-medium text-orange-900">Geofencing</span>
                  </div>
                  <span className="text-orange-700 text-sm">Monitoring</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={`${activity.id}-${index}`} className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-600 truncate">{activity.details}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="mt-6">
                <Link
                  to="/report"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center block"
                >
                  View All Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}