import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapPin, Satellite, AlertCircle, CheckCircle, Shield, Activity } from 'lucide-react';
import { debugGeolocation, getGeolocationErrorMessage, checkGeolocationSupport } from '../utils/geolocationDebug';

interface CoastGuardLocationTrackerProps {
  onLocationUpdate: (lat: number, lng: number, speed?: number, heading?: number) => void;
  isTracking: boolean;
  vesselId: string;
  onTrackingToggle: (enabled: boolean) => void;
}

const CoastGuardLocationTracker: React.FC<CoastGuardLocationTrackerProps> = ({ 
  onLocationUpdate, 
  isTracking, 
  vesselId,
  onTrackingToggle 
}) => {
  const [locationStatus, setLocationStatus] = useState<'requesting' | 'granted' | 'denied' | 'unavailable' | 'timeout'>('requesting');
  const [accuracy, setAccuracy] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const [heading, setHeading] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryAttempts, setRetryAttempts] = useState<number>(0);

  // Use ref to store the latest callback without causing re-renders
  const onLocationUpdateRef = useRef(onLocationUpdate);
  onLocationUpdateRef.current = onLocationUpdate;

  useEffect(() => {
    if (!isTracking) return;

    // Debug geolocation support for Coast Guard
    console.log('🛡️ Coast Guard vessel tracking initiated:', vesselId);
    debugGeolocation();

    const supportCheck = checkGeolocationSupport();
    if (!supportCheck.supported) {
      setLocationStatus('unavailable');
      setErrorMessage(supportCheck.message);
      return;
    }

    // FORCE immediate high-accuracy GPS request
    console.log('🛡️ COAST GUARD: Requesting LIVE GPS location...');

    // First try to get immediate position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('🛡️ COAST GUARD: Got immediate location!', {
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
          accuracy: position.coords.accuracy.toFixed(0) + 'm'
        });

        setLocationStatus('granted');
        setAccuracy(position.coords.accuracy);
        setLastUpdate(Date.now());

        const speedKnots = position.coords.speed !== null ? position.coords.speed * 1.94384 : 0;
        const headingDegrees = position.coords.heading !== null ? position.coords.heading : 0;
        setSpeed(speedKnots);
        setHeading(headingDegrees);

        onLocationUpdateRef.current(
          position.coords.latitude,
          position.coords.longitude,
          speedKnots,
          headingDegrees
        );
      },
      (error) => {
        console.warn('🛡️ Coast Guard immediate position failed, will wait for watchPosition:', {
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

        // Calculate speed and heading if available
        const speedKnots = position.coords.speed !== null ? position.coords.speed * 1.94384 : 0;
        const headingDegrees = position.coords.heading !== null ? position.coords.heading : 0;

        setSpeed(speedKnots);
        setHeading(headingDegrees);

        // Debug logging for Coast Guard position updates
        console.log('🛡️ COAST GUARD: Live GPS update:', {
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
          accuracy: position.coords.accuracy.toFixed(0) + 'm',
          speed: speedKnots.toFixed(1) + ' kts',
          heading: headingDegrees.toFixed(0) + '°',
          timestamp: new Date().toLocaleTimeString()
        });

        onLocationUpdateRef.current(
          position.coords.latitude,
          position.coords.longitude,
          speedKnots,
          headingDegrees
        );
      },
      (error) => {
        console.error('🛡️ Coast Guard GPS error details:', {
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
            console.warn('Coast Guard: Location permission denied by user');
            break;
          case 2: // POSITION_UNAVAILABLE
            setLocationStatus('unavailable');
            console.warn('Coast Guard: GPS position unavailable');
            break;
          case 3: // TIMEOUT
            setLocationStatus('timeout');
            setRetryAttempts(prev => prev + 1);
            console.warn('Coast Guard: GPS request timed out');
            break;
          default:
            setLocationStatus('denied');
            console.error('Coast Guard: Unknown geolocation error:', error);
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
        return 'Coast Guard vessel tracking active';
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 text-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Coast Guard Vessel Tracking
          </h3>
          {getStatusIcon()}
        </div>
        <p className="text-sm text-red-200 mt-1">
          Vessel ID: {vesselId}
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isTracking}
              onChange={(e) => onTrackingToggle(e.target.checked)}
              className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Enable Live Tracking
            </span>
          </label>
          {isTracking && locationStatus === 'granted' && (
            <div className="flex items-center text-green-600 bg-green-100 px-2 py-1 rounded-full">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              <span className="text-xs font-medium">LIVE</span>
            </div>
          )}
        </div>

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

        {locationStatus === 'requesting' && isTracking && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Satellite className="h-4 w-4 text-blue-600 mr-2 animate-pulse" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Getting Coast Guard live location...</p>
                <p>Please allow location access when prompted</p>
              </div>
            </div>
          </div>
        )}

        {locationStatus === 'granted' && isTracking && (
          <>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <div className="text-sm text-green-700">
                  <p className="font-medium">✅ COAST GUARD LIVE LOCATION</p>
                  <p>Using real GPS coordinates</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Accuracy:</span>
                <span className={`text-sm font-medium ${accuracy > 100 ? 'text-red-600' : accuracy > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                  ±{accuracy.toFixed(0)}m {accuracy > 100 ? '(Poor)' : accuracy > 50 ? '(Fair)' : '(Good)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Speed:</span>
                <span className="text-sm font-medium text-gray-900">{speed.toFixed(1)} kts</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Heading:</span>
                <span className="text-sm font-medium text-gray-900">{heading.toFixed(0)}°</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Last Update:</span>
                <span className="text-sm font-medium text-gray-900">
                  {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
                </span>
              </div>
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
                {locationStatus === 'denied' && (
                  <>
                    <p>Please enable location permissions to track Coast Guard vessel position for operational coordination.</p>
                    <button
                      onClick={handleRetry}
                      className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                    >
                      Try Again
                    </button>
                  </>
                )}
                {locationStatus === 'timeout' && (
                  <>
                    <p>Try refreshing the page or check your internet connection.</p>
                    <button
                      onClick={handleRetry}
                      className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                    >
                      Retry ({retryAttempts} attempts)
                    </button>
                  </>
                )}
                {locationStatus === 'unavailable' && (
                  <p>Your device or browser doesn't support location tracking.</p>
                )}
              </div>
            </div>
          </div>
        )}



        <div className="pt-4 border-t">
          <div className="flex items-center text-xs text-gray-500">
            <Satellite className="h-3 w-3 mr-1" />
            High-precision GPS tracking for Coast Guard operational coordination
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoastGuardLocationTracker;
