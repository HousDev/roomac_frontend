// hooks/useSocketIO.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocketIO = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      console.log('Socket.IO connected');
      setConnected(true);
      
      // Auto-join admin room (for admin pages)
      if (window.location.pathname.includes('/admin')) {
        socketInstance.emit('join_admin');
      }
      
      // Auto-join tenant room if tenant is logged in
      const tenantId = localStorage.getItem('tenant_id');
      if (tenantId && window.location.pathname.includes('/tenant')) {
        socketInstance.emit('join_tenant_room', parseInt(tenantId));
        console.log(`Auto-joined tenant room: tenant_${tenantId}`);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setConnected(false);
    });

    setSocket(socketInstance);
    
    // Store socket globally for access
    (window as any).socket = socketInstance;

    return () => {
      socketInstance.disconnect();
      delete (window as any).socket;
    };
  }, []);

  const emit = (event: string, data?: any) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
    return () => {
      if (socket) {
        socket.off(event, callback);
      }
    };
  };

  return { socket, connected, emit, on };
};