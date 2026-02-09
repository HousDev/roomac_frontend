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
  REQUEST_STATUS_CONFIG,
  PRIORITY_CONFIG 
} from './requestConfig';
import type { TenantRequest } from '@/lib/tenantRequestsApi';

interface RequestCardProps {
  request: TenantRequest;
}

export function RequestCard({ request }: RequestCardProps) {
  const RequestIcon = REQUEST_TYPE_ICONS[request.request_type as keyof typeof REQUEST_TYPE_ICONS] || REQUEST_TYPE_ICONS.general;
  const statusConfig = REQUEST_STATUS_CONFIG[request.status as keyof typeof REQUEST_STATUS_CONFIG];
  const priorityConfig = PRIORITY_CONFIG[request.priority as keyof typeof PRIORITY_CONFIG];

  return (
    <Card key={request.id} className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <RequestIcon className="h-5 w-5" />
              <h3 className="font-semibold text-lg">{request.title}</h3>
              <div className="flex items-center gap-2">
                <Badge variant={statusConfig.variant} className="flex items-center gap-1">
                  <statusConfig.icon className="h-3 w-3" />
                  {statusConfig.label}
                </Badge>
                <Badge className={priorityConfig.color}>
                  {priorityConfig.label}
                </Badge>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{request.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created: {format(new Date(request.created_at), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
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

function VacateRequestDetails({ request }: { request: TenantRequest }) {
  if (!request.vacate_data) return null;

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="font-medium text-sm mb-2">Vacate Details:</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        {request.vacate_data.primary_reason_id && (
          <div>
            <span className="font-medium">Primary Reason: </span>
            <span>N/A</span>
          </div>
        )}
        {/* Add more fields as needed */}
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
        <div>
          <span className="font-medium text-teal-700">Preferred Property: </span>
          <span>{request.change_bed_data.preferred_property_name || 'N/A'}</span>
        </div>
        <div>
          <span className="font-medium text-teal-700">Preferred Room: </span>
          <span>{request.change_bed_data.preferred_room_number || 'N/A'}</span>
        </div>
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