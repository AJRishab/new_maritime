import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { BoatData, CoastGuardVessel } from '../App';
import 'leaflet/dist/leaflet.css';

// Add CSS animations for icons
const addIconStyles = () => {
  if (typeof document !== 'undefined' && !document.getElementById('icon-animations')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'icon-animations';
    styleElement.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(styleElement);
  }
};

// Initialize styles
addIconStyles();

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface WorldMapProps {
  boats: BoatData[];
  userType: 'fisherman' | 'coastguard';
  currentBoat?: BoatData | null;
  coastGuardVessel?: CoastGuardVessel | null;
  onBoatSelect?: (boat: BoatData) => void;
}

// Custom boat icons
const createBoatIcon = (status: BoatData['status'], isCurrentUser: boolean = false) => {
  const color = status === 'safe' ? '#10B981' : status === 'warning' ? '#F59E0B' : '#EF4444';
  const size = isCurrentUser ? 28 : 18; // Slightly smaller to avoid overlap

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.6}px;
        color: white;
        font-weight: bold;
        position: relative;
      ">
        🚢
        ${isCurrentUser ? '<div style="position: absolute; top: -1px; right: -1px; width: 6px; height: 6px; background-color: #3B82F6; border-radius: 50%; border: 1px solid white;"></div>' : ''}
      </div>
    `,
    className: 'custom-boat-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Coast Guard vessel icon
const createCoastGuardIcon = (isTracking: boolean = false) => {
  const color = '#DC2626'; // Red for Coast Guard
  const size = 35;

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.5}px;
        color: white;
        font-weight: bold;
        position: relative;
        animation: ${isTracking ? 'pulse 2s infinite' : 'none'};
      ">
        🛡️
        ${isTracking ? '<div style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background-color: #10B981; border-radius: 50%; animation: pulse 2s infinite;"></div>' : ''}
      </div>
    `,
    className: 'custom-coastguard-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Prohibited zones
const prohibitedZones = [
  { 
    name: 'Marine Protected Area', 
    center: [37.7749, -122.4194] as [number, number], 
    radius: 1000,
    color: '#EF4444'
  },
  { 
    name: 'Spawning Ground', 
    center: [37.7849, -122.4094] as [number, number], 
    radius: 800,
    color: '#F59E0B'
  },
  { 
    name: 'Restricted Fishing Zone', 
    center: [37.7649, -122.4294] as [number, number], 
    radius: 1200,
    color: '#EF4444'
  }
];

// Component to update map view when boats change
const MapUpdater: React.FC<{ boats: BoatData[]; userType: string; coastGuardVessel?: CoastGuardVessel | null }> = ({ boats, userType, coastGuardVessel }) => {
  const map = useMap();
  const lastBoatCount = useRef(0);
  const hasInitialized = useRef(false);
  const isUserInteracting = useRef(false);

  // Track user interactions
  useEffect(() => {
    const handleZoomStart = () => {
      isUserInteracting.current = true;
    };

    const handleMoveStart = () => {
      isUserInteracting.current = true;
    };

    const handleZoomEnd = () => {
      // Reset after a delay to allow for natural zoom completion
      setTimeout(() => {
        isUserInteracting.current = false;
      }, 1000);
    };

    const handleMoveEnd = () => {
      // Reset after a delay to allow for natural movement completion
      setTimeout(() => {
        isUserInteracting.current = false;
      }, 1000);
    };

    map.on('zoomstart', handleZoomStart);
    map.on('movestart', handleMoveStart);
    map.on('zoomend', handleZoomEnd);
    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('zoomstart', handleZoomStart);
      map.off('movestart', handleMoveStart);
      map.off('zoomend', handleZoomEnd);
      map.off('moveend', handleMoveEnd);
    };
  }, [map]);

  useEffect(() => {
    // Don't auto-adjust if user is currently interacting
    if (isUserInteracting.current) {
      return;
    }

    if (userType === 'fisherman' && boats.length === 1) {
      // Center on the single boat for fisherman view
      const boat = boats[0];
      map.setView([boat.location.lat, boat.location.lng], 15);
    } else if (userType === 'coastguard') {
      // Only auto-adjust for Coast Guard when:
      // 1. First initialization
      // 2. Number of vessels changes significantly
      // 3. No vessels exist and we need to show Coast Guard vessel
      
      const currentBoatCount = boats.length;
      const shouldAutoAdjust = !hasInitialized.current || 
                              Math.abs(currentBoatCount - lastBoatCount.current) > 0 ||
                              (currentBoatCount === 0 && coastGuardVessel);

      if (shouldAutoAdjust) {
        const allPositions: [number, number][] = [];

        // Add all fishing boats
        boats.forEach(boat => {
          allPositions.push([boat.location.lat, boat.location.lng]);
        });

        // Add Coast Guard vessel
        if (coastGuardVessel) {
          allPositions.push([coastGuardVessel.location.lat, coastGuardVessel.location.lng]);
        }

        if (allPositions.length === 1) {
          // If only one vessel, center on it with good zoom
          map.setView(allPositions[0], 15);
        } else if (allPositions.length > 1) {
          // If multiple vessels, fit all in bounds but respect current zoom if it's good
          const currentZoom = map.getZoom();
          const bounds = L.latLngBounds(allPositions);
          
          // Only fit bounds if current zoom is too far out or too close
          if (currentZoom < 10 || currentZoom > 18) {
            map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
          }
        } else if (coastGuardVessel && currentBoatCount === 0) {
          // Fallback: center on Coast Guard vessel only if no boats
          map.setView([coastGuardVessel.location.lat, coastGuardVessel.location.lng], 13);
        }

        lastBoatCount.current = currentBoatCount;
        hasInitialized.current = true;
      }
    }
  }, [boats, userType, coastGuardVessel, map]);

  return null;
};

const WorldMap: React.FC<WorldMapProps> = ({ boats, userType, currentBoat, coastGuardVessel, onBoatSelect }) => {
  const mapRef = useRef<L.Map>(null);

  // Default center (San Francisco Bay area)
  const defaultCenter: [number, number] = [37.7749, -122.4194];
  const defaultZoom = 12;

  // Function to reset map view to optimal position
  const resetMapView = () => {
    if (mapRef.current) {
      const map = mapRef.current;
      const allPositions: [number, number][] = [];

      // Add all fishing boats
      boats.forEach(boat => {
        allPositions.push([boat.location.lat, boat.location.lng]);
      });

      // Add Coast Guard vessel
      if (coastGuardVessel) {
        allPositions.push([coastGuardVessel.location.lat, coastGuardVessel.location.lng]);
      }

      if (allPositions.length === 1) {
        map.setView(allPositions[0], 15);
      } else if (allPositions.length > 1) {
        const bounds = L.latLngBounds(allPositions);
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
      } else if (coastGuardVessel) {
        map.setView([coastGuardVessel.location.lat, coastGuardVessel.location.lng], 13);
      } else {
        map.setView(defaultCenter, defaultZoom);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className={`bg-gradient-to-r p-4 text-white ${
        userType === 'coastguard' ? 'from-red-600 to-red-700' : 'from-blue-600 to-blue-700'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {userType === 'coastguard' ? 'Fleet Tracking Map' : 'Live Position Map'}
            </h3>
            <p className="text-sm opacity-90">
              {userType === 'coastguard' 
                ? `Monitoring ${boats.length} active vessels` 
                : 'Real-time GPS tracking with prohibited zones'
              }
            </p>
          </div>
          {userType === 'coastguard' && (
            <div className="flex items-center space-x-2">
              <div className="text-xs opacity-75">
                💡 Zoom freely - auto-adjust disabled
              </div>
              <button
                onClick={resetMapView}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
                title="Reset map view to show all vessels"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset View
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="h-96 relative">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater boats={boats} userType={userType} coastGuardVessel={coastGuardVessel} />
          
          {/* Prohibited Zones */}
          {prohibitedZones.map((zone, index) => (
            <Circle
              key={index}
              center={zone.center}
              radius={zone.radius}
              pathOptions={{
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: 0.2,
                weight: 2,
                dashArray: '5, 5'
              }}
            >
              <Popup>
                <div className="text-center">
                  <h4 className="font-semibold text-red-800">{zone.name}</h4>
                  <p className="text-sm text-red-600">Prohibited Fishing Zone</p>
                  <p className="text-xs text-gray-600">Radius: {zone.radius}m</p>
                </div>
              </Popup>
            </Circle>
          ))}
          
          {/* Boat Markers */}
          {boats.map((boat, index) => {
            const isCurrentUser = currentBoat?.aisId === boat.aisId;
            
            // Check if this boat is at the same location as Coast Guard vessel
            const isAtCoastGuardLocation = coastGuardVessel && 
              Math.abs(boat.location.lat - coastGuardVessel.location.lat) < 0.0001 && 
              Math.abs(boat.location.lng - coastGuardVessel.location.lng) < 0.0001;
            
            // Add small offset if at same location as Coast Guard
            // Use index to create different offsets for multiple vessels
            const offset = isAtCoastGuardLocation ? 0.0002 + (index * 0.0001) : 0;
            const boatPosition = isAtCoastGuardLocation ? 
              [boat.location.lat + offset, boat.location.lng + offset] : 
              [boat.location.lat, boat.location.lng];
            
            return (
              <Marker
                key={`BOAT-${boat.aisId}-${boat.location.lat.toFixed(6)}-${boat.location.lng.toFixed(6)}-${boat.lastUpdate}`}
                position={boatPosition}
                icon={createBoatIcon(boat.status, isCurrentUser)}
                eventHandlers={{
                  click: () => onBoatSelect?.(boat)
                }}
              >
                <Popup>
                  <div className="min-w-48">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{boat.boatId}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        boat.status === 'safe' ? 'bg-green-100 text-green-800' :
                        boat.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {boat.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div><strong>AIS ID:</strong> {boat.aisId}</div>
                      {boat.fishermanName && (
                        <div><strong>Captain:</strong> {boat.fishermanName}</div>
                      )}
                      {boat.contactInfo && userType === 'coastguard' && (
                        <div><strong>Contact:</strong> {boat.contactInfo}</div>
                      )}
                      <div><strong>Speed:</strong> {boat.speed.toFixed(1)} kts</div>
                      <div><strong>Heading:</strong> {boat.heading}°</div>
                      <div><strong>Position:</strong></div>
                      <div className="font-mono text-xs">
                        {boat.location.lat.toFixed(6)}, {boat.location.lng.toFixed(6)}
                      </div>
                      <div><strong>Last Update:</strong> {new Date(boat.lastUpdate).toLocaleTimeString()}</div>
                    </div>

                    {isCurrentUser && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800 font-medium">
                        📍 Your Current Position
                      </div>
                    )}
                    {isAtCoastGuardLocation && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800 font-medium">
                        ⚠️ Position offset to avoid overlap with Coast Guard vessel
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Coast Guard Vessel Marker */}
          {coastGuardVessel && userType === 'coastguard' && (
            <Marker
              key={`CG-${coastGuardVessel.vesselId}-${coastGuardVessel.location.lat.toFixed(6)}-${coastGuardVessel.location.lng.toFixed(6)}-${coastGuardVessel.lastUpdate}`}
              position={[coastGuardVessel.location.lat, coastGuardVessel.location.lng]}
              icon={createCoastGuardIcon(coastGuardVessel.isTracking)}
            >
              <Popup>
                <div className="min-w-48">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{coastGuardVessel.vesselName}</h4>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      COAST GUARD
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div><strong>Vessel ID:</strong> {coastGuardVessel.vesselId}</div>
                    <div><strong>Speed:</strong> {coastGuardVessel.speed.toFixed(1)} kts</div>
                    <div><strong>Heading:</strong> {coastGuardVessel.heading}°</div>
                    <div><strong>Position:</strong></div>
                    <div className="font-mono text-xs">
                      {coastGuardVessel.location.lat.toFixed(6)}, {coastGuardVessel.location.lng.toFixed(6)}
                    </div>
                    <div><strong>Last Update:</strong> {new Date(coastGuardVessel.lastUpdate).toLocaleTimeString()}</div>
                    <div><strong>Tracking:</strong>
                      <span className={coastGuardVessel.isTracking ? 'text-green-600' : 'text-gray-500'}>
                        {coastGuardVessel.isTracking ? ' Active' : ' Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-800 font-medium">
                    🛡️ Coast Guard Vessel
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Safe</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span>Warning</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span>Danger</span>
            </div>
            {userType === 'coastguard' && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                <span>Coast Guard</span>
              </div>
            )}
          </div>
          <div className="text-gray-500">
            🚢 = Vessel | 🛡️ = Coast Guard | 🔴 = Prohibited Zone
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
