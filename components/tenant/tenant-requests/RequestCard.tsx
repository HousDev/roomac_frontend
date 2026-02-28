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
  Check
} from 'lucide-react';
import { 
  REQUEST_TYPE_ICONS, 
  PRIORITY_CONFIG 
} from './requestConfig';
import type { TenantRequest } from '@/lib/tenantRequestsApi';
import { getDisplayStatus, getStatusConfig } from './requestStatusMapper';

interface RequestCardProps {
  request: TenantRequest;
  vacateReasons?: any[]; // Add this
}

export function RequestCard({ request }: RequestCardProps) {
  const RequestIcon = REQUEST_TYPE_ICONS[request.request_type as keyof typeof REQUEST_TYPE_ICONS] || REQUEST_TYPE_ICONS.general;
  const priorityConfig = PRIORITY_CONFIG[request.priority as keyof typeof PRIORITY_CONFIG];
  
  // Get the display status using the mapper
  const displayStatus = getDisplayStatus(request);
  const statusConfig = getStatusConfig(displayStatus);

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
            </div>
            
            {/* Render specific details based on request type */}
            {renderRequestDetails(request)}
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
    default:
      return null;
  }
}

// In your VacateRequestDetails component
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
          <span className="capitalize">{request.maintenance_data.location}</span>
        </div>
        <div>
          <span className="font-medium text-orange-700">Preferred Visit Time: </span>
          <span className="capitalize">{request.maintenance_data.preferred_visit_time?.replace('_', ' ')}</span>
        </div>
        <div>
          <span className="font-medium text-orange-700">Access Permission: </span>
          <span>{request.maintenance_data.access_permission ? 'Granted' : 'Not Granted'}</span>
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