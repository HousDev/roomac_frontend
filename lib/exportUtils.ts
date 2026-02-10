// lib/exportUtils.ts

interface ExportOptions {
  format?: 'excel' | 'csv';
  filters?: {
    search?: string;
    status?: 'all' | 'active' | 'inactive';
  };
  onProgress?: (progress: number) => void;
  onSuccess?: (fileName: string, data: Blob) => void;
  onError?: (error: string) => void;
}

export const downloadExport = async (
  url: string,
  fileName: string,
  options?: ExportOptions
) => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    // Get filename from Content-Disposition header or use provided
    const contentDisposition = response.headers.get('Content-Disposition');
    let finalFileName = fileName;
    
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
      if (fileNameMatch) {
        finalFileName = fileNameMatch[1];
      }
    }
    
    const blob = await response.blob();
    
    // Create download link
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    options?.onSuccess?.(finalFileName, blob);
    
    return { success: true, fileName: finalFileName };
  } catch (error) {
    console.error('Download error:', error);
    options?.onError?.(error instanceof Error ? error.message : 'Export failed');
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Export master types with filters
export const handleExportTypes = async (options?: ExportOptions) => {
  const { format = 'excel', filters } = options || {};
  
  // Create URL with filters
  const params = new URLSearchParams();
  params.append('format', format);
  if (filters) {
    params.append('filters', JSON.stringify(filters));
  }
  
  const url = `${process.env.VITE_API_URL || ''}/api/masters/export/types?${params}`;
  
  return downloadExport(url, `master-types.${format === 'excel' ? 'xlsx' : 'csv'}`, options);
};

// Export master values with filters
export const handleExportValues = async (typeId: number, typeName: string, options?: ExportOptions) => {
  const { format = 'excel', filters } = options || {};
  
  const params = new URLSearchParams();
  params.append('format', format);
  if (filters) {
    params.append('filters', JSON.stringify(filters));
  }
  
  const url = `${process.env.VITE_API_URL || ''}/api/masters/export/values/${typeId}?${params}`;
  const fileName = `${typeName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-values.${format === 'excel' ? 'xlsx' : 'csv'}`;
  
  return downloadExport(url, fileName, options);
};

// Export all data
export const handleExportAllData = async (options?: ExportOptions) => {
  const url = `${process.env.VITE_API_URL || ''}/api/masters/export/all`;
  return downloadExport(url, 'master-data.xlsx', options);
};