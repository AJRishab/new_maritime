import React from 'react';
import { Shield, MapPin, Compass, Gauge, Clock } from 'lucide-react';
import { CoastGuardVessel } from '../App';

interface CoastGuardVesselStatusProps {
  vessel: CoastGuardVessel;
}

const CoastGuardVesselStatus: React.FC<CoastGuardVesselStatusProps> = ({ vessel }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 text-white">
        <h3 className="text-lg font-semibold flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Your Vessel Status
        </h3>
        <p className="text-sm text-red-200 mt-1">
          {vessel.vesselName}
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Shield className="h-4 w-4 text-red-600 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-700">Vessel ID</div>
                <div className="text-sm text-gray-900 font-mono">{vessel.vesselId}</div>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <MapPin className="h-4 w-4 text-blue-600 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-700">Position</div>
                <div className="text-xs text-gray-900 font-mono">
                  {vessel.location.lat.toFixed(6)}, {vessel.location.lng.toFixed(6)}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Gauge className="h-4 w-4 text-green-600 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-700">Speed</div>
                <div className="text-sm text-gray-900">{vessel.speed.toFixed(1)} kts</div>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Compass className="h-4 w-4 text-purple-600 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-700">Heading</div>
                <div className="text-sm text-gray-900">{vessel.heading}°</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Last Update:</span>
            </div>
            <span className="text-sm text-gray-900">{formatTime(vessel.lastUpdate)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${vessel.isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              Tracking Status: 
              <span className={vessel.isTracking ? 'text-green-600 ml-1' : 'text-gray-500 ml-1'}>
                {vessel.isTracking ? 'Active' : 'Inactive'}
              </span>
            </span>
          </div>
          {vessel.isTracking && (
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              LIVE
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoastGuardVesselStatus;
