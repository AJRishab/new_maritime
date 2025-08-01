// Shared geolocation service to ensure all vessels get the same location
class SharedGeolocationService {
  private static instance: SharedGeolocationService;
  private currentPosition: GeolocationPosition | null = null;
  private callbacks: Set<(position: GeolocationPosition) => void> = new Set();
  private errorCallbacks: Set<(error: GeolocationPositionError) => void> = new Set();
  private watchId: number | null = null;
  private isWatching = false;

  static getInstance(): SharedGeolocationService {
    if (!SharedGeolocationService.instance) {
      SharedGeolocationService.instance = new SharedGeolocationService();
    }
    return SharedGeolocationService.instance;
  }

  startWatching() {
    if (this.isWatching || !navigator.geolocation) {
      return;
    }

    this.isWatching = true;
    console.log('🌍 Starting shared geolocation service...');

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentPosition = position;
        console.log('🛰️ Shared location update:', {
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
          accuracy: position.coords.accuracy.toFixed(0) + 'm',
          timestamp: new Date().toLocaleTimeString()
        });
        
        // Notify all subscribers
        this.callbacks.forEach(callback => callback(position));
      },
      (error) => {
        console.error('🚨 Shared geolocation error:', {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString()
        });
        
        // Notify all error subscribers
        this.errorCallbacks.forEach(callback => callback(error));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 3000
      }
    );
  }

  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isWatching = false;
    console.log('🔴 Stopped shared geolocation service');
  }

  subscribe(
    onPosition: (position: GeolocationPosition) => void,
    onError: (error: GeolocationPositionError) => void
  ) {
    // Prevent duplicate subscriptions
    if (this.callbacks.has(onPosition)) {
      console.warn('Duplicate geolocation subscription detected, ignoring...');
      return () => {}; // Return empty unsubscribe function
    }

    this.callbacks.add(onPosition);
    this.errorCallbacks.add(onError);

    // If we already have a position, send it immediately
    if (this.currentPosition) {
      onPosition(this.currentPosition);
    }

    // Start watching if not already
    if (!this.isWatching) {
      this.startWatching();
    }

    // Return unsubscribe function
    return () => {
      this.callbacks.delete(onPosition);
      this.errorCallbacks.delete(onError);
      
      // Stop watching if no more subscribers
      if (this.callbacks.size === 0) {
        this.stopWatching();
      }
    };
  }

  getCurrentPosition(): GeolocationPosition | null {
    return this.currentPosition;
  }

  hasActiveSubscribers(): boolean {
    return this.callbacks.size > 0;
  }
}

export const sharedGeolocation = SharedGeolocationService.getInstance();
