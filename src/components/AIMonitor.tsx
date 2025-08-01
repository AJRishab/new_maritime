import React, { useEffect, useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Shield, Activity } from 'lucide-react';
import { BoatData, Alert } from '../App';

interface AIMonitorProps {
  boatData: BoatData | null;
  onAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void;
  onStatusChange: (status: BoatData['status']) => void;
}

interface BehaviorAnalysis {
  riskLevel: 'low' | 'medium' | 'high';
  patterns: string[];
  recommendation: string;
  confidence: number;
}

const AIMonitor: React.FC<AIMonitorProps> = ({ boatData, onAlert, onStatusChange }) => {
  const [analysis, setAnalysis] = useState<BehaviorAnalysis>({
    riskLevel: 'low',
    patterns: [],
    recommendation: 'Normal operation',
    confidence: 0
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prohibitedZones] = useState([
    { name: 'Marine Protected Area', lat: 37.7749, lng: -122.4194, radius: 0.01 },
    { name: 'Spawning Ground', lat: 37.7849, lng: -122.4094, radius: 0.008 },
    { name: 'Restricted Fishing Zone', lat: 37.7649, lng: -122.4294, radius: 0.012 }
  ]);

  useEffect(() => {
    if (!boatData) return;

    const analyzeInterval = setInterval(() => {
      setIsAnalyzing(true);
      
      // Simulate AI analysis delay
      setTimeout(() => {
        const newAnalysis = performBehaviorAnalysis(boatData);
        setAnalysis(newAnalysis);
        checkProhibitedZones(boatData);
        setIsAnalyzing(false);
      }, 1500);
    }, 10000); // Analyze every 10 seconds

    return () => clearInterval(analyzeInterval);
  }, [boatData]);

  const performBehaviorAnalysis = (data: BoatData): BehaviorAnalysis => {
    const patterns: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence

    // Simulate AI pattern detection
    if (data.speed > 15) {
      patterns.push('High speed operation detected');
      riskLevel = 'medium';
    }

    if (data.speed < 2 && data.speed > 0) {
      patterns.push('Slow drift pattern - possible fishing activity');
      riskLevel = 'medium';
    }

    // Random pattern simulation
    const randomPatterns = [
      'Circular movement pattern detected',
      'Consistent heading maintained',
      'Normal transit behavior',
      'Irregular speed variations',
      'Route deviation from planned course'
    ];

    if (Math.random() > 0.7) {
      patterns.push(randomPatterns[Math.floor(Math.random() * randomPatterns.length)]);
    }

    // Simulate risk escalation
    if (Math.random() > 0.85) {
      riskLevel = 'high';
      patterns.push('Potential prohibited zone approach');
      confidence = Math.random() * 0.2 + 0.8; // 80-100% for high risk
    }

    const recommendation = getRiskRecommendation(riskLevel);

    return { riskLevel, patterns, recommendation, confidence };
  };

  const getRiskRecommendation = (risk: 'low' | 'medium' | 'high'): string => {
    switch (risk) {
      case 'high':
        return 'Immediate attention required - review current activity';
      case 'medium':
        return 'Monitor closely - verify operational compliance';
      default:
        return 'Continue normal operation - all systems nominal';
    }
  };

  const checkProhibitedZones = (data: BoatData) => {
    prohibitedZones.forEach(zone => {
      const distance = calculateDistance(
        data.location.lat,
        data.location.lng,
        zone.lat,
        zone.lng
      );

      if (distance <= zone.radius) {
        onAlert({
          type: 'danger',
          message: `PROHIBITED ZONE ENTRY: Vessel has entered ${zone.name}`,
          zone: zone.name
        });
        onStatusChange('danger');
      } else if (distance <= zone.radius * 1.5) {
        onAlert({
          type: 'warning',
          message: `ZONE WARNING: Approaching ${zone.name} - maintain safe distance`,
          zone: zone.name
        });
        onStatusChange('warning');
      }
    });
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 100; // Convert to degrees for zone comparison
  };

  if (!boatData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-500">
          <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>AI monitoring standby...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold">AI Behavior Monitor</h3>
          </div>
          {isAnalyzing && (
            <Activity className="h-5 w-5 animate-pulse" />
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-gray-600 mr-2" />
            <span className="font-medium text-gray-900">Risk Assessment</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            analysis.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
            analysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {analysis.riskLevel.toUpperCase()} RISK
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">AI Confidence</span>
            <span className="text-sm font-bold text-gray-900">{(analysis.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${analysis.confidence * 100}%` }}
            ></div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Detected Patterns
          </h4>
          {analysis.patterns.length > 0 ? (
            <ul className="space-y-2">
              {analysis.patterns.map((pattern, index) => (
                <li key={index} className="flex items-start text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">{pattern}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No unusual patterns detected</p>
          )}
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            AI Recommendation
          </h4>
          <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
            {analysis.recommendation}
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 mb-1">Prohibited Zones Active</p>
              <p className="text-yellow-700">
                {prohibitedZones.length} fishing restriction zones are being monitored
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMonitor;