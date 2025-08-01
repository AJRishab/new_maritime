import React, { useState } from 'react';
import { Ship, Radio, ArrowRight, AlertCircle, Activity } from 'lucide-react';

interface RegistrationFormProps {
  onRegister: (aisId: string, boatId: string, fishermanName: string, contactInfo: string) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegister }) => {
  const [aisId, setAisId] = useState('');
  const [boatId, setBoatId] = useState('');
  const [fishermanName, setFishermanName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [errors, setErrors] = useState<{ aisId?: string; boatId?: string; fishermanName?: string; contactInfo?: string }>({});

  const validateForm = () => {
    const newErrors: { aisId?: string; boatId?: string; fishermanName?: string; contactInfo?: string } = {};
    
    if (!aisId.trim()) {
      newErrors.aisId = 'AIS Signal ID is required';
    } else if (!/^\d{9}$/.test(aisId.trim())) {
      newErrors.aisId = 'AIS ID must be exactly 9 digits';
    }

    if (!boatId.trim()) {
      newErrors.boatId = 'Boat ID is required';
    } else if (boatId.trim().length < 3) {
      newErrors.boatId = 'Boat ID must be at least 3 characters';
    }

    if (!fishermanName.trim()) {
      newErrors.fishermanName = 'Captain/Fisherman name is required';
    }

    if (!contactInfo.trim()) {
      newErrors.contactInfo = 'Contact information is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(contactInfo.trim().replace(/[-\s]/g, ''))) {
      newErrors.contactInfo = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onRegister(aisId.trim(), boatId.trim(), fishermanName.trim(), contactInfo.trim());
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 hover:shadow-3xl transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-6 shadow-lg animate-pulse">
            <Ship className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Vessel Registration
          </h2>
          <p className="text-gray-600 leading-relaxed">Enter your vessel credentials to begin advanced AI monitoring</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="aisId" className="block text-sm font-medium text-gray-700 mb-2">
              <Radio className="h-4 w-4 inline mr-2" />
              AIS Signal ID
            </label>
            <input
              type="text"
              id="aisId"
              value={aisId}
              onChange={(e) => setAisId(e.target.value)}
              placeholder="Enter 9-digit AIS ID"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.aisId ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } hover:border-blue-400 transition-all duration-200`}
              maxLength={9}
            />
            {errors.aisId && (
              <div className="flex items-center mt-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.aisId}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="boatId" className="block text-sm font-medium text-gray-700 mb-2">
              <Ship className="h-4 w-4 inline mr-2" />
              Registered Boat ID
            </label>
            <input
              type="text"
              id="boatId"
              value={boatId}
              onChange={(e) => setBoatId(e.target.value)}
              placeholder="Enter boat registration ID"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.boatId ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } hover:border-blue-400 transition-all duration-200`}
            />
            {errors.boatId && (
              <div className="flex items-center mt-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.boatId}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="fishermanName" className="block text-sm font-medium text-gray-700 mb-2">
              <Ship className="h-4 w-4 inline mr-2" />
              Captain/Fisherman Name
            </label>
            <input
              type="text"
              id="fishermanName"
              value={fishermanName}
              onChange={(e) => setFishermanName(e.target.value)}
              placeholder="Enter captain or fisherman name"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.fishermanName ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } hover:border-blue-400 transition-all duration-200`}
            />
            {errors.fishermanName && (
              <div className="flex items-center mt-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.fishermanName}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 mb-2">
              <Radio className="h-4 w-4 inline mr-2" />
              Contact Phone Number
            </label>
            <input
              type="tel"
              id="contactInfo"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Enter phone number for emergency contact"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.contactInfo ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } hover:border-blue-400 transition-all duration-200`}
            />
            {errors.contactInfo && (
              <div className="flex items-center mt-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.contactInfo}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center group"
          >
            <span className="flex items-center">
              Begin AI Monitoring
            </span>
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
          <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Demo Credentials
          </h3>
          <div className="text-xs text-blue-700 space-y-2">
            <div className="flex justify-between items-center">
              <span>AIS ID:</span>
              <span className="font-mono bg-white px-3 py-1 rounded-lg shadow-sm">123456789</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Boat ID:</span>
              <span className="font-mono bg-white px-3 py-1 rounded-lg shadow-sm">VESSEL-001</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Name:</span>
              <span className="font-mono bg-white px-3 py-1 rounded-lg shadow-sm">Captain Smith</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Phone:</span>
              <span className="font-mono bg-white px-3 py-1 rounded-lg shadow-sm">+1-555-0101</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;