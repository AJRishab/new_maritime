import React, { useState } from 'react';
import { Users, Send, AlertTriangle, Phone, MapPin, Clock, MessageSquare, Shield, RefreshCw } from 'lucide-react';
import { BoatData, CoastGuardMessage } from '../App';

interface CoastGuardDashboardProps {
  boats: BoatData[];
  onSendMessage: (targetBoat: string, message: string, priority: 'low' | 'medium' | 'high') => void;
  onUpdateBoatStatus: (aisId: string, status: BoatData['status']) => void;
  messages: CoastGuardMessage[];
  onRefreshVessels?: () => void;
}

const CoastGuardDashboard: React.FC<CoastGuardDashboardProps> = ({
  boats,
  onSendMessage,
  onUpdateBoatStatus,
  messages,
  onRefreshVessels
}) => {
  const [selectedBoat, setSelectedBoat] = useState<string>('');
  const [messageText, setMessageText] = useState('');
  const [messagePriority, setMessagePriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBoat && messageText.trim()) {
      onSendMessage(selectedBoat, messageText.trim(), messagePriority);
      setMessageText('');
    }
  };

  const getStatusColor = (status: BoatData['status']) => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'danger': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const quickMessages = [
    { text: "Please reduce speed and maintain safe distance from restricted zones", priority: 'medium' as const },
    { text: "IMMEDIATE: Exit prohibited fishing zone immediately", priority: 'high' as const },
    { text: "Weather advisory: Strong winds expected in your area", priority: 'medium' as const },
    { text: "Routine check: Please confirm your current status", priority: 'low' as const },
    { text: "EMERGENCY: Return to port immediately", priority: 'high' as const }
  ];

  // Test function to add a demo vessel
  const addTestVessel = () => {
    const testVessel = {
      aisId: '999999999',
      boatId: 'TEST-VESSEL',
      location: { lat: 37.7749, lng: -122.4194, timestamp: Date.now() },
      status: 'safe' as const,
      speed: 5,
      heading: 180,
      lastUpdate: Date.now(),
      fishermanName: 'Test Captain',
      contactInfo: '+1-555-0123'
    };

    const storedVessels = localStorage.getItem('registeredVessels');
    let vessels = storedVessels ? JSON.parse(storedVessels) : [];
    vessels.push(testVessel);
    localStorage.setItem('registeredVessels', JSON.stringify(vessels));
    
    // Dispatch custom event for immediate notification
    window.dispatchEvent(new CustomEvent('vesselsUpdated'));
    
    console.log('🧪 Test vessel added:', testVessel);
  };

  return (
    <div className="space-y-6">
      {/* Vessel Overview */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Active Vessels ({boats.length})
            </h3>
            {onRefreshVessels && (
              <button
                onClick={onRefreshVessels}
                className="bg-red-500 hover:bg-red-400 text-white p-2 rounded-lg transition-colors flex items-center"
                title="Refresh vessel data"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        <div className="p-6">
          {boats.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">No Active Vessels</h4>
              <p className="text-gray-500 mb-4">
                No fishermen have registered yet. Once fishermen register through the portal,
                their vessels will appear here for monitoring.
              </p>
              {onRefreshVessels && (
                <button
                  onClick={onRefreshVessels}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center mx-auto"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check for New Registrations
                </button>
              )}
              <div className="mt-4 text-xs text-gray-400">
                💡 Tip: Open the fisherman portal in another tab to register a vessel
              </div>
              <div className="mt-4">
                <button
                  onClick={addTestVessel}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  🧪 Add Test Vessel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {boats.length} active vessel{boats.length !== 1 ? 's' : ''}
                </div>
                {onRefreshVessels && (
                  <button
                    onClick={onRefreshVessels}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
                    title="Refresh vessel data"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boats.map((boat) => (
                <div key={boat.aisId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{boat.boatId}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(boat.status)}`}>
                      {boat.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-2" />
                      {boat.fishermanName}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-2" />
                      {boat.contactInfo}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-2" />
                      {boat.location.lat.toFixed(4)}, {boat.location.lng.toFixed(4)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-2" />
                      {formatTime(boat.lastUpdate)}
                    </div>
                  </div>

                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => onUpdateBoatStatus(boat.aisId, 'warning')}
                      className="flex-1 bg-yellow-100 text-yellow-800 text-xs py-1 px-2 rounded hover:bg-yellow-200 transition-colors"
                    >
                      Set Warning
                    </button>
                    <button
                      onClick={() => onUpdateBoatStatus(boat.aisId, 'safe')}
                      className="flex-1 bg-green-100 text-green-800 text-xs py-1 px-2 rounded hover:bg-green-200 transition-colors"
                    >
                      Mark Safe
                    </button>
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
        </div>
      </div>

      {/* Message Center */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
          <h3 className="text-lg font-semibold flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Message Center
          </h3>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSendMessage} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Vessel</label>
                <select
                  value={selectedBoat}
                  onChange={(e) => setSelectedBoat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a vessel...</option>
                  {boats.map((boat) => (
                    <option key={boat.aisId} value={boat.boatId}>
                      {boat.boatId} - {boat.fishermanName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={messagePriority}
                  onChange={(e) => setMessagePriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Enter your message to the vessel..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={!selectedBoat || !messageText.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </button>
          </form>

          {/* Quick Messages */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Quick Messages</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {quickMessages.map((msg, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setMessageText(msg.text);
                    setMessagePriority(msg.priority);
                  }}
                  className={`text-left p-2 rounded text-xs border hover:shadow-sm transition-all ${
                    msg.priority === 'high' ? 'border-red-200 bg-red-50 hover:bg-red-100' :
                    msg.priority === 'medium' ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100' :
                    'border-blue-200 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {msg.text}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Messages */}
          {messages.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium text-gray-900 mb-3">Recent Messages</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {messages.slice(0, 5).map((message) => (
                  <div key={message.id} className="flex items-start justify-between p-2 bg-gray-50 rounded text-sm">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{message.targetBoat}</div>
                      <div className="text-gray-600">{message.message}</div>
                    </div>
                    <div className="text-right ml-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        message.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        message.status === 'acknowledged' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {message.status}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoastGuardDashboard;
