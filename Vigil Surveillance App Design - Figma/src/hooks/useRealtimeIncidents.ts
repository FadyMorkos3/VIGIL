/// <reference types="vite/client" />
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface Incident {
  id: string;
  type: 'violence' | 'crash';
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  cameraId: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'dispatched' | 'acknowledged';
  description: string;
  confidence: number;
  people_count?: number;
  // Dispatch fields
  dispatchStatus?: 'pending' | 'dispatched' | 'on-site' | 'cleared';
  dispatchedOfficerId?: string;
  dispatchedOfficerName?: string;
  dispatchTime?: string;
}


const API_URL = import.meta.env.VITE_API_URL || '';


export function useRealtimeIncidents(onIncidentNotificationClick?: (incidentId: string) => void, isOffline: boolean = false) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  // Track last seen incident IDs to prevent notification spam
  const lastIncidentIdsRef = useRef<Set<string>>(new Set());

  // Poll backend for real incidents every 5 seconds
  // Play alert sound for new incidents if enabled (unless offline)
  const alertAudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!alertAudioRef.current) {
      alertAudioRef.current = new window.Audio('/alert.mp3'); // Place alert.mp3 in public folder
      alertAudioRef.current.volume = 1.0;
    }
    let isMounted = true;
    const fetchIncidents = async () => {
      try {
        const response = await fetch(`${API_URL}/api/incidents?limit=100`);
        if (!response.ok) return; // Don't show notifications if backend is down
        const data = await response.json();
        if (!isMounted || !Array.isArray(data) || data.length === 0) return;
        // Only show notifications for new incidents
        const newIncidents = data.filter((inc: Incident) => !lastIncidentIdsRef.current.has(inc.id) && inc.status === 'active');
        if (newIncidents.length > 0 && !isOffline) {
          newIncidents.forEach((inc) => {
            let title = '';
            if (inc.type === 'violence') {
              const peopleInfo = inc.people_count ? ` (${inc.people_count} people)` : '';
              title = `Violence detected${peopleInfo} at ${inc.location}`;
            } else if (inc.type === 'crash') {
              title = `Crash detected at ${inc.location} (${inc.cameraId})`;
            } else {
              title = `Incident detected at ${inc.location} (${inc.cameraId})`;
            }
            toast(
              title,
              {
                description: inc.description,
                duration: 5000,
                position: 'top-right',
                action: {
                  label: 'View',
                  onClick: () => {
                    if (onIncidentNotificationClick) onIncidentNotificationClick(inc.id);
                    toast.dismiss();
                  },
                },
              }
            );
          });
          // Play alert sound if enabled
          if (soundEnabled && alertAudioRef.current) {
            alertAudioRef.current.currentTime = 0;
            alertAudioRef.current.play().catch(e => console.error("Audio playback blocked/failed:", e));
          }
        }
        // Update last seen incident IDs
        lastIncidentIdsRef.current = new Set(data.map((inc: Incident) => inc.id));
        setIncidents(data);
      } catch (error) {
        console.error("Failed to fetch incidents:", error);
      }
    };
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);


  // Optionally, you can implement resolve/dismiss by calling backend endpoints here

  const resolveIncident = useCallback(async (id: string) => {
    try {
      await fetch(`${API_URL}/api/incidents/${id}/resolve`, { method: 'POST' });
      toast.success('Incident marked as resolved', {
        duration: 3000,
        position: 'top-right',
        action: {
          label: '✕',
          onClick: () => toast.dismiss(),
        },
      });
      // Optimistic update
      setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'resolved' } : inc));
    } catch (e) {
      console.error("Failed to resolve incident:", e);
      toast.error("Failed to resolve incident");
    }
  }, []);

  const dismissIncident = useCallback(async (id: string) => {
    try {
      await fetch(`${API_URL}/api/incidents/${id}/ack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'current-user' }) // TODO: Get real user ID
      });
      toast.info('Incident acknowledged', {
        duration: 3000,
        position: 'top-right',
        action: {
          label: '✕',
          onClick: () => toast.dismiss(),
        },
      });
      // Optimistic update
      setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'acknowledged' as any } : inc));
    } catch (e) {
      console.error("Failed to dismiss/ack incident:", e);
    }
  }, []);


  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
    toast.info(soundEnabled ? 'Alert sounds disabled' : 'Alert sounds enabled', {
      duration: 2000,
    });
  }, [soundEnabled]);

  const dismissAllIncidents = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/incidents/ack-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'current-user' })
      });
      toast.info('All incidents dismissed');
      setIncidents(prev => prev.map(inc => inc.status === 'active' ? { ...inc, status: 'acknowledged' as any } : inc));
    } catch (e) {
      console.error("Failed to dismiss all incidents:", e);
      toast.error("Failed to dismiss all");
    }
  }, []);

  const confirmIncident = useCallback(async (id: string) => {
    try {
      await fetch(`${API_URL}/api/incidents/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback_type: 'confirm' })
      });
      toast.success('Incident verified as True Positive', { duration: 2000 });
      // Can optionally also resolve it or just mark it as verified
    } catch (e) {
      console.error("Failed to confirm incident:", e);
      toast.error("Failed to submit feedback");
    }
  }, []);

  const rejectIncident = useCallback(async (id: string) => {
    try {
      await fetch(`${API_URL}/api/incidents/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback_type: 'reject' })
      });
      toast.success('Incident marked as False Positive', { duration: 2000 });
      // Implicitly remove it from active list or mark as rejected
      setIncidents(prev => prev.filter(inc => inc.id !== id));
    } catch (e) {
      console.error("Failed to reject incident:", e);
      toast.error("Failed to submit feedback");
    }
  }, []);


  const dispatchIncident = useCallback(async (id: string, securityId: string) => {
    try {
      await fetch(`${API_URL}/api/incidents/${id}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ security_id: securityId })
      });
      toast.success('Incident acknowledged and marked as dispatched', { duration: 2000 });
      setIncidents(prev => prev.map(inc =>
        inc.id === id ? { ...inc, status: 'dispatched' as any, dispatchedOfficerName: securityId } : inc
      ));
    } catch (e) {
      console.error("Failed to dispatch incident:", e);
      toast.error("Failed to acknowledge incident");
    }
  }, []);

  const activeIncidents = incidents.filter((i) => i.status === 'active' || i.status === 'dispatched');

  return {
    incidents,
    activeIncidents,
    resolveIncident,
    dismissIncident,
    dispatchIncident,
    soundEnabled,
    toggleSound,
    dismissAllIncidents,
    confirmIncident,
    rejectIncident,
  };
}
