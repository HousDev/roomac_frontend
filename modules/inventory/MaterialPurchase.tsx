import { useEffect, useState } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
// import { supabase } from '../../lib/supabase';
// import { MaterialPurchase as MaterialPurchaseType, Property } from '../../types/masters';

interface InventoryItem {
  id: string;
  name: string;
  category_id: string;
}

interface PurchaseItemForm {
  item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export function MaterialPurchase() {
  const [purchases, setPurchases] = useState<MaterialPurchaseType[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    purchase_date: new Date().toISOString().split('T')[0],
    vendor_name: '',
    invoice_number: '',
    payment_status: 'Pending' as const,
    property_id: '',
    notes: ''
  });

  const [purchaseItems, setPurchaseItems] = useState<PurchaseItemForm[]>([
    { item_id: '', quantity: 1, unit_price: 0, total_price: 0 }
  ]);

  useEffect(() => {
    loadPurchases();
    loadProperties();
    loadItems();
  }, []);

  const loadPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('material_purchases')
        .select('*, property:properties(name)')
        .order('purchase_date', { ascending: false });
      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, category_id')
        .order('name');
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const addItemRow = () => {
    setPurchaseItems([...purchaseItems, { item_id: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const removeItemRow = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const updateItemRow = (index: number, field: keyof PurchaseItemForm, value: any) => {
    const updated = [...purchaseItems];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unit_price') {
      updated[index].total_price = updated[index].quantity * updated[index].unit_price;
    }

    setPurchaseItems(updated);
  };

  const calculateTotal = () => {
    return purchaseItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = purchaseItems.filter(item => item.item_id && item.quantity > 0);
    if (validItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    try {
      const totalAmount = calculateTotal();

      const { data: purchaseData, error: purchaseError } = await supabase
        .from('material_purchases')
        .insert([{ ...formData, total_amount: totalAmount }])
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      for (const item of validItems) {
        await supabase.from('purchase_items').insert([{
          purchase_id: purchaseData.id,
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }]);

        await supabase.from('stock_movements').insert([{
          item_id: item.item_id,
          property_id: formData.property_id || null,
          movement_type: 'IN',
          quantity: item.quantity,
          reference_type: 'Purchase',
          reference_id: purchaseData.id,
          notes: `Purchase from ${formData.vendor_name}`
        }]);

        const { data: currentStock } = await supabase
          .from('item_stock')
          .select('*')
          .eq('item_id', item.item_id)
          .eq('property_id', formData.property_id)
          .maybeSingle();

        if (currentStock) {
          await supabase
            .from('item_stock')
            .update({
              quantity: currentStock.quantity + item.quantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentStock.id);
        } else {
          await supabase.from('item_stock').insert([{
            item_id: item.item_id,
            property_id: formData.property_id,
            quantity: item.quantity
          }]);
        }
      }

      alert('Purchase recorded successfully!');
      setShowModal(false);
      resetForm();
      loadPurchases();
    } catch (error) {
      console.error('Error creating purchase:', error);
      alert('Error creating purchase');
    }
  };

  const resetForm = () => {
    setFormData({
      purchase_date: new Date().toISOString().split('T')[0],
      vendor_name: '',
      invoice_number: '',
      payment_status: 'Pending',
      property_id: '',
      notes: ''
    });
    setPurchaseItems([{ item_id: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-600 font-semibold">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Material Purchases
          </h1>
          <p className="text-gray-600 font-semibold mt-1">Track inventory purchases and stock IN</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          New Purchase
        </button>
      </div>

      <div className="grid gap-4">
        {purchases.map((purchase) => (
          <div key={purchase.id} className="glass rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">{purchase.vendor_name}</h3>
                  <p className="text-sm font-semibold text-gray-600">Invoice: {purchase.invoice_number}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-gray-900">₹{purchase.total_amount.toFixed(2)}</div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  purchase.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                  purchase.payment_status === 'Partial' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {purchase.payment_status}
                </span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-bold text-gray-500">Purchase Date:</span>
                <span className="ml-1 font-semibold text-gray-900">
                  {new Date(purchase.purchase_date).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-500">Property:</span>
                <span className="ml-1 font-semibold text-gray-900">{purchase.property?.name || 'General'}</span>
              </div>
              {purchase.notes && (
                <div className="md:col-span-3">
                  <span className="font-bold text-gray-500">Notes:</span>
                  <span className="ml-1 font-semibold text-gray-700">{purchase.notes}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl my-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4">New Purchase</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    required
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Vendor Name</label>
                  <input
                    type="text"
                    required
                    value={formData.vendor_name}
                    onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    required
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Property</label>
                  <select
                    required
                    value={formData.property_id}
                    onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Property</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Payment Status</label>
                  <select
                    value={formData.payment_status}
                    onChange={(e) => setFormData({ ...formData, payment_status: e.target.value as any })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-700">Purchase Items</label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {purchaseItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <select
                          required
                          value={item.item_id}
                          onChange={(e) => updateItemRow(index, 'item_id', e.target.value)}
                          className="w-full px-2 py-2 border-2 border-gray-200 rounded-lg font-semibold text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="">Select Item</option>
                          {items.map((i) => (
                            <option key={i.id} value={i.id}>{i.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateItemRow(index, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-2 border-2 border-gray-200 rounded-lg font-semibold text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          placeholder="Price"
                          value={item.unit_price}
                          onChange={(e) => updateItemRow(index, 'unit_price', Number(e.target.value))}
                          className="w-full px-2 py-2 border-2 border-gray-200 rounded-lg font-semibold text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          readOnly
                          value={item.total_price.toFixed(2)}
                          className="w-full px-2 py-2 bg-gray-100 border-2 border-gray-200 rounded-lg font-bold text-sm"
                        />
                      </div>
                      <div className="col-span-1">
                        {purchaseItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            className="w-full px-2 py-2 bg-red-100 text-red-600 rounded-lg font-bold text-sm hover:bg-red-200"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-600">Total Amount: </span>
                    <span className="text-2xl font-black text-gray-900">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
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
                  Create Purchase
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
