// Geolocation debugging utility
export const debugGeolocation = () => {
  const debug = {
    isSupported: 'geolocation' in navigator,
    isSecureContext: window.isSecureContext,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };
  
  console.log('Geolocation Debug Info:', debug);
  return debug;
};

export const getGeolocationErrorMessage = (error: GeolocationPositionError): string => {
  const errorMessages = {
    1: 'Location access was denied. Please check your browser permissions.',
    2: 'Location information is unavailable. Check your GPS signal.',
    3: 'Location request timed out. Please try again.',
  };
  
  return errorMessages[error.code as keyof typeof errorMessages] || 
         `Unknown geolocation error (${error.code}): ${error.message}`;
};

export const checkGeolocationSupport = (): { supported: boolean; message: string } => {
  if (!('geolocation' in navigator)) {
    return {
      supported: false,
      message: 'Geolocation is not supported by this browser.'
    };
  }
  
  if (!window.isSecureContext && window.location.hostname !== 'localhost') {
    return {
      supported: false,
      message: 'Geolocation requires a secure connection (HTTPS).'
    };
  }
  
  return {
    supported: true,
    message: 'Geolocation is supported and ready.'
  };
};
