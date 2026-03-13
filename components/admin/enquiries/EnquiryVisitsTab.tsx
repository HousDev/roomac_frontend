// components/admin/enquiries/EnquiryVisitsTab.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  CalendarPlus, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RotateCcw,
  User,
  Phone,
  Home
} from "lucide-react";
import { getVisits, updateVisitStatus, type Visit } from "@/lib/enquiryApi";
import { toast } from "sonner";
import ScheduleVisitDialog from "./ScheduleVisitDialog";

interface EnquiryVisitsTabProps {
  enquiryId: string;
  tenantName: string;
  onVisitChange?: () => void;
}

const EnquiryVisitsTab = ({ enquiryId, tenantName, onVisitChange }: EnquiryVisitsTabProps) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const loadVisits = async () => {
    setLoading(true);
    try {
      const response = await getVisits(enquiryId);
      setVisits(response.data || []);
    } catch (error) {
      console.error("Error loading visits:", error);
      toast.error("Failed to load visits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enquiryId) {
      loadVisits();
    }
  }, [enquiryId]);

  const handleStatusUpdate = async (visitId: string, newStatus: Visit['status']) => {
    setUpdatingStatus(visitId);
    try {
      await updateVisitStatus(visitId, newStatus);
      toast.success(`Visit marked as ${newStatus.replace('_', ' ')}`);
      loadVisits();
      if (onVisitChange) onVisitChange();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return null;
    // Convert 24hr format to 12hr format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status: Visit['status']) => {
    const variants = {
      scheduled: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      rescheduled: "bg-yellow-100 text-yellow-800 border-yellow-200",
      no_show: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return (
      <Badge variant="outline" className={`${variants[status]} capitalize text-xs`}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getStatusIcon = (status: Visit['status']) => {
    switch(status) {
      case 'completed': return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'cancelled': return <XCircle className="h-3 w-3 text-red-600" />;
      case 'rescheduled': return <RotateCcw className="h-3 w-3 text-yellow-600" />;
      case 'no_show': return <AlertCircle className="h-3 w-3 text-gray-600" />;
      default: return <Calendar className="h-3 w-3 text-blue-600" />;
    }
  };

  const isPastVisit = (date: string) => {
    const visitDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return visitDate < today;
  };

  if (loading) {
    return (
      <div className="py-4 text-center text-sm text-gray-500">
        Loading visits...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Schedule Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Scheduled Visits</h3>
        <Button
          size="sm"
          onClick={() => setShowScheduleDialog(true)}
          className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-900"
        >
          <CalendarPlus className="h-3 w-3 mr-1" />
          Schedule New
        </Button>
      </div>

      {/* Visits List */}
      {visits.length === 0 ? (
        <div className="py-6 text-center border border-dashed rounded-lg">
          <Calendar className="h-8 w-8 mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No visits scheduled yet</p>
          <Button
            variant="link"
            onClick={() => setShowScheduleDialog(true)}
            className="text-xs text-purple-600 mt-1"
          >
            Schedule your first visit
          </Button>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {visits.map((visit) => (
            <div
              key={visit.id}
              className={`border rounded-lg p-3 hover:bg-gray-50 transition ${
                isPastVisit(visit.scheduled_date) && visit.status === 'scheduled' 
                  ? 'border-orange-200 bg-orange-50/30' 
                  : ''
              }`}
            >
              {/* Visit Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusIcon(visit.status)}
                  <span className="text-sm font-medium">
                    {formatDate(visit.scheduled_date)}
                  </span>
                  {visit.scheduled_time && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(visit.scheduled_time)}
                    </span>
                  )}
                </div>
                {getStatusBadge(visit.status)}
              </div>

              {/* Notes */}
              {visit.notes && (
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-2">
                  {visit.notes}
                </p>
              )}

              {/* Past visit warning */}
              {isPastVisit(visit.scheduled_date) && visit.status === 'scheduled' && (
                <div className="text-[10px] text-orange-600 bg-orange-50 p-1.5 rounded mb-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  This visit was scheduled for a past date. Please update the status.
                </div>
              )}

              {/* Actions (for scheduled visits) */}
              {visit.status === 'scheduled' && (
                <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStatusUpdate(visit.id, 'completed')}
                    disabled={updatingStatus === visit.id}
                    className="h-6 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStatusUpdate(visit.id, 'no_show')}
                    disabled={updatingStatus === visit.id}
                    className="h-6 px-2 text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    No Show
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStatusUpdate(visit.id, 'cancelled')}
                    disabled={updatingStatus === visit.id}
                    className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center mt-2 text-[10px] text-gray-400">
                <span>Scheduled by: {visit.created_by}</span>
                <span>{new Date(visit.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Dialog */}
      <ScheduleVisitDialog
        enquiryId={enquiryId}
        tenantName={tenantName}
        isOpen={showScheduleDialog}
        onClose={() => setShowScheduleDialog(false)}
        onVisitScheduled={() => {
          loadVisits();
          if (onVisitChange) onVisitChange();
        }}
      />
    </div>
  );
};

export default EnquiryVisitsTab;