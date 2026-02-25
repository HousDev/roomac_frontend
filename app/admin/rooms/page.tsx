// app/admin/rooms/page.tsx
import { useState, useEffect } from 'react';
import RoomsClient from '@/components/admin/rooms/rooms-client';
import { listRooms, listActiveProperties } from '@/lib/roomsApi';
import { AdminHeader } from '@/components/admin/admin-header';

// Loading component
function RoomsLoading() {
  return (
    <div className=" bg-gray-50">
      {/* <AdminHeader title="Rooms Management" /> */}
      <div className="container mx-auto p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

async function fetchData() {
  try {
    
    // Fetch data with error handling
    const roomsPromise = listRooms();
    const propertiesPromise = listActiveProperties();
    
    const [roomsResult, propertiesResult] = await Promise.allSettled([ 
      roomsPromise,
      propertiesPromise
    ]);

   
    // Extract rooms data
    let roomsData = [];
    
    if (roomsResult.status === 'fulfilled') {
      const response = roomsResult.value as any;
      
      if (Array.isArray(response)) {
        roomsData = response;
      } else if (response && Array.isArray(response.data)) {
        roomsData = response.data;
      } else if (response && response.data && Array.isArray(response.data)) {
        roomsData = response.data;
      }
    } else {
      console.error('❌ Rooms fetch failed:', roomsResult.reason);
    }

    // Extract properties data
    let propertiesData = [];
    if (propertiesResult.status === 'fulfilled') {
      const response = propertiesResult.value;
      
      if (Array.isArray(response)) {
        propertiesData = response;
      } else if (response && Array.isArray(response.data)) {
        propertiesData = response.data;
      } else if (response && response.data && Array.isArray(response.data)) {
        propertiesData = response.data;
      }
    } else {
      console.error('❌ Properties fetch failed:', propertiesResult.reason);
    }

    return {
      rooms: roomsData,
      properties: propertiesData
    };

  } catch (error) {
    console.error('🔥 Error in fetchData:', error);
    return {
      rooms: [],
      properties: []
    };
  }
}

export default function RoomsPage() {
  const [data, setData] = useState<{ rooms: any[]; properties: any[] }>({ rooms: [], properties: [] });
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchData().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <RoomsLoading />;
  return (
    <div className=" bg-gray-50">
      <div className="container mx-auto p-1 md:p-0">
        <RoomsClient initialRooms={data.rooms} initialProperties={data.properties} />
      </div>
    </div>
  );
}