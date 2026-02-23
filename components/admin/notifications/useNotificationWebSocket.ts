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
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connectWebSocket = () => {
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Check if we've exceeded max reconnect attempts
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      return;
    }

    // Determine WebSocket protocol based on current page protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//localhost:3001`;
    
    try {
      const ws = new WebSocket(`${wsUrl}/ws/notifications`);
      
      ws.onopen = () => {
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
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
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = (event) => {
        
        // Don't reconnect if it was a normal closure
        if (event.code === 1000) {
          return;
        }
        
        reconnectAttemptsRef.current += 1;
        
        // Exponential backoff for reconnection attempts
        const reconnectDelay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, reconnectDelay);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Don't close here - let onclose handle reconnection
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
        wsRef.current.close(1000, 'Component unmounting'); // Normal closure
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);
}