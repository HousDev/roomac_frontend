import { useEffect, useState } from 'react';
import { Plus, Loader2, X, CreditCard as Edit, Trash } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';

interface PenaltyRule {
  id: string;
  item_category: string;
  from_condition: string;
  to_condition: string;
  penalty_amount: number;
  description?: string;
}

const CATEGORIES = ['Furniture', 'Electronics', 'Mattress', 'Utensils', 'Other'];
const CONDITIONS = ['New', 'Good', 'Used', 'Damaged', 'Missing'];

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR'
});

// Static data
const staticRules: PenaltyRule[] = [
  {
    id: '1',
    item_category: 'Furniture',
    from_condition: 'New',
    to_condition: 'Used',
    penalty_amount: 2000,
    description: 'Depreciation for new to used furniture'
  },
  {
    id: '2',
    item_category: 'Furniture',
    from_condition: 'New',
    to_condition: 'Damaged',
    penalty_amount: 5000,
    description: 'Significant damage to new furniture'
  },
  {
    id: '3',
    item_category: 'Furniture',
    from_condition: 'Good',
    to_condition: 'Damaged',
    penalty_amount: 3000,
    description: 'Damage to furniture in good condition'
  },
  {
    id: '4',
    item_category: 'Furniture',
    from_condition: 'New',
    to_condition: 'Missing',
    penalty_amount: 10000,
    description: 'New furniture completely missing'
  },
  {
    id: '5',
    item_category: 'Furniture',
    from_condition: 'Good',
    to_condition: 'Missing',
    penalty_amount: 7000,
    description: 'Good condition furniture missing'
  },
  {
    id: '6',
    item_category: 'Furniture',
    from_condition: 'Used',
    to_condition: 'Damaged',
    penalty_amount: 1500,
    description: 'Further damage to used furniture'
  },
  {
    id: '7',
    item_category: 'Electronics',
    from_condition: 'New',
    to_condition: 'Damaged',
    penalty_amount: 4000,
    description: 'Damage to new electronics'
  },
  {
    id: '8',
    item_category: 'Electronics',
    from_condition: 'Good',
    to_condition: 'Damaged',
    penalty_amount: 2500,
    description: 'Damage to electronics in good condition'
  },
  {
    id: '9',
    item_category: 'Electronics',
    from_condition: 'New',
    to_condition: 'Missing',
    penalty_amount: 8000,
    description: 'New electronics missing'
  },
  {
    id: '10',
    item_category: 'Electronics',
    from_condition: 'Good',
    to_condition: 'Missing',
    penalty_amount: 5000,
    description: 'Good condition electronics missing'
  },
  {
    id: '11',
    item_category: 'Mattress',
    from_condition: 'New',
    to_condition: 'Used',
    penalty_amount: 500,
    description: 'Normal wear on new mattress'
  },
  {
    id: '12',
    item_category: 'Mattress',
    from_condition: 'New',
    to_condition: 'Damaged',
    penalty_amount: 2000,
    description: 'Damage to new mattress'
  },
  {
    id: '13',
    item_category: 'Mattress',
    from_condition: 'Good',
    to_condition: 'Damaged',
    penalty_amount: 800,
    description: 'Damage to mattress in good condition'
  },
  {
    id: '14',
    item_category: 'Mattress',
    from_condition: 'New',
    to_condition: 'Missing',
    penalty_amount: 5000,
    description: 'New mattress missing'
  },
  {
    id: '15',
    item_category: 'Utensils',
    from_condition: 'New',
    to_condition: 'Damaged',
    penalty_amount: 300,
    description: 'Damaged utensils'
  },
  {
    id: '16',
    item_category: 'Utensils',
    from_condition: 'Good',
    to_condition: 'Damaged',
    penalty_amount: 150,
    description: 'Damaged utensils in good condition'
  },
  {
    id: '17',
    item_category: 'Utensils',
    from_condition: 'New',
    to_condition: 'Missing',
    penalty_amount: 500,
    description: 'Utensils missing'
  },
  {
    id: '18',
    item_category: 'Other',
    from_condition: 'New',
    to_condition: 'Damaged',
    penalty_amount: 1000,
    description: 'Default penalty for other items'
  },
  {
    id: '19',
    item_category: 'Other',
    from_condition: 'Good',
    to_condition: 'Damaged',
    penalty_amount: 500,
    description: 'Default penalty for other items'
  }
];

export function PenaltyRules() {
  const [rules, setRules] = useState<PenaltyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<PenaltyRule | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    item_category: 'Furniture',
    from_condition: 'Good',
    to_condition: 'Damaged',
    penalty_amount: 0,
    description: ''
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setRules(staticRules);
    } catch (err: any) {
      setError(err.message || 'Failed to load penalty rules');
      console.error('Error loading penalty rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    resetForm();
    setEditingRule(null);
    setShowModal(true);
  };

  const handleEdit = (rule: PenaltyRule) => {
    setEditingRule(rule);
    setFormData({
      item_category: rule.item_category || 'Furniture',
      from_condition: rule.from_condition || 'Good',
      to_condition: rule.to_condition || 'Damaged',
      penalty_amount: rule.penalty_amount || 0,
      description: rule.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (rule: PenaltyRule) => {
    if (!confirm('Delete this penalty rule permanently?')) return;

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      setRules(prev => prev.filter(r => r.id !== rule.id));
    } catch (err: any) {
      alert('Failed to delete penalty rule: ' + (err.message || 'Unknown error'));
    }
  };

  const handleBulkDelete = async (rulesToDelete: PenaltyRule[]) => {
    if (!confirm(`Delete ${rulesToDelete.length} penalty rules permanently?`)) return;

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      const idsToDelete = new Set(rulesToDelete.map(r => r.id));
      setRules(prev => prev.filter(r => !idsToDelete.has(r.id)));
    } catch (err: any) {
      alert('Failed to delete penalty rules: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.penalty_amount < 0) {
      alert('Penalty amount cannot be negative');
      return;
    }

    if (formData.from_condition === formData.to_condition) {
      alert('From condition and to condition cannot be the same');
      return;
    }

    try {
      setSaving(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (editingRule) {
        // Update existing rule
        setRules(prev => prev.map(r =>
          r.id === editingRule.id ? { ...r, ...formData } : r
        ));
      } else {
        // Create new rule
        const newRule: PenaltyRule = {
          id: `${Date.now()}`,
          ...formData
        };
        setRules(prev => [...prev, newRule]);
      }

      setShowModal(false);
      resetForm();
    } catch (err: any) {
      alert('Failed to save penalty rule: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      item_category: 'Furniture',
      from_condition: 'Good',
      to_condition: 'Damaged',
      penalty_amount: 0,
      description: ''
    });
    setEditingRule(null);
  };

  const getConditionBadgeClass = (condition: string) => {
    switch (condition) {
      case 'New':
        return 'bg-green-100 text-green-700';
      case 'Good':
        return 'bg-blue-100 text-blue-700';
      case 'Used':
        return 'bg-yellow-100 text-yellow-700';
      case 'Damaged':
        return 'bg-orange-100 text-orange-700';
      case 'Missing':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const columns = [
    {
      key: 'item_category',
      label: 'Item Category',
      sortable: true,
      searchable: true,
      render: (row: PenaltyRule) => (
        <span className="font-semibold">{row.item_category}</span>
      )
    },
    {
      key: 'from_condition',
      label: 'From Condition',
      sortable: true,
      searchable: true,
      render: (row: PenaltyRule) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getConditionBadgeClass(row.from_condition)}`}>
          {row.from_condition}
        </span>
      )
    },
    {
      key: 'to_condition',
      label: 'To Condition',
      sortable: true,
      searchable: true,
      render: (row: PenaltyRule) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getConditionBadgeClass(row.to_condition)}`}>
          {row.to_condition}
        </span>
      )
    },
    {
      key: 'penalty_amount',
      label: 'Penalty Amount',
      sortable: true,
      render: (row: PenaltyRule) => (
        <span className="font-bold text-red-600">
          {currencyFormatter.format(row.penalty_amount || 0)}
        </span>
      )
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      searchable: true,
      render: (row: PenaltyRule) => (
        <span className="text-sm text-gray-600">{row.description || 'N/A'}</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      searchable: false,
      render: (row: PenaltyRule) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-200 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors"
          >
            <Trash className="w-4 h-4" />
            Delete
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error: {error}</p>
          <button
            onClick={loadRules}
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
          Penalty Rules
        </h1>
        <p className="text-gray-600 font-semibold mt-1">Configure penalty amounts for condition changes during move-out inspections</p>
      </div>

      <DataTable
        data={rules}
        columns={columns}
        onAdd={handleAdd}
        onExport={() => { }}
        title="Penalty Rules"
        addButtonText="New Rule"
        rowKey="id"
        enableBulkActions={true}
        onBulkDelete={handleBulkDelete}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-gray-900">
                {editingRule ? 'Edit Penalty Rule' : 'New Penalty Rule'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900 font-medium">
                Define the penalty amount charged when an item's condition changes from one state to another during move-out inspection.
                These rules are automatically applied when inspectors select conditions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Item Category <span className="text-red-600">*</span>
                  </label>
                  <select
                    required
                    value={formData.item_category}
                    onChange={(e) => setFormData({ ...formData, item_category: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Penalty Amount (₹) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.penalty_amount}
                    onChange={(e) => setFormData({ ...formData, penalty_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                    placeholder="Enter penalty amount"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    From Condition <span className="text-red-600">*</span>
                  </label>
                  <select
                    required
                    value={formData.from_condition}
                    onChange={(e) => setFormData({ ...formData, from_condition: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  >
                    {CONDITIONS.map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-600 mt-1">Condition at move-in</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    To Condition <span className="text-red-600">*</span>
                  </label>
                  <select
                    required
                    value={formData.to_condition}
                    onChange={(e) => setFormData({ ...formData, to_condition: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  >
                    {CONDITIONS.map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-600 mt-1">Condition at move-out</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  placeholder="Optional description of this penalty rule..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900 font-semibold">
                  Preview: If a <span className="font-bold">{formData.item_category}</span> item changes from{' '}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getConditionBadgeClass(formData.from_condition)}`}>
                    {formData.from_condition}
                  </span>
                  {' '}to{' '}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getConditionBadgeClass(formData.to_condition)}`}>
                    {formData.to_condition}
                  </span>
                  , the penalty will be <span className="font-bold text-red-600">{currencyFormatter.format(formData.penalty_amount)}</span>
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>{editingRule ? 'Update' : 'Create'} Rule</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
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