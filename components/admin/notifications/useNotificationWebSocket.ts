import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UseNotificationWebSocketProps {
  onNewNotification: (notification: any) => void;
  onNotificationRead: (notificationId: number) => void;
}

export function useNotificationWebSocket({
  onNewNotification,
  onNotificationRead
}: UseNotificationWebSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = () => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    
    try {
      const ws = new WebSocket(`${wsUrl}/ws/notifications`);
      
      ws.onopen = () => {
        console.log('✅ WebSocket connected');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'new_notification':
              onNewNotification(data.notification);
              break;
            case 'notification_read':
              onNotificationRead(data.notificationId);
              break;
            default:
              console.log('Unknown WebSocket message:', data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected, attempting to reconnect...');
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  useEffect(() => {
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [onNewNotification, onNotificationRead]);
}