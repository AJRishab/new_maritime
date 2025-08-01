import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Satellite, AlertCircle, CheckCircle } from 'lucide-react';
import { debugGeolocation, getGeolocationErrorMessage, checkGeolocationSupport } from '../utils/geolocationDebug';

interface LocationTrackerProps {
  onLocationUpdate: (lat: number, lng: number) => void;
  isTracking: boolean;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({ onLocationUpdate, isTracking }) => {
  const [locationStatus, setLocationStatus] = useState<'requesting' | 'granted' | 'denied' | 'unavailable' | 'timeout'>('requesting');
  const [accuracy, setAccuracy] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryAttempts, setRetryAttempts] = useState<number>(0);

  // Use ref to store the latest callback without causing re-renders
  const onLocationUpdateRef = useRef(onLocationUpdate);
  onLocationUpdateRef.current = onLocationUpdate;

  useEffect(() => {
    if (!isTracking) return;

    // Debug geolocation support
    debugGeolocation();

    const supportCheck = checkGeolocationSupport();
    if (!supportCheck.supported) {
      setLocationStatus('unavailable');
      setErrorMessage(supportCheck.message);
      return;
    }

    // FORCE immediate high-accuracy GPS request
    console.log('🚢 FISHERMAN: Requesting LIVE GPS location...');

    // First try to get immediate position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('🚢 FISHERMAN: Got immediate location!', {
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
          accuracy: position.coords.accuracy.toFixed(0) + 'm'
        });
        setLocationStatus('granted');
        setAccuracy(position.coords.accuracy);
        setLastUpdate(Date.now());
        onLocationUpdateRef.current(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.warn('🚢 Immediate position failed, will wait for watchPosition:', {
          code: error.code,
          message: error.message,
          errorType: error.code === 1 ? 'Permission Denied' :
                     error.code === 2 ? 'Position Unavailable' :
                     error.code === 3 ? 'Timeout' : 'Unknown'
        });
        // Don't set error state yet, watchPosition might succeed
      },
      {
        enableHighAccuracy: true,
        timeout: 5000, // Shorter timeout for immediate position
        maximumAge: 0 // Force fresh location
      }
    );

    // Then start continuous watching
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocationStatus('granted');
        setAccuracy(position.coords.accuracy);
        setLastUpdate(Date.now());
        console.log('🚢 FISHERMAN: Live GPS update:', {
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
          accuracy: position.coords.accuracy.toFixed(0) + 'm'
        });
        onLocationUpdateRef.current(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('🚢 Fisherman GPS error details:', {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString()
        });

        // Use utility function for better error messaging
        const errorMessage = getGeolocationErrorMessage(error);
        setErrorMessage(errorMessage);

        // Handle different types of geolocation errors
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            setLocationStatus('denied');
            console.warn('Fisherman: Location permission denied by user');
            break;
          case 2: // POSITION_UNAVAILABLE
            setLocationStatus('unavailable');
            console.warn('Fisherman: GPS position unavailable');
            break;
          case 3: // TIMEOUT
            setLocationStatus('timeout');
            setRetryAttempts(prev => prev + 1);
            console.warn('Fisherman: GPS request timed out');
            break;
          default:
            setLocationStatus('denied');
            console.error('Fisherman: Unknown geolocation error:', error);
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000 // Get fresh location every second
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking]);

  const handleRetry = () => {
    setLocationStatus('requesting');
    setErrorMessage('');
    setRetryAttempts(0);
  };

  const getStatusIcon = () => {
    switch (locationStatus) {
      case 'granted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'denied':
      case 'unavailable':
      case 'timeout':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Satellite className="h-5 w-5 text-yellow-600 animate-pulse" />;
    }
  };

  const getStatusMessage = () => {
    switch (locationStatus) {
      case 'granted':
        return 'GPS tracking active';
      case 'denied':
        return 'Location access denied';
      case 'unavailable':
        return 'GPS unavailable';
      case 'timeout':
        return 'Location request timed out';
      default:
        return 'Requesting location access...';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-blue-600" />
          GPS Location Tracking
        </h3>
        {getStatusIcon()}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <span className={`text-sm font-medium ${
            locationStatus === 'granted' ? 'text-green-600' :
            ['denied', 'unavailable', 'timeout'].includes(locationStatus) ? 'text-red-600' :
            'text-yellow-600'
          }`}>
            {getStatusMessage()}
          </span>
        </div>

        {locationStatus === 'requesting' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Satellite className="h-4 w-4 text-blue-600 mr-2 animate-pulse" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Getting your live location...</p>
                <p>Please allow location access when prompted</p>
              </div>
            </div>
          </div>
        )}

        {locationStatus === 'granted' && (
          <>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <div className="text-sm text-green-700">
                  <p className="font-medium">✅ LIVE LOCATION ACTIVE</p>
                  <p>Using your real GPS coordinates</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Accuracy:</span>
              <span className={`text-sm font-medium ${accuracy > 100 ? 'text-red-600' : accuracy > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                ±{accuracy.toFixed(0)}m {accuracy > 100 ? '(Poor)' : accuracy > 50 ? '(Fair)' : '(Good)'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Last Update:</span>
              <span className="text-sm font-medium text-gray-900">
                {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </>
        )}

        {['denied', 'unavailable', 'timeout'].includes(locationStatus) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p className="font-medium mb-1">{getStatusMessage()}</p>
                <p className="mb-2">{errorMessage}</p>
                <div className="space-y-2">
                  {locationStatus === 'denied' && (
                    <>
                      <p>Please enable location permissions in your browser settings to track vessel position.</p>
                      <button
                        onClick={handleRetry}
                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
                      >
                        Try Again
                      </button>
                      <details className="text-xs mt-2">
                        <summary className="cursor-pointer hover:text-red-800 font-medium">Troubleshooting Steps</summary>
                        <ul className="mt-1 ml-4 list-disc space-y-1">
                          <li>Click the location icon in your browser's address bar</li>
                          <li>Select "Allow" for location access</li>
                          <li>Refresh the page and try again</li>
                          <li>Ensure your device's location services are enabled</li>
                        </ul>
                      </details>
                    </>
                  )}
                  {locationStatus === 'timeout' && (
                    <>
                      <p>Location request timed out. This may be due to poor GPS signal or network issues.</p>
                      <button
                        onClick={handleRetry}
                        className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                      >
                        Retry ({retryAttempts} attempts)
                      </button>
                    </>
                  )}
                  {locationStatus === 'unavailable' && (
                    <>
                      <p>Location information is currently unavailable.</p>
                      <details className="text-xs">
                        <summary className="cursor-pointer hover:text-red-800 font-medium">Possible Causes</summary>
                        <ul className="mt-1 ml-4 list-disc space-y-1">
                          <li>GPS service is disabled on your device</li>
                          <li>Poor GPS signal reception</li>
                          <li>Browser doesn't support geolocation</li>
                        </ul>
                      </details>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}



        <div className="pt-4 border-t">
          <div className="space-y-2">
            <div className="flex items-center text-xs text-gray-500">
              <Satellite className="h-3 w-3 mr-1" />
              High-accuracy GPS tracking enabled for precise vessel monitoring
            </div>
            {locationStatus === 'requesting' && (
              <div className="text-xs text-blue-600">
                💡 Make sure to click "Allow" when your browser asks for location permission
              </div>
            )}
            {(locationStatus === 'denied' || locationStatus === 'unavailable') && (
              <div className="text-xs text-red-600">
                🚨 Location required for maritime safety tracking
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationTracker;
