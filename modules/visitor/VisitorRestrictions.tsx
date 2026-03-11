import { useEffect, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';

interface VisitorRestriction {
  id: string;
  property_name: string;
  restriction_type: string;
  start_time: string;
  end_time: string;
  description: string;
  is_active: boolean;
}

const dateTimeFormatter = (datetime: string) => {
  if (!datetime) return 'N/A';
  return new Date(datetime).toLocaleString('en-IN');
};

// Static data
const staticRestrictions: VisitorRestriction[] = [
  {
    id: '1',
    property_name: 'Sunset Villa',
    restriction_type: 'Time-Based',
    start_time: '2026-03-15T22:00:00',
    end_time: '2026-03-16T06:00:00',
    description: 'No visitors allowed after 10 PM. Emergency services only.',
    is_active: true
  },
  {
    id: '2',
    property_name: 'Ocean View Apartment',
    restriction_type: 'Full Restriction',
    start_time: '2026-03-20T00:00:00',
    end_time: '2026-03-22T23:59:59',
    description: 'Complete visitor restriction due to maintenance work. No entry for any visitors.',
    is_active: true
  },
  {
    id: '3',
    property_name: 'Garden Heights',
    restriction_type: 'Conditional',
    start_time: '2026-03-18T09:00:00',
    end_time: '2026-03-18T18:00:00',
    description: 'Only verified delivery personnel allowed during working hours.',
    is_active: true
  },
  {
    id: '4',
    property_name: 'Lakeview Residency',
    restriction_type: 'Time-Based',
    start_time: '2026-03-25T20:00:00',
    end_time: '2026-03-26T08:00:00',
    description: 'Night restriction from 8 PM to 8 AM. Prior approval required for late visits.',
    is_active: false
  },
  {
    id: '5',
    property_name: 'Sunset Villa',
    restriction_type: 'Full Restriction',
    start_time: '2026-04-01T00:00:00',
    end_time: '2026-04-03T23:59:59',
    description: 'Property maintenance and pest control. No visitors allowed.',
    is_active: true
  },
  {
    id: '6',
    property_name: 'Ocean View Apartment',
    restriction_type: 'Conditional',
    start_time: '2026-03-28T10:00:00',
    end_time: '2026-03-28T16:00:00',
    description: 'Only residents and pre-approved guests allowed during community meeting.',
    is_active: true
  },
  {
    id: '7',
    property_name: 'Garden Heights',
    restriction_type: 'Time-Based',
    start_time: '2026-03-30T23:00:00',
    end_time: '2026-03-31T07:00:00',
    description: 'Quiet hours restriction. No visitors allowed during late night.',
    is_active: false
  },
  {
    id: '8',
    property_name: 'Lakeview Residency',
    restriction_type: 'Full Restriction',
    start_time: '2026-04-05T00:00:00',
    end_time: '2026-04-06T23:59:59',
    description: 'Security system upgrade. All visitor entry suspended.',
    is_active: true
  }
];

export function VisitorRestrictions() {
  const [restrictions, setRestrictions] = useState<VisitorRestriction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRestriction, setEditingRestriction] = useState<VisitorRestriction | null>(null);

  const [formData, setFormData] = useState({
    property_name: '',
    restriction_type: 'Time-Based',
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
      setLoading(true);
      setError(null);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setRestrictions(staticRestrictions);
    } catch (err: any) {
      setError(err.message || 'Failed to load visitor restrictions');
      console.error('Error loading visitor restrictions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    resetForm();
    setEditingRestriction(null);
    setShowModal(true);
  };

  const handleEdit = (restriction: VisitorRestriction) => {
    setEditingRestriction(restriction);
    setFormData({
      property_name: restriction.property_name || '',
      restriction_type: restriction.restriction_type || 'Time-Based',
      start_time: restriction.start_time ? new Date(restriction.start_time).toISOString().slice(0, 16) : '',
      end_time: restriction.end_time ? new Date(restriction.end_time).toISOString().slice(0, 16) : '',
      description: restriction.description || '',
      is_active: restriction.is_active !== undefined ? restriction.is_active : true
    });
    setShowModal(true);
  };

  const handleDelete = async (restriction: VisitorRestriction) => {
    if (!confirm('Delete this restriction permanently?')) return;

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      setRestrictions(prev => prev.filter(r => r.id !== restriction.id));
    } catch (err: any) {
      alert('Failed to delete restriction: ' + (err.message || 'Unknown error'));
    }
  };

  const handleBulkDelete = async (restrictionsToDelete: VisitorRestriction[]) => {
    if (!confirm(`Delete ${restrictionsToDelete.length} restrictions permanently?`)) return;

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      const idsToDelete = new Set(restrictionsToDelete.map(r => r.id));
      setRestrictions(prev => prev.filter(r => !idsToDelete.has(r.id)));
    } catch (err: any) {
      alert('Failed to delete restrictions: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const submitData = {
        ...formData,
        start_time: formData.start_time ? new Date(formData.start_time).toISOString() : '',
        end_time: formData.end_time ? new Date(formData.end_time).toISOString() : ''
      };

      if (editingRestriction) {
        // Update existing restriction
        setRestrictions(prev => prev.map(r =>
          r.id === editingRestriction.id ? { ...r, ...submitData } : r
        ));
      } else {
        // Create new restriction
        const newRestriction: VisitorRestriction = {
          id: `${Date.now()}`,
          ...submitData
        };
        setRestrictions(prev => [newRestriction, ...prev]);
      }

      setShowModal(false);
      setEditingRestriction(null);
      resetForm();
    } catch (err: any) {
      alert('Failed to save restriction: ' + (err.message || 'Unknown error'));
    }
  };

  const resetForm = () => {
    setFormData({
      property_name: '',
      restriction_type: 'Time-Based',
      start_time: '',
      end_time: '',
      description: '',
      is_active: true
    });
  };

  const columns = [
    {
      key: 'property_name',
      label: 'Property',
      sortable: true,
      searchable: true
    },
    {
      key: 'restriction_type',
      label: 'Restriction Type',
      sortable: true,
      searchable: true
    },
    {
      key: 'start_time',
      label: 'Start Time',
      sortable: true,
      render: (row: VisitorRestriction) => dateTimeFormatter(row.start_time)
    },
    {
      key: 'end_time',
      label: 'End Time',
      sortable: true,
      render: (row: VisitorRestriction) => dateTimeFormatter(row.end_time)
    },
    {
      key: 'description',
      label: 'Description',
      searchable: true,
      render: (row: VisitorRestriction) => (
        <div className="max-w-xs truncate" title={row.description}>
          {row.description || 'N/A'}
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (row: VisitorRestriction) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error: {error}</p>
          <button
            onClick={loadRestrictions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Visitor Restrictions
        </h1>
        <p className="text-gray-600 font-semibold mt-1">Manage time-based access rules</p>
      </div>

      <DataTable
        data={restrictions}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onExport={() => { }}
        title="Visitor Restrictions"
        addButtonText="Add Restriction"
        rowKey="id"
        enableBulkActions={true}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl my-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              {editingRestriction ? 'Edit Restriction' : 'Add Restriction'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
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
                  <select
                    value={formData.restriction_type}
                    onChange={(e) => setFormData({ ...formData, restriction_type: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Time-Based">Time-Based</option>
                    <option value="Full Restriction">Full Restriction</option>
                    <option value="Conditional">Conditional</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">End Time</label>
                  <input
                    type="datetime-local"
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
                  placeholder="Describe the restriction details..."
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-bold text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  {editingRestriction ? 'Update' : 'Create'} Restriction
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingRestriction(null); }}
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