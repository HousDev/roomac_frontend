// components/tenant/tenant-requests/RequestCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  Calendar, 
  Clock,
  Move,
  Bed,
  Home,
  Check,
  Receipt, // Add Receipt icon
  FileText
} from 'lucide-react';
import { 
  REQUEST_TYPE_ICONS, 
  PRIORITY_CONFIG 
} from './requestConfig';
import type { TenantRequest } from '@/lib/tenantRequestsApi';
import { getDisplayStatus, getStatusConfig } from './requestStatusMapper';

interface RequestCardProps {
  request: TenantRequest;
  vacateReasons?: any[];
}

export function RequestCard({ request }: RequestCardProps) {
  const RequestIcon = REQUEST_TYPE_ICONS[request.request_type as keyof typeof REQUEST_TYPE_ICONS] || REQUEST_TYPE_ICONS.general;
  const priorityConfig = PRIORITY_CONFIG[request.priority as keyof typeof PRIORITY_CONFIG];
  
  // Get the display status using the mapper
  const displayStatus = getDisplayStatus(request);
  const statusConfig = getStatusConfig(displayStatus);

// components/tenant/tenant-requests/RequestCard.tsx - Updated renderAdminNotes function

function renderAdminNotes(request: TenantRequest) {
  if (!request.admin_notes) return null;
  
  // Parse the notes string into individual entries
  const noteEntries: Array<{ timestamp: string; status: string; note: string }> = [];
  
  // Split by timestamp pattern [date, time]
  const lines = request.admin_notes.split('\n');
  let currentEntry: { timestamp: string; status: string; note: string } | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Check if this line contains a timestamp
    const timestampMatch = trimmedLine.match(/\[(.*?)\]/);
    if (timestampMatch) {
      // Save previous entry if exists
      if (currentEntry) {
        noteEntries.push(currentEntry);
      }
      
      // Start new entry
      currentEntry = {
        timestamp: timestampMatch[1],
        status: '',
        note: ''
      };
      
      // Extract status from the line
      const statusMatch = trimmedLine.match(/Status changed to (\w+):/);
      if (statusMatch) {
        currentEntry.status = statusMatch[1];
        // Extract note part after the colon
        const notePart = trimmedLine.replace(/\[.*?\]\s*Status changed to \w+:\s*/, '');
        currentEntry.note = notePart;
      }
    } else if (currentEntry && trimmedLine) {
      // This is continuation of the note
      currentEntry.note = currentEntry.note ? currentEntry.note + ' ' + trimmedLine : trimmedLine;
    }
  }
  
  // Add the last entry
  if (currentEntry) {
    noteEntries.push(currentEntry);
  }
  
  if (noteEntries.length === 0) return null;
  
  // Show the most recent 3 entries
  const recentEntries = noteEntries.slice(-3);
  
  // Get status color for display
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-50';
      case 'in_progress': return 'text-blue-700 bg-blue-50';
      case 'resolved': return 'text-green-700 bg-green-50';
      case 'closed': return 'text-gray-700 bg-gray-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };
  
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
      resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
      closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusMap[status] || statusMap.pending;
    return (
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${config.color} font-medium`}>
        {config.label}
      </span>
    );
  };
  
  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <h4 className="font-medium text-sm mb-2 text-blue-800 flex items-center gap-1">
        <FileText className="h-3.5 w-3.5" />
        Admin Updates
      </h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {recentEntries.map((entry, idx) => (
          <div key={idx} className="border-l-2 border-blue-300 pl-2 py-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] text-gray-500 font-mono">
                {entry.timestamp}
              </span>
              {getStatusBadge(entry.status)}
            </div>
            {entry.note && (
              <p className="text-xs text-gray-700 mt-0.5">
                {entry.note}
              </p>
            )}
          </div>
        ))}
      </div>
      {noteEntries.length > 3 && (
        <p className="text-[10px] text-blue-500 mt-2">
          +{noteEntries.length - 3} older updates
        </p>
      )}
    </div>
  );
}

  return (
    <Card key={request.id} className="overflow-hidden">
      <CardContent className="p-2 md:p-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-1.5 md:gap-3 mb-1.5 md:mb-2">
              <RequestIcon className="h-3.5 w-3.5 md:h-5 md:w-5 shrink-0" />
              <h3 className="font-semibold text-sm md:text-lg">{request.title}</h3>
              <div className="flex items-center gap-1 md:gap-2">
                {/* Use the mapped display status badge */}
                <Badge 
                  variant={statusConfig.variant} 
                  className={`flex items-center gap-1 ${statusConfig.color}`}
                >
                  {statusConfig.label}
                </Badge>
                <Badge className={priorityConfig.color}>
                  {priorityConfig.label}
                </Badge>
              </div>
            </div>
            
            <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-4 line-clamp-2 md:line-clamp-none">{request.description}</p>            
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                <span>Created: {format(new Date(request.created_at), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 md:h-4 md:w-4" />
                <span>Updated: {format(new Date(request.updated_at), 'dd MMM yyyy')}</span>
              </div>
              
              {request.request_type === 'vacate_bed' && request.vacate_data && (
                <div className="flex items-center gap-1">
                  <Move className="h-4 w-4" />
                  <span>Vacate Request</span>
                  {request.vacate_data.expected_vacate_date && (
                    <span className="ml-2">
                      (Expected: {format(new Date(request.vacate_data.expected_vacate_date), 'dd MMM yyyy')})
                    </span>
                  )}
                </div>
              )}

              {request.request_type === 'change_bed' && request.change_bed_data && (
                <div className="flex items-center gap-1">
                  <Move className="h-4 w-4" />
                  <span>Change Bed Request</span>
                  {request.change_bed_data.shifting_date && (
                    <span className="ml-2">
                      (Shifting: {format(new Date(request.change_bed_data.shifting_date), 'dd MMM yyyy')})
                    </span>
                  )}
                </div>
              )}

              {request.request_type === 'receipt' && request.receipt_data && (
                <div className="flex items-center gap-1">
                  <Receipt className="h-4 w-4" />
                  <span>Receipt Request</span>
                  {request.receipt_data.receipt_type === 'rent' && request.receipt_data.month && (
                    <span className="ml-2">
                      ({request.receipt_data.month} {request.receipt_data.year})
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Render specific details based on request type */}
            {renderRequestDetails(request)}
            {renderAdminNotes(request)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function renderRequestDetails(request: TenantRequest) {
  switch (request.request_type) {
    case 'vacate_bed':
      return <VacateRequestDetails request={request} />;
    case 'change_bed':
      return <ChangeBedRequestDetails request={request} />;
    case 'leave':
      return <LeaveRequestDetails request={request} />;
    case 'maintenance':
      return <MaintenanceRequestDetails request={request} />;
    case 'complaint':
      return <ComplaintRequestDetails request={request} />;
    case 'receipt':
      return <ReceiptRequestDetails request={request} />;
    default:
      return null;
  }
}

// Add this new component for receipt details
function ReceiptRequestDetails({ request }: { request: TenantRequest }) {
  if (!request.receipt_data) return null;

  return (
    <div className="mt-2 md:mt-4 p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-200">
      <h4 className="font-medium text-xs md:text-sm mb-1.5 md:mb-2 text-blue-800">Receipt Details:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-3 text-xs md:text-sm">
        <div>
          <span className="font-medium text-blue-700">Receipt Type: </span>
          <span className="capitalize">
            {request.receipt_data.receipt_type === 'rent' ? 'Rent Receipt' : 'Security Deposit Receipt'}
          </span>
        </div>
        
        {request.receipt_data.receipt_type === 'rent' && (
          <>
            <div>
              <span className="font-medium text-blue-700">Month: </span>
              <span>{request.receipt_data.month} {request.receipt_data.year}</span>
            </div>
            {request.receipt_data.amount && (
              <div>
                <span className="font-medium text-blue-700">Amount: </span>
                <span>₹{Number(request.receipt_data.amount).toLocaleString()}</span>
              </div>
            )}
          </>
        )}

        {request.receipt_data.receipt_type === 'security_deposit' && (
          <div className="col-span-2">
            <p className="text-sm text-gray-600">Security deposit receipt requested</p>
          </div>
        )}

        {request.receipt_data.status && (
          <div>
            <span className="font-medium text-blue-700">Receipt Status: </span>
            <Badge variant="outline" className="ml-1 capitalize">
              {request.receipt_data.status}
            </Badge>
          </div>
        )}

        {request.receipt_data.receipt_url && (
          <div className="col-span-2 mt-2">
            <a 
              href={request.receipt_data.receipt_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
            >
              <Receipt className="h-4 w-4" />
              View Receipt
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function VacateRequestDetails({ 
  request, 
}: { 
  request: TenantRequest; 
}) {
  if (!request.vacate_data) return null;

  return (
    <div className="mt-2 md:mt-4 p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="font-medium text-xs md:text-sm mb-1.5 md:mb-2">Vacate Details:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-3 text-xs md:text-sm">
        {/* Show the original vacate status */}
        {request.vacate_data.status && (
          <div className="col-span-2 mb-2">
            <span className="font-medium">Request Status: </span>
            <Badge variant="outline" className="ml-1 capitalize">
              {request.vacate_data.status.replace('_', ' ')}
            </Badge>
          </div>
        )}

        {request.vacate_data.primary_reason_id && (
          <div>
            <span className="font-medium">Primary Reason: </span>
            <span>{request.vacate_data?.primary_reason || 'N/A'}</span>
          </div>
        )}
        
        {request.vacate_data.secondary_reasons && request.vacate_data.secondary_reasons.length > 0 && (
          <div className="col-span-2">
            <span className="font-medium">Other Reasons: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {request.vacate_data.secondary_reasons.map((reason, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {request.vacate_data.expected_vacate_date && (
          <div>
            <span className="font-medium">Expected Vacate Date: </span>
            <span>{format(new Date(request.vacate_data.expected_vacate_date), 'dd MMM yyyy')}</span>
          </div>
        )}

        {/* Add ratings if they exist */}
        <div className="col-span-2 grid grid-cols-4 gap-2 mt-2">
          {request.vacate_data.overall_rating && (
            <div className="text-center p-2 bg-white rounded border">
              <span className="text-xs text-gray-500">Overall</span>
              <div className="font-medium">{request.vacate_data.overall_rating}/5</div>
            </div>
          )}
          {request.vacate_data.food_rating && (
            <div className="text-center p-2 bg-white rounded border">
              <span className="text-xs text-gray-500">Food</span>
              <div className="font-medium">{request.vacate_data.food_rating}/5</div>
            </div>
          )}
          {request.vacate_data.cleanliness_rating && (
            <div className="text-center p-2 bg-white rounded border">
              <span className="text-xs text-gray-500">Cleanliness</span>
              <div className="font-medium">{request.vacate_data.cleanliness_rating}/5</div>
            </div>
          )}
          {request.vacate_data.management_rating && (
            <div className="text-center p-2 bg-white rounded border">
              <span className="text-xs text-gray-500">Management</span>
              <div className="font-medium">{request.vacate_data.management_rating}/5</div>
            </div>
          )}
        </div>

        {request.vacate_data.improvement_suggestions && (
          <div className="col-span-2 mt-2">
            <span className="font-medium">Improvement Suggestions: </span>
            <p className="text-sm text-gray-700 mt-1 bg-white p-2 rounded border">
              {request.vacate_data.improvement_suggestions}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChangeBedRequestDetails({ request }: { request: TenantRequest }) {
  if (!request.change_bed_data) return null;

  return (
    <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
      <h4 className="font-medium text-sm mb-2 text-teal-800">Change Bed Details:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        {/* Show the original change bed status */}
        {request.change_bed_data.request_status && (
          <div className="col-span-2 mb-2">
            <span className="font-medium text-teal-700">Request Status: </span>
            <Badge variant="outline" className="ml-1 capitalize">
              {request.change_bed_data.request_status.replace('_', ' ')}
            </Badge>
          </div>
        )}

        <div>
          <span className="font-medium text-teal-700">Reason: </span>
          <span>{request.change_bed_data.change_reason || 'N/A'}</span>
        </div>
        <div>
          <span className="font-medium text-teal-700">Shifting Date: </span>
          <span>{request.change_bed_data.shifting_date ? format(new Date(request.change_bed_data.shifting_date), 'dd MMM yyyy') : 'N/A'}</span>
        </div>
        <div>
          <span className="font-medium text-teal-700">Preferred Property: </span>
          <span>{request.change_bed_data.preferred_property_name || 'N/A'}</span>
        </div>
        <div>
          <span className="font-medium text-teal-700">Preferred Room: </span>
          <span>{request.change_bed_data.preferred_room_number || 'N/A'}</span>
        </div>
        {request.change_bed_data.assigned_bed_number && (
          <div>
            <span className="font-medium text-teal-700">Assigned Bed: </span>
            <span>{request.change_bed_data.assigned_bed_number}</span>
          </div>
        )}
        {request.change_bed_data.rent_difference && (
          <div>
            <span className="font-medium text-teal-700">Rent Difference: </span>
            <span className={parseFloat(request.change_bed_data.rent_difference) > 0 ? 'text-red-600' : 'text-green-600'}>
              ₹{request.change_bed_data.rent_difference}
            </span>
          </div>
        )}
        {request.change_bed_data.notes && (
          <div className="col-span-2">
            <span className="font-medium text-teal-700">Notes: </span>
            <p className="text-sm mt-1 bg-white p-2 rounded border">
              {request.change_bed_data.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function LeaveRequestDetails({ request }: { request: TenantRequest }) {
  if (!request.leave_data) return null;

  return (
    <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
      <h4 className="font-medium text-sm mb-2 text-purple-800">Leave Details:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <span className="font-medium text-purple-700">Leave Type: </span>
          <span className="capitalize">{request.leave_data.leave_type}</span>
        </div>
        <div>
          <span className="font-medium text-purple-700">Duration: </span>
          <span>{request.leave_data.total_days} days</span>
        </div>
        <div>
          <span className="font-medium text-purple-700">Start Date: </span>
          <span>{format(new Date(request.leave_data.leave_start_date), 'dd MMM yyyy')}</span>
        </div>
        <div>
          <span className="font-medium text-purple-700">End Date: </span>
          <span>{format(new Date(request.leave_data.leave_end_date), 'dd MMM yyyy')}</span>
        </div>
        {request.leave_data.contact_address_during_leave && (
          <div className="col-span-2">
            <span className="font-medium text-purple-700">Contact Address: </span>
            <p className="text-sm mt-1 bg-white p-2 rounded border">
              {request.leave_data.contact_address_during_leave}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MaintenanceRequestDetails({ request }: { request: TenantRequest }) {
  if (!request.maintenance_data) return null;

  // Get status config for display
  const displayStatus = getDisplayStatus(request);
  const statusConfig = getStatusConfig(displayStatus);

  return (
    <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
      <h4 className="font-medium text-sm mb-2 text-orange-800">Maintenance Details:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <span className="font-medium text-orange-700">Issue Category: </span>
          <span className="capitalize">{request.maintenance_data.issue_category}</span>
        </div>
        <div>
          <span className="font-medium text-orange-700">Location: </span>
          <span className="capitalize">{request.maintenance_data.location?.replace('_', ' ')}</span>
        </div>
        <div>
          <span className="font-medium text-orange-700">Preferred Visit Time: </span>
          <span className="capitalize">{request.maintenance_data.preferred_visit_time?.replace('_', ' ')}</span>
        </div>
        <div>
          <span className="font-medium text-orange-700">Access Permission: </span>
          <span>{request.maintenance_data.access_permission ? 'Granted' : 'Not Granted'}</span>
        </div>
        <div className="col-span-2">
          <span className="font-medium text-orange-700">Current Status: </span>
          <Badge variant={statusConfig.variant} className={`ml-1 ${statusConfig.color}`}>
            {statusConfig.label}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function ComplaintRequestDetails({ request }: { request: TenantRequest }) {
  if (!request.complaint_data) return null;

  return (
    <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
      <h4 className="font-medium text-sm mb-2 text-red-800">Complaint Details:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <span className="font-medium text-red-700">Category: </span>
          <span>{request.complaint_data.complaint_category_name || 'N/A'}</span>
        </div>
        <div>
          <span className="font-medium text-red-700">Reason: </span>
          <span>
            {request.complaint_data.complaint_reason_name || 
             request.complaint_data.custom_reason || 
             'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}