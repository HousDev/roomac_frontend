"use client";

interface DebugPanelProps {
  tabs: any[];
  activeTab: string;
  types: any[];
  filteredTypes: any[];
  onRefresh: () => void;
}

export default function DebugPanel({
  tabs,
  activeTab,
  types,
  filteredTypes,
  onRefresh
}: DebugPanelProps) {
  // Comment out for production
  return null;
  
  // Uncomment for debugging
  /*
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono max-w-xs">
      <div className="font-bold mb-1">🔍 DEBUG INFO</div>
      <div>Tabs: {tabs.length}</div>
      <div>Active: "{activeTab}"</div>
      <div>Types: {types.length}</div>
      <div>Filtered: {filteredTypes.length}</div>
      <button 
        onClick={onRefresh}
        className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs"
      >
        Force Refresh
      </button>
    </div>
  );
  */
}