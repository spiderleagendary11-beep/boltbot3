import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Edit, Trash2, Phone, Star } from 'lucide-react';
import { EmergencyContact } from '../types';
import { storage, STORAGE_KEYS } from '../utils/localStorage';

export function SOSPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [sosActive, setSosActive] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
    isPriority: false
  });

  useEffect(() => {
    const savedContacts = storage.get<EmergencyContact[]>(STORAGE_KEYS.CONTACTS) || [];
    setContacts(savedContacts);
  }, []);

  const saveContacts = (updatedContacts: EmergencyContact[]) => {
    setContacts(updatedContacts);
    storage.set(STORAGE_KEYS.CONTACTS, updatedContacts);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      relationship: formData.relationship.trim() || 'Emergency Contact',
      isPriority: formData.isPriority
    };

    let updatedContacts = [...contacts, newContact];
    
    // Ensure only one priority contact
    if (formData.isPriority) {
      updatedContacts = updatedContacts.map(contact => 
        contact.id === newContact.id ? contact : { ...contact, isPriority: false }
      );
    }

    saveContacts(updatedContacts);
    setShowAddForm(false);
    resetForm();
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      isPriority: contact.isPriority
    });
    setShowAddForm(true);
  };

  const handleUpdateContact = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingContact) return;

    let updatedContacts = contacts.map(contact =>
      contact.id === editingContact.id
        ? { ...contact, ...formData }
        : contact
    );

    // Ensure only one priority contact
    if (formData.isPriority) {
      updatedContacts = updatedContacts.map(contact =>
        contact.id === editingContact.id ? contact : { ...contact, isPriority: false }
      );
    }

    saveContacts(updatedContacts);
    setShowAddForm(false);
    setEditingContact(null);
    resetForm();
  };

  const handleDeleteContact = (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      const updatedContacts = contacts.filter(contact => contact.id !== id);
      saveContacts(updatedContacts);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      relationship: '',
      isPriority: false
    });
  };

  const handleSOS = () => {
    const sleepMode = storage.get<boolean>(STORAGE_KEYS.SLEEP_MODE) || false;
    
    if (sleepMode) {
      alert('SOS is disabled in sleep mode. Please disable sleep mode to use emergency features.');
      return;
    }

    setSosActive(true);
    
    const priorityContact = contacts.find(contact => contact.isPriority);
    const contactName = priorityContact ? priorityContact.name : 'Emergency Services';
    
    // Simulate sending SOS alert
    setTimeout(() => {
      setSosActive(false);
      alert(`🚨 SOS Alert sent to Police and ${contactName}\n\nTimestamp: ${new Date().toLocaleString()}\nLocation: Mock GPS coordinates\nStatus: Alert transmitted successfully`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Emergency SOS</h1>
          <p className="text-xl text-gray-600">Quick access to emergency services and your trusted contacts</p>
        </div>

        {/* SOS Button */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          <button
            onClick={handleSOS}
            disabled={sosActive}
            className={`w-48 h-48 rounded-full text-white font-bold text-2xl shadow-2xl transform transition-all duration-200 ${
              sosActive
                ? 'bg-red-800 scale-95 animate-pulse cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95'
            }`}
          >
            {sosActive ? (
              <div>
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white mx-auto mb-2"></div>
                SENDING...
              </div>
            ) : (
              <>
                <AlertTriangle className="h-16 w-16 mx-auto mb-2" />
                EMERGENCY
                <br />
                SOS
              </>
            )}
          </button>
          <p className="mt-4 text-gray-600">
            Press and hold the SOS button to alert emergency services and your priority contact
          </p>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Emergency Contacts</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Contact</span>
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* Add/Edit Contact Form */}
            {showAddForm && (
              <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
                </h3>
                <form onSubmit={editingContact ? handleUpdateContact : handleAddContact} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={formData.relationship}
                      onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                      placeholder="e.g., Family, Friend, Colleague"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPriority"
                      checked={formData.isPriority}
                      onChange={(e) => setFormData({ ...formData, isPriority: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPriority" className="ml-2 block text-sm text-gray-900">
                      Make this my priority contact (only one allowed)
                    </label>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      {editingContact ? 'Update Contact' : 'Add Contact'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingContact(null);
                        resetForm();
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Contacts List */}
            {contacts.length === 0 ? (
              <div className="text-center py-12">
                <Phone className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-500 mb-2">No Emergency Contacts</h3>
                <p className="text-gray-400">Add your first emergency contact to get started</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      contact.isPriority
                        ? 'border-yellow-300 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                          {contact.isPriority && (
                            <Star className="h-5 w-5 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <p className="text-blue-600 font-medium">{contact.phone}</p>
                        <p className="text-gray-600">{contact.relationship}</p>
                        {contact.isPriority && (
                          <span className="inline-block mt-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full font-medium">
                            Priority Contact
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditContact(contact)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                          title="Edit contact"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          title="Delete contact"
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