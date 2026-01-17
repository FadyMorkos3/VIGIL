import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';

export interface Incident {
  id: string;
  timestamp: string;
  type: 'violence' | 'accident' | 'suspicious';
  location: string;
  cameraId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'active' | 'resolved' | 'dismissed';
  videoUrl?: string;
  confidence: number;
  responseTime?: string;
}

export function useRealtimeIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [incidentCounter, setIncidentCounter] = useState(1);

  // Generate mock incidents periodically
  useEffect(() => {
    const generateIncident = () => {
      const types: Array<'violence' | 'accident' | 'suspicious'> = ['violence', 'accident', 'suspicious'];
      const locations = ['Main Entrance', 'Parking Lot A', 'Building B - Floor 2', 'Storage Area', 'Perimeter Gate', 'Loading Dock'];
      const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
      const descriptions = {
        violence: ['Physical altercation detected', 'Aggressive behavior detected', 'Fight in progress', 'Assault detected'],
        accident: ['Vehicle collision detected', 'Person fallen', 'Equipment malfunction', 'Slip and fall incident'],
        suspicious: ['Unauthorized entry attempt', 'Loitering detected', 'Unattended package', 'Suspicious movement pattern']
      };

      const type = types[Math.floor(Math.random() * types.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const cameraId = `CAM-${String(Math.floor(Math.random() * 6) + 1).padStart(3, '0')}`;
      const description = descriptions[type][Math.floor(Math.random() * descriptions[type].length)];
      const confidence = Math.floor(Math.random() * 20) + 80; // 80-99%

      const newIncident: Incident = {
        id: `INC-${Date.now()}-${incidentCounter}`,
        timestamp: new Date().toISOString(),
        type,
        location,
        cameraId,
        severity,
        description,
        status: 'active',
        videoUrl: `http://127.0.0.1:5000/videos/${cameraId}_sample.mp4`,
        confidence,
      };

      setIncidents(prev => [newIncident, ...prev]);
      setIncidentCounter(prev => prev + 1);

      // Show toast notification
      const severityColors = {
        low: '🟢',
        medium: '🟡',
        high: '🟠',
        critical: '🔴'
      };

      toast.error(`${severityColors[severity]} New Incident: ${type.toUpperCase()}`, {
        description: `${location} - ${description}`,
        duration: 5000,
      });

      // Play sound if enabled
      if (soundEnabled) {
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMjBS19y/HajDkHG2S57OihUBALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYMEmS56+mjTxALTKXh8bllHAU2jtXyzoYzBSF0wfDblUYM=');
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Ignore audio play errors (browser may block autoplay)
          });
        } catch (err) {
          // Ignore audio errors
        }
      }
    };

    // Initial incidents
    const initialIncidents: Incident[] = [
      {
        id: 'INC-001',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        type: 'violence',
        location: 'Main Entrance',
        cameraId: 'CAM-001',
        severity: 'high',
        description: 'Physical altercation detected',
        status: 'active',
        videoUrl: 'http://127.0.0.1:5000/videos/CAM-001_sample.mp4',
        confidence: 94,
      },
      {
        id: 'INC-002',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        type: 'accident',
        location: 'Parking Lot A',
        cameraId: 'CAM-003',
        severity: 'medium',
        description: 'Vehicle collision detected',
        status: 'resolved',
        videoUrl: 'http://127.0.0.1:5000/videos/CAM-003_sample.mp4',
        confidence: 87,
        responseTime: '3m 24s',
      },
    ];

    setIncidents(initialIncidents);

    // Generate new incident every 30-60 seconds
    const interval = setInterval(() => {
      generateIncident();
    }, Math.random() * 30000 + 30000); // 30-60 seconds

    return () => clearInterval(interval);
  }, [soundEnabled, incidentCounter]);

  const resolveIncident = (id: string) => {
    setIncidents(prev =>
      prev.map(incident =>
        incident.id === id
          ? { ...incident, status: 'resolved' as const, responseTime: '2m 15s' }
          : incident
      )
    );
    toast.success('Incident resolved successfully');
  };

  const dismissIncident = (id: string) => {
    setIncidents(prev =>
      prev.map(incident =>
        incident.id === id
          ? { ...incident, status: 'dismissed' as const }
          : incident
      )
    );
    toast.info('Incident dismissed');
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
    toast.info(soundEnabled ? 'Sound alerts disabled' : 'Sound alerts enabled');
  };

  const activeIncidents = incidents.filter(i => i.status === 'active');

  return {
    incidents,
    activeIncidents,
    resolveIncident,
    dismissIncident,
    soundEnabled,
    toggleSound,
  };
}
