import React from 'react';
import { MapPin, Compass, Gauge, Clock, Satellite } from 'lucide-react';
import { BoatData } from '../App';

interface DashboardProps {
  boatData: BoatData | null;
}

const Dashboard: React.FC<DashboardProps> = ({ boatData }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatCoordinate = (coord: number) => {
    return coord.toFixed(6);
  };

  if (!boatData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-500">
          <Satellite className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Waiting for vessel data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Live Vessel Tracking</h2>
        <p className="text-blue-100">Real-time position and status monitoring</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600 mb-1">Latitude</div>
            <div className="font-mono text-lg font-semibold">{formatCoordinate(boatData.location.lat)}</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600 mb-1">Longitude</div>
            <div className="font-mono text-lg font-semibold">{formatCoordinate(boatData.location.lng)}</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Gauge className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600 mb-1">Speed</div>
            <div className="font-mono text-lg font-semibold">{boatData.speed.toFixed(1)} kts</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Compass className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600 mb-1">Heading</div>
            <div className="font-mono text-lg font-semibold">{boatData.heading}°</div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm">Last Update: {formatTime(boatData.lastUpdate)}</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              boatData.status === 'safe' ? 'bg-green-100 text-green-800' :
              boatData.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              Status: {boatData.status.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Simulated Map View</h3>
          <div className="aspect-video bg-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-300"></div>
            <div className="relative z-10 text-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2 animate-pulse"></div>
              <div className="text-sm text-blue-800 font-medium">Current Position</div>
              <div className="text-xs text-blue-600 mt-1">
                {formatCoordinate(boatData.location.lat)}, {formatCoordinate(boatData.location.lng)}
              </div>
            </div>
            <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-medium">
              Restricted Zone
            </div>
            <div className="absolute bottom-4 right-4 bg-green-400 text-green-900 px-2 py-1 rounded text-xs font-medium">
              Safe Zone
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;