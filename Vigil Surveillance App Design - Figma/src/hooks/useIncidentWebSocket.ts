import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function useIncidentWebSocket(onIncident: (incident: any) => void) {
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically import socket.io-client to avoid SSR issues
    let socket;
    import('socket.io-client').then(({ io }) => {
      socket = io(import.meta.env.VITE_API_URL || window.location.origin, {
        transports: ['websocket'],
      });
      socketRef.current = socket;
      socket.on('incident_update', (incident) => {
        onIncident(incident);
        let title = '';
        if (incident.type === 'violence') {
          title = `Violence detected at ${incident.location} (${incident.cameraId})`;
        } else if (incident.type === 'crash') {
          title = `Crash detected at ${incident.location} (${incident.cameraId})`;
        } else {
          title = `Incident detected at ${incident.location} (${incident.cameraId})`;
        }
        toast(title, {
          description: incident.description,
          duration: 5000,
          position: 'top-right',
          action: {
            label: 'View',
            onClick: () => toast.dismiss(),
          },
        });
      });
    });
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [onIncident]);
}
