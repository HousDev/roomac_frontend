import { useEffect, useState } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Search, Download, BarChart3, Package } from 'lucide-react';
import { Asset, AssetCondition, AssetStatus } from '../../types/inventory';
// import { Property, Room, Bed } from '../../types/masters';

interface InventoryItem {
  id: string;
  name: string;
  category: { name: string };
}

// Mock Data
const mockProperties: Property[] = [
  { id: '1', name: 'Sunrise PG', type: 'pg', address: '123 Main St', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', total_floors: 3, total_rooms: 30, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: 'Green Valley Hostel', type: 'hostel', address: '456 Park Ave', city: 'Pune', state: 'Maharashtra', pincode: '411001', total_floors: 4, total_rooms: 40, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const mockItems: InventoryItem[] = [
  { id: '1', name: 'Single Bed', category: { name: 'Furniture' } },
  { id: '2', name: 'Study Table', category: { name: 'Furniture' } },
  { id: '3', name: 'Ceiling Fan', category: { name: 'Electrical' } },
  { id: '4', name: 'LED Bulb', category: { name: 'Electrical' } },
  { id: '5', name: 'Mattress', category: { name: 'Bedding' } },
  { id: '6', name: 'Pillow', category: { name: 'Bedding' } },
];

const mockAssets: Asset[] = [
  {
    id: '1',
    asset_id: 'ASSET-001-A1B2',
    item_id: '1',
    item: { id: '1', name: 'Single Bed', category: { name: 'Furniture' } },
    property_name: 'Sunrise PG',
    room_number: '101',
    bed_number: 'B1',
    serial_number: 'SN123456',
    purchase_date: '2024-01-15',
    condition: 'Good',
    status: 'Allocated',
    notes: 'New bed for Room 101',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    asset_id: 'ASSET-002-C3D4',
    item_id: '2',
    item: { id: '2', name: 'Study Table', category: { name: 'Furniture' } },
    property_name: 'Sunrise PG',
    room_number: '102',
    bed_number: '',
    serial_number: 'ST789012',
    purchase_date: '2024-01-20',
    condition: 'New',
    status: 'In Stock',
    notes: 'Wooden study table',
    created_at: '2024-01-20T14:45:00Z',
    updated_at: '2024-01-20T14:45:00Z'
  },
  {
    id: '3',
    asset_id: 'ASSET-003-E5F6',
    item_id: '3',
    item: { id: '3', name: 'Ceiling Fan', category: { name: 'Electrical' } },
    property_name: 'Green Valley Hostel',
    room_number: '201',
    bed_number: '',
    serial_number: 'FN345678',
    purchase_date: '2024-02-01',
    condition: 'Used',
    status: 'Allocated',
    notes: 'High-speed fan',
    created_at: '2024-02-01T09:20:00Z',
    updated_at: '2024-02-01T09:20:00Z'
  },
  {
    id: '4',
    asset_id: 'ASSET-004-G7H8',
    item_id: '5',
    item: { id: '5', name: 'Mattress', category: { name: 'Bedding' } },
    property_name: 'Green Valley Hostel',
    room_number: '202',
    bed_number: 'B2',
    serial_number: 'MT901234',
    purchase_date: '2024-02-10',
    condition: 'Damaged',
    status: 'Maintenance',
    notes: 'Torn at corner - needs replacement',
    created_at: '2024-02-10T16:15:00Z',
    updated_at: '2024-02-10T16:15:00Z'
  },
  {
    id: '5',
    asset_id: 'ASSET-005-I9J0',
    item_id: '4',
    item: { id: '4', name: 'LED Bulb', category: { name: 'Electrical' } },
    property_name: 'Sunrise PG',
    room_number: '103',
    bed_number: '',
    serial_number: 'LB567890',
    purchase_date: '2024-02-15',
    condition: 'Good',
    status: 'In Stock',
    notes: '9W LED bulb',
    created_at: '2024-02-15T11:30:00Z',
    updated_at: '2024-02-15T11:30:00Z'
  }
];

export function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<AssetStatus | 'All'>('All');
  const [filterCondition, setFilterCondition] = useState<AssetCondition | 'All'>('All');
  const [showModal, setShowModal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const [formData, setFormData] = useState({
    item_id: '',
    property_name: '',
    room_number: '',
    bed_number: '',
    serial_number: '',
    purchase_date: new Date().toISOString().split('T')[0],
    condition: 'New' as AssetCondition,
    status: 'In Stock' as AssetStatus,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAssets(mockAssets);
      setProperties(mockProperties);
      setItems(mockItems);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAssetId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ASSET-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAsset) {
        // Update existing asset
        const updatedAssets = assets.map(asset =>
          asset.id === editingAsset.id
            ? {
              ...asset,
              ...formData,
              item: items.find(i => i.id === formData.item_id),
              updated_at: new Date().toISOString()
            }
            : asset
        );
        setAssets(updatedAssets as Asset[]);
      } else {
        // Create new asset
        const newAsset = {
          id: Date.now().toString(),
          asset_id: generateAssetId(),
          ...formData,
          item: items.find(i => i.id === formData.item_id),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setAssets([newAsset as Asset, ...assets]);
      }

      setShowModal(false);
      setEditingAsset(null);
      resetForm();
    } catch (error) {
      console.error('Error saving asset:', error);
      alert('Error saving asset');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this asset permanently?')) return;

    try {
      setAssets(assets.filter(asset => asset.id !== id));
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Error deleting asset');
    }
  };

  const resetForm = () => {
    setFormData({
      item_id: '',
      property_name: '',
      room_number: '',
      bed_number: '',
      serial_number: '',
      purchase_date: new Date().toISOString().split('T')[0],
      condition: 'New',
      status: 'In Stock',
      notes: ''
    });
  };

  const openEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      item_id: asset.item_id || '',
      property_name: asset.property_name || '',
      room_number: asset.room_number || '',
      bed_number: asset.bed_number || '',
      serial_number: asset.serial_number || '',
      purchase_date: asset.purchase_date || new Date().toISOString().split('T')[0],
      condition: asset.condition,
      status: asset.status,
      notes: asset.notes || ''
    });
    setShowModal(true);
  };

  const exportToCSV = () => {
    const headers = ['Asset ID', 'Item', 'Category', 'Property', 'Room', 'Bed', 'Serial Number', 'Condition', 'Status', 'Purchase Date', 'Notes'];
    const rows = filteredAssets.map(a => [
      a.asset_id,
      a.item?.name || 'N/A',
      a.item?.category?.name || 'N/A',
      a.property_name || 'N/A',
      a.room_number || 'N/A',
      a.bed_number || 'N/A',
      a.serial_number || 'N/A',
      a.condition,
      a.status,
      a.purchase_date || 'N/A',
      a.notes || ''
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assets-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.asset_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.item?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.property_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || asset.status === filterStatus;
    const matchesCondition = filterCondition === 'All' || asset.condition === filterCondition;
    return matchesSearch && matchesStatus && matchesCondition;
  });

  const getStats = () => {
    const total = assets.length;
    const inStock = assets.filter(a => a.status === 'In Stock').length;
    const allocated = assets.filter(a => a.status === 'Allocated').length;
    const maintenance = assets.filter(a => a.status === 'Maintenance').length;
    const damaged = assets.filter(a => a.condition === 'Damaged').length;

    return { total, inStock, allocated, maintenance, damaged };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 font-semibold">Loading assets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Asset Management
          </h1>
          <p className="text-gray-600 font-semibold mt-1">Track and manage all property assets</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowReport(!showReport)}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-all"
          >
            <BarChart3 className="w-5 h-5" />
            {showReport ? 'Hide' : 'Show'} Report
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          <button
            onClick={() => { resetForm(); setEditingAsset(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Asset
          </button>
        </div>
      </div>

      {showReport && (
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="glass rounded-xl p-4">
            <div className="text-sm font-bold text-gray-600">Total Assets</div>
            <div className="text-3xl font-black text-gray-900 mt-1">{stats.total}</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-sm font-bold text-gray-600">In Stock</div>
            <div className="text-3xl font-black text-blue-600 mt-1">{stats.inStock}</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-sm font-bold text-gray-600">Allocated</div>
            <div className="text-3xl font-black text-emerald-600 mt-1">{stats.allocated}</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-sm font-bold text-gray-600">Maintenance</div>
            <div className="text-3xl font-black text-amber-600 mt-1">{stats.maintenance}</div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-sm font-bold text-gray-600">Damaged</div>
            <div className="text-3xl font-black text-red-600 mt-1">{stats.damaged}</div>
          </div>
        </div>
      )}

      <div className="glass rounded-xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg font-semibold text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as AssetStatus | 'All')}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="All">All Status</option>
          <option value="In Stock">In Stock</option>
          <option value="Allocated">Allocated</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Disposed">Disposed</option>
        </select>
        <select
          value={filterCondition}
          onChange={(e) => setFilterCondition(e.target.value as AssetCondition | 'All')}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="All">All Conditions</option>
          <option value="New">New</option>
          <option value="Good">Good</option>
          <option value="Used">Used</option>
          <option value="Damaged">Damaged</option>
        </select>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Asset ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Item</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Location</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Serial No.</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Condition</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{asset.asset_id}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700">{asset.item?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-600">{asset.item?.category?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                    <div>{asset.property_name}</div>
                    <div className="text-xs text-gray-500">
                      Room {asset.room_number}{asset.bed_number && ` / Bed ${asset.bed_number}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-600">{asset.serial_number || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${asset.condition === 'New' ? 'bg-emerald-100 text-emerald-700' :
                        asset.condition === 'Good' ? 'bg-blue-100 text-blue-700' :
                          asset.condition === 'Used' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                      }`}>
                      {asset.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${asset.status === 'In Stock' ? 'bg-gray-100 text-gray-700' :
                        asset.status === 'Allocated' ? 'bg-emerald-100 text-emerald-700' :
                          asset.status === 'Maintenance' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                      }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(asset)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit Asset"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl my-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              {editingAsset ? 'Edit Asset' : 'Add New Asset'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Item</label>
                <select
                  required
                  value={formData.item_id}
                  onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Item</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>{item.name} ({item.category.name})</option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Property Name</label>
                  <input
                    type="text"
                    required
                    value={formData.property_name}
                    onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
                    placeholder="e.g. Sunrise PG"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    placeholder="e.g. 101"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Bed Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.bed_number}
                    onChange={(e) => setFormData({ ...formData, bed_number: e.target.value })}
                    placeholder="e.g. B1"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    placeholder="Serial/Model number"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as AssetCondition })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Used">Used</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Allocated">Allocated</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Disposed">Disposed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  {editingAsset ? 'Update' : 'Create'} Asset
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingAsset(null); }}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}