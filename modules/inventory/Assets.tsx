import { useEffect, useState } from 'react';
import { Package, Plus, CreditCard as Edit, Trash2, Search, Loader2, X, Download, CheckSquare, Square } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';

interface InventoryStock {
  id: string;
  item_name: string;
  category: string;
  property_name: string;
  quantity: number;
  unit_price: number;
  min_stock_level: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

type FilterType = 'all' | 'low_stock' | 'out_of_stock';

export function Assets() {
  const [inventory, setInventory] = useState<InventoryStock[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryStock | null>(null);
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    property_name: '',
    quantity: 0,
    unit_price: 0,
    min_stock_level: 10,
    notes: ''
  });

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [searchTerm, inventory, filterType, categoryFilter]);

  const loadInventory = async () => {
    try {
      setLoading(true);

      // Static data
      const staticInventory: InventoryStock[] = [
        {
          id: '1',
          item_name: 'King Size Bed',
          category: 'Furniture',
          property_name: 'Sunset Villa',
          quantity: 5,
          unit_price: 25000,
          min_stock_level: 3,
          notes: 'Wooden frame with storage',
          created_at: '2026-01-15T10:30:00Z',
          updated_at: '2026-03-01T14:20:00Z'
        },
        {
          id: '2',
          item_name: 'Queen Size Mattress',
          category: 'Bedding',
          property_name: 'Ocean View Apartment',
          quantity: 2,
          unit_price: 15000,
          min_stock_level: 4,
          notes: 'Memory foam, medium firm',
          created_at: '2026-01-20T09:15:00Z',
          updated_at: '2026-02-28T11:30:00Z'
        },
        {
          id: '3',
          item_name: 'Dining Table Set',
          category: 'Furniture',
          property_name: 'Garden Heights',
          quantity: 0,
          unit_price: 18000,
          min_stock_level: 2,
          notes: '6-seater with glass top',
          created_at: '2026-02-01T13:45:00Z',
          updated_at: '2026-02-01T13:45:00Z'
        },
        {
          id: '4',
          item_name: 'Sofa Set',
          category: 'Furniture',
          property_name: 'Lakeview Residency',
          quantity: 3,
          unit_price: 35000,
          min_stock_level: 2,
          notes: '3+1+1, fabric upholstery',
          created_at: '2026-02-10T16:20:00Z',
          updated_at: '2026-03-02T10:15:00Z'
        },
        {
          id: '5',
          item_name: 'Microwave Oven',
          category: 'Appliances',
          property_name: 'Sunset Villa',
          quantity: 1,
          unit_price: 8000,
          min_stock_level: 2,
          notes: '20L, convection',
          created_at: '2026-02-15T11:00:00Z',
          updated_at: '2026-02-15T11:00:00Z'
        },
        {
          id: '6',
          item_name: 'Refrigerator',
          category: 'Appliances',
          property_name: 'Ocean View Apartment',
          quantity: 2,
          unit_price: 18000,
          min_stock_level: 1,
          notes: 'Single door, 190L',
          created_at: '2026-02-18T14:30:00Z',
          updated_at: '2026-03-01T09:45:00Z'
        },
        {
          id: '7',
          item_name: 'Washing Machine',
          category: 'Appliances',
          property_name: 'Garden Heights',
          quantity: 0,
          unit_price: 22000,
          min_stock_level: 1,
          notes: 'Fully automatic, 6.5kg',
          created_at: '2026-02-20T10:15:00Z',
          updated_at: '2026-02-20T10:15:00Z'
        },
        {
          id: '8',
          item_name: 'Pillows (Set of 2)',
          category: 'Bedding',
          property_name: 'Lakeview Residency',
          quantity: 8,
          unit_price: 1200,
          min_stock_level: 5,
          notes: 'Microfiber, soft',
          created_at: '2026-02-22T15:45:00Z',
          updated_at: '2026-03-03T12:30:00Z'
        },
        {
          id: '9',
          item_name: 'Bed Sheets',
          category: 'Bedding',
          property_name: 'Sunset Villa',
          quantity: 6,
          unit_price: 800,
          min_stock_level: 8,
          notes: 'Cotton, king size',
          created_at: '2026-02-25T09:30:00Z',
          updated_at: '2026-02-25T09:30:00Z'
        },
        {
          id: '10',
          item_name: 'Coffee Table',
          category: 'Furniture',
          property_name: 'Ocean View Apartment',
          quantity: 1,
          unit_price: 5000,
          min_stock_level: 2,
          notes: 'Wooden with glass top',
          created_at: '2026-03-01T11:20:00Z',
          updated_at: '2026-03-01T11:20:00Z'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setInventory(staticInventory);
    } catch (error: any) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInventory = () => {
    let filtered = [...inventory];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item && (
          item.item_name?.toLowerCase().includes(term) ||
          item.category?.toLowerCase().includes(term) ||
          item.property_name?.toLowerCase().includes(term)
        )
      );
    }

    if (filterType === 'low_stock') {
      filtered = filtered.filter(item => item.quantity <= item.min_stock_level && item.quantity > 0);
    } else if (filterType === 'out_of_stock') {
      filtered = filtered.filter(item => item.quantity === 0);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    setFilteredInventory(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      if (editingItem) {
        // Update existing item
        setInventory(prev => prev.map(item =>
          item.id === editingItem.id
            ? { ...item, ...formData, updated_at: new Date().toISOString() }
            : item
        ));
      } else {
        // Add new item
        const newItem: InventoryStock = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setInventory(prev => [...prev, newItem]);
      }
      resetForm();
    } catch (error: any) {
      console.error('Error saving inventory:', error);
      alert('Failed to save inventory item');
    }
  };

  const handleEdit = (item: InventoryStock) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name,
      category: item.category,
      property_name: item.property_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      min_stock_level: item.min_stock_level,
      notes: item.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      setInventory(prev => prev.filter(item => item.id !== id));
    } catch (error: any) {
      console.error('Error deleting inventory:', error);
      alert('Failed to delete inventory item');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    if (!confirm(`Delete ${selectedItems.size} selected item(s)?`)) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setInventory(prev => prev.filter(item => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
    } catch (error: any) {
      console.error('Error deleting items:', error);
      alert('Failed to delete items');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Item Name', 'Category', 'Property', 'Quantity', 'Unit Price', 'Total Value', 'Min Stock'];
    const rows = filteredInventory.map(item => [
      item.item_name,
      item.category,
      item.property_name,
      item.quantity,
      item.unit_price,
      item.quantity * item.unit_price,
      item.min_stock_level
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredInventory.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredInventory.map(item => item.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const resetForm = () => {
    setFormData({
      item_name: '',
      category: '',
      property_name: '',
      quantity: 0,
      unit_price: 0,
      min_stock_level: 10,
      notes: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const getTotalValue = (item: InventoryStock) => {
    if (!item) return 0;
    return (item.quantity || 0) * (item.unit_price || 0);
  };

  const categories = ['all', ...Array.from(new Set(inventory.map(item => item.category)))];
  const lowStockItems = inventory.filter(item => item && item.quantity <= item.min_stock_level && item.quantity > 0);
  const outOfStockItems = inventory.filter(item => item && item.quantity === 0);

  const columns = [
    {
      key: 'select',
      label: (
        <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-100 rounded">
          {selectedItems.size === filteredInventory.length && filteredInventory.length > 0 ?
            <CheckSquare className="w-4 h-4 text-blue-600" /> :
            <Square className="w-4 h-4 text-gray-400" />
          }
        </button>
      ),
      render: (item: InventoryStock) => (
        <button onClick={() => toggleSelectItem(item.id)} className="p-1 hover:bg-gray-100 rounded">
          {selectedItems.has(item.id) ?
            <CheckSquare className="w-4 h-4 text-blue-600" /> :
            <Square className="w-4 h-4 text-gray-400" />
          }
        </button>
      )
    },
    {
      key: 'item_name',
      label: 'Item Name',
      render: (item: InventoryStock) => (
        <div>
          <div className="font-bold text-gray-900">{item?.item_name || '-'}</div>
          <div className="text-xs text-gray-500">{item?.category || '-'}</div>
        </div>
      )
    },
    {
      key: 'property_name',
      label: 'Property',
      render: (item: InventoryStock) => item?.property_name || '-'
    },
    {
      key: 'quantity',
      label: 'Stock',
      render: (item: InventoryStock) => {
        const qty = item?.quantity || 0;
        const minLevel = item?.min_stock_level || 0;
        const isLow = qty <= minLevel && qty > 0;
        const isOut = qty === 0;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isOut ? 'text-red-600' : isLow ? 'text-orange-600' : 'text-gray-900'}`}>
              {qty}
            </span>
            {isLow && <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded">LOW</span>}
            {isOut && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">OUT</span>}
          </div>
        );
      }
    },
    {
      key: 'unit_price',
      label: 'Unit Price',
      render: (item: InventoryStock) => `₹${(item?.unit_price || 0).toLocaleString('en-IN')}`
    },
    {
      key: 'total_value',
      label: 'Total Value',
      render: (item: InventoryStock) => (
        <span className="font-bold text-gray-900">₹{getTotalValue(item).toLocaleString('en-IN')}</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: InventoryStock) => (
        <div className="flex gap-1">
          <button
            onClick={() => handleEdit(item)}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
          </button>
          <button
            onClick={() => handleDelete(item?.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Inventory Stock
          </h1>
          <p className="text-gray-600 font-semibold mt-1">Manage all inventory items and quantities</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-bold hover:border-blue-600 hover:text-blue-600 transition-all"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-5">
          <div className="text-sm font-bold text-gray-600">Total Items</div>
          <div className="text-3xl font-black text-gray-900 mt-1">{inventory.length}</div>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="text-sm font-bold text-gray-600">Total Quantity</div>
          <div className="text-3xl font-black text-gray-900 mt-1">
            {inventory.reduce((sum, item) => sum + (item?.quantity || 0), 0)}
          </div>
        </div>
        <div className="glass rounded-xl p-5 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
          <div className="text-sm font-bold text-orange-700">Low Stock</div>
          <div className="text-3xl font-black text-orange-600 mt-1">{lowStockItems.length}</div>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="text-sm font-bold text-gray-600">Total Value</div>
          <div className="text-3xl font-black text-gray-900 mt-1">
            ₹{inventory.reduce((sum, item) => sum + getTotalValue(item), 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={resetForm}>
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-gray-900">
                {editingItem ? 'Edit' : 'Add New'} Inventory Item
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="e.g., Bed, Mattress"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="e.g., Furniture, Bedding"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Property *</label>
                  <input
                    type="text"
                    required
                    value={formData.property_name}
                    onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Property name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Unit Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Min Stock Level *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.min_stock_level}
                    onChange={(e) => setFormData({ ...formData, min_stock_level: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Additional notes"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  {editingItem ? 'Update' : 'Add'} Item
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search items, categories, properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${filterType === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
              >
                All ({inventory.length})
              </button>
              <button
                onClick={() => setFilterType('low_stock')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${filterType === 'low_stock'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
              >
                Low Stock ({lowStockItems.length})
              </button>
              <button
                onClick={() => setFilterType('out_of_stock')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${filterType === 'out_of_stock'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
              >
                Out of Stock ({outOfStockItems.length})
              </button>
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 bg-white rounded-lg font-bold focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {selectedItems.size > 0 && (
            <div className="p-3 bg-blue-100 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
              <span className="text-sm font-bold text-blue-900">
                {selectedItems.size} item(s) selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {filteredInventory.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-bold text-lg">No inventory items found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm || filterType !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your filters to see more results'
                : 'Add your first inventory item to get started'}
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredInventory}
            loading={loading}
            itemsPerPage={10}
            emptyMessage="No items match your search"
          />
        )}
      </div>
    </div>
  );
}