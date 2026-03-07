import { useEffect, useState } from 'react';
import { Plus, Shield, CreditCard as Edit2, Trash2 } from 'lucide-react';
// import { supabase } from '../../lib/supabase';
// import { VisitorRestriction } from '../../types/visitor';

export function VisitorRestrictions() {
  const [restrictions, setRestrictions] = useState<VisitorRestriction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRestriction, setEditingRestriction] = useState<VisitorRestriction | null>(null);
  const [formData, setFormData] = useState({
    property_name: '',
    restriction_type: '',
    start_time: '',
    end_time: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    loadRestrictions();
  }, []);

  const loadRestrictions = async () => {
    try {
      const { data, error } = await supabase
        .from('visitor_restrictions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRestrictions(data || []);
    } catch (error) {
      console.error('Error loading restrictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRestriction) {
        const { error } = await supabase
          .from('visitor_restrictions')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingRestriction.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('visitor_restrictions')
          .insert([formData]);
        if (error) throw error;
      }
      setShowModal(false);
      setEditingRestriction(null);
      resetForm();
      loadRestrictions();
    } catch (error) {
      console.error('Error saving restriction:', error);
      alert('Error saving restriction');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('visitor_restrictions').delete().eq('id', id);
      if (error) throw error;
      loadRestrictions();
    } catch (error) {
      console.error('Error deleting restriction:', error);
      alert('Error deleting restriction');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('visitor_restrictions')
        .update({ is_active: !isActive })
        .eq('id', id);
      if (error) throw error;
      loadRestrictions();
    } catch (error) {
      console.error('Error toggling restriction:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      property_name: '',
      restriction_type: '',
      start_time: '',
      end_time: '',
      description: '',
      is_active: true
    });
  };

  const openEditModal = (restriction: VisitorRestriction) => {
    setEditingRestriction(restriction);
    setFormData({
      property_name: restriction.property_name,
      restriction_type: restriction.restriction_type,
      start_time: restriction.start_time,
      end_time: restriction.end_time,
      description: restriction.description,
      is_active: restriction.is_active
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-600 font-semibold">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Visitor Restrictions
          </h1>
          <p className="text-gray-600 font-semibold mt-1">Manage time-based access rules</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingRestriction(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Restriction
        </button>
      </div>

      <div className="grid gap-4">
        {restrictions.map((restriction) => (
          <div key={restriction.id} className="glass rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">{restriction.restriction_type}</h3>
                  <p className="text-sm font-semibold text-gray-600">{restriction.property_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(restriction.id, restriction.is_active)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    restriction.is_active
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {restriction.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs font-bold text-gray-500 mb-1">Time Period</p>
                <p className="text-sm font-semibold text-gray-900">
                  {restriction.start_time} - {restriction.end_time}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 mb-1">Description</p>
                <p className="text-sm font-semibold text-gray-900">{restriction.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEditModal(restriction)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition-all flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(restriction.id)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              {editingRestriction ? 'Edit Restriction' : 'Add Restriction'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Property Name</label>
                <input
                  type="text"
                  required
                  value={formData.property_name}
                  onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Restriction Type</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Night Entry Restricted"
                  value={formData.restriction_type}
                  onChange={(e) => setFormData({ ...formData, restriction_type: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm font-bold text-gray-700">Active</label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  {editingRestriction ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingRestriction(null); }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all"
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
