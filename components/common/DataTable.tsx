import { useState, useMemo } from 'react';
import { Search, Download, Upload, Filter, X, ChevronUp, ChevronDown, Trash2, CheckSquare, ChevronLeft, ChevronRight } from 'lucide-react';

interface Column<T> {
  key: string;
  label: string | React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onAdd?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onBulkDelete?: (rows: T[]) => void;
  onExport?: () => void;
  onImport?: () => void;
  actions?: (row: T) => React.ReactNode;
  title?: string;
  addButtonText?: string;
  rowKey?: string;
  enableBulkActions?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  itemsPerPage?: number;
  hideFilters?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  onBulkDelete,
  onExport,
  onImport,
  actions,
  title,
  addButtonText = 'Add New',
  rowKey = 'id',
  enableBulkActions = true,
  loading = false,
  emptyMessage = 'No data found',
  itemsPerPage = 10,
  hideFilters = false
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());
  const [expandedRow, setExpandedRow] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedData.length && paginatedData.length > 0) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map(row => row[rowKey])));
    }
  };

  const toggleSelectRow = (id: any) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedRows.size > 0) {
      const rowsToDelete = data.filter(row => selectedRows.has(row[rowKey]));
      onBulkDelete(rowsToDelete);
      setSelectedRows(new Set());
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data];

    if (searchTerm) {
      filtered = filtered.filter(row =>
        columns.some(col => {
          if (col.searchable !== false && col.key !== 'select' && col.key !== 'actions') {
            const value = row[col.key];
            return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
          }
          return false;
        })
      );
    }

    Object.entries(columnFilters).forEach(([key, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(row => {
          const value = row[key];
          return value && value.toString().toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, columnFilters, sortConfig, columns]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  const exportToCSV = () => {
    const exportColumns = columns.filter(col => col.key !== 'select' && col.key !== 'actions');
    const headers = exportColumns.map(col =>
      typeof col.label === 'string' ? col.label : col.key
    ).join(',');
    const rows = filteredAndSortedData.map(row =>
      exportColumns.map(col => {
        const value = row[col.key];
        return `"${value !== null && value !== undefined ? value : ''}"`;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'data'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRows(new Set());
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white sm:px-6">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span>
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)}
            </span>{' '}
            of <span className="font-medium">{filteredAndSortedData.length}</span> results
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-500">...</span>}
            </>
          )}
          {pages.map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 border rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          {title && <h2 className="text-xl font-bold text-gray-900">{title}</h2>}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {enableBulkActions && selectedRows.size > 0 && (
              <div className="flex items-center gap-2 mr-4 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">{selectedRows.size} selected</span>
                {onBulkDelete && (
                  <button
                    onClick={handleBulkDelete}
                    className="ml-2 flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-medium transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                )}
              </div>
            )}
            {onImport && (
              <button
                onClick={onImport}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Import</span>
              </button>
            )}
            {onExport && (
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
            {onAdd && (
              <button
                onClick={onAdd}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg text-white rounded-lg font-medium transition-all text-sm"
              >
                <span className="text-lg sm:hidden">+</span>
                <span className="hidden sm:inline">{addButtonText}</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search across all columns..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {!hideFilters && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-medium transition-colors ${
                showFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Column Filters</span>
              <button
                onClick={() => setColumnFilters({})}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {columns
                .filter(col => col.key !== 'select' && col.key !== 'actions')
                .map(col => (
                  <div key={col.key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {typeof col.label === 'string' ? col.label : col.key}
                    </label>
                    <input
                      type="text"
                      value={columnFilters[col.key] || ''}
                      onChange={(e) => {
                        setColumnFilters(prev => ({ ...prev, [col.key]: e.target.value }));
                        setCurrentPage(1);
                      }}
                      placeholder={`Filter ${typeof col.label === 'string' ? col.label : col.key}`}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="flex-1 overflow-auto hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {enableBulkActions && (
                <th className="px-4 py-3 border-b border-gray-200 w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </th>
              )}
              {columns.map(col => {
                if (col.key === 'select') {
                  return (
                    <th key={col.key} className="px-4 py-3 border-b border-gray-200 w-12">
                      {col.label}
                    </th>
                  );
                }
                return (
                  <th
                    key={col.key}
                    className={`px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200 ${
                      col.sortable !== false && col.key !== 'actions' ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    onClick={() => col.sortable !== false && col.key !== 'actions' && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {col.sortable !== false && col.key !== 'actions' && sortConfig?.key === col.key && (
                        sortConfig.direction === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (enableBulkActions ? 1 : 0)}
                  className="px-6 py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Search className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-lg font-semibold">{emptyMessage}</p>
                    {searchTerm || Object.keys(columnFilters).length > 0 ? (
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    ) : null}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row[rowKey] || idx} className="hover:bg-gray-50 transition-colors">
                  {enableBulkActions && (
                    <td className="px-4 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row[rowKey])}
                        onChange={() => toggleSelectRow(row[rowKey])}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={col.key} className="px-6 py-4 text-sm text-gray-900">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="flex-1 overflow-auto md:hidden">
        {paginatedData.length === 0 ? (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <Search className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-lg font-semibold">{emptyMessage}</p>
              {searchTerm || Object.keys(columnFilters).length > 0 ? (
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {paginatedData.map((row, idx) => (
              <div key={row[rowKey] || idx} className="p-4 bg-white hover:bg-gray-50">
                {enableBulkActions && (
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row[rowKey])}
                      onChange={() => toggleSelectRow(row[rowKey])}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-500 font-medium">Select this item</span>
                  </div>
                )}

                <div className="space-y-2">
                  {columns
                    .filter(col => col.key !== 'select' && col.key !== 'actions')
                    .slice(0, 4)
                    .map(col => (
                      <div key={col.key} className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">
                          {typeof col.label === 'string' ? col.label : col.key}:
                        </span>
                        <span className="text-sm text-gray-900 font-medium text-right">
                          {col.render ? col.render(row) : row[col.key]}
                        </span>
                      </div>
                    ))}

                  {columns.filter(col => col.key !== 'select' && col.key !== 'actions').length > 4 && (
                    <button
                      onClick={() => setExpandedRow(expandedRow === row[rowKey] ? null : row[rowKey])}
                      className="text-xs text-blue-600 font-bold mt-2"
                    >
                      {expandedRow === row[rowKey]
                        ? 'Show Less'
                        : `Show ${columns.filter(col => col.key !== 'select' && col.key !== 'actions').length - 4} More Fields`
                      }
                    </button>
                  )}

                  {expandedRow === row[rowKey] && (
                    <div className="mt-2 pt-2 border-t border-gray-100 space-y-2">
                      {columns
                        .filter(col => col.key !== 'select' && col.key !== 'actions')
                        .slice(4)
                        .map(col => (
                          <div key={col.key} className="flex justify-between items-start gap-2">
                            <span className="text-xs font-bold text-gray-500 uppercase">
                              {typeof col.label === 'string' ? col.label : col.key}:
                            </span>
                            <span className="text-sm text-gray-900 font-medium text-right">
                              {col.render ? col.render(row) : row[col.key]}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {columns.find(col => col.key === 'actions') && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    {columns.find(col => col.key === 'actions')?.render?.(row)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {renderPagination()}
    </div>
  );
}
