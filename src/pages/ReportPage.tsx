import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Edit, Trash2, Download, MapPin, Clock, Shield } from 'lucide-react';
import { Report } from '../types';
import { storage, STORAGE_KEYS } from '../utils/localStorage';
import { useGPS } from '../hooks/useGPS';
import { useAuth } from '../hooks/useAuth';
import { shortenBlockchainId } from '../utils/blockchain';

export function ReportPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { getCurrentPosition } = useGPS();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'observation' as Report['type'],
    includeLocation: false
  });

  useEffect(() => {
    const savedReports = storage.get<Report[]>(STORAGE_KEYS.REPORTS) || [];
    setReports(savedReports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, []);

  const saveReports = (updatedReports: Report[]) => {
    const sortedReports = updatedReports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setReports(sortedReports);
    storage.set(STORAGE_KEYS.REPORTS, sortedReports);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    let location = null;
    if (formData.includeLocation) {
      try {
        const gpsLocation = await getCurrentPosition();
        location = {
          latitude: gpsLocation.latitude,
          longitude: gpsLocation.longitude
        };
      } catch (error) {
        console.error('Failed to get location:', error);
      }
    }

    if (editingReport) {
      const updatedReport: Report = {
        ...editingReport,
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        location
      };

      const updatedReports = reports.map(report =>
        report.id === editingReport.id ? updatedReport : report
      );
      saveReports(updatedReports);
    } else {
      const newReport: Report = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        location,
        timestamp: new Date().toISOString(),
        status: 'pending',
        blockchainId: user?.blockchainId
      };

      saveReports([newReport, ...reports]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'observation',
      includeLocation: false
    });
    setShowForm(false);
    setEditingReport(null);
  };

  const handleEdit = (report: Report) => {
    setEditingReport(report);
    setFormData({
      title: report.title,
      description: report.description,
      type: report.type,
      includeLocation: !!report.location
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      const updatedReports = reports.filter(report => report.id !== id);
      saveReports(updatedReports);
    }
  };

  const updateReportStatus = (id: string, status: Report['status']) => {
    const updatedReports = reports.map(report =>
      report.id === id ? { ...report, status } : report
    );
    saveReports(updatedReports);
  };

  const exportReports = () => {
    const filteredReports = getFilteredReports();
    const dataStr = JSON.stringify(filteredReports, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `safety-reports-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const getFilteredReports = () => {
    return reports.filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || report.type === filterType;
      const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  };

  const getTypeColor = (type: Report['type']) => {
    switch (type) {
      case 'incident': return 'text-red-700 bg-red-100';
      case 'observation': return 'text-blue-700 bg-blue-100';
      case 'emergency': return 'text-red-800 bg-red-200';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100';
      case 'reviewed': return 'text-blue-700 bg-blue-100';
      case 'resolved': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const filteredReports = getFilteredReports();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Safety Reports</h1>
          <p className="text-xl text-gray-600">Document incidents, observations, and emergency situations</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reports..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="incident">Incident</option>
                <option value="observation">Observation</option>
                <option value="emergency">Emergency</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={exportReports}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>New Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingReport ? 'Edit Report' : 'Create New Report'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Report['type'] })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="observation">Observation</option>
                  <option value="incident">Incident</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief description of the report"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of what happened, when, and any relevant details..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeLocation"
                  checked={formData.includeLocation}
                  onChange={(e) => setFormData({ ...formData, includeLocation: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeLocation" className="ml-2 block text-sm text-gray-900">
                  Include my current location with this report
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  {editingReport ? 'Update Report' : 'Create Report'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reports List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Reports ({filteredReports.length})
            </h2>
          </div>

          <div className="p-8">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">No Reports Found</h3>
                <p className="text-gray-400">
                  {reports.length === 0 
                    ? 'Create your first safety report to get started'
                    : 'No reports match your current filters'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{report.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                            {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">{report.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(report.timestamp).toLocaleString()}
                          </span>
                          {report.location && (
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {report.location.latitude.toFixed(6)}, {report.location.longitude.toFixed(6)}
                            </span>
                          )}
                          {report.blockchainId && (
                            <span className="flex items-center">
                              <Shield className="h-4 w-4 mr-1" />
                              ID: {shortenBlockchainId(report.blockchainId)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <select
                          value={report.status}
                          onChange={(e) => updateReportStatus(report.id, e.target.value as Report['status'])}
                          className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        
                        <button
                          onClick={() => handleEdit(report)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                          title="Edit report"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          title="Delete report"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}