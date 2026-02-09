// components/admin/enquiries/components/EnquiriesTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Phone, Mail, Edit, Trash2 } from "lucide-react";
import { Enquiry } from "@/lib/enquiryApi";
import { Skeleton } from "@/components/ui/skeleton";

interface EnquiriesTableProps {
  enquiries: Enquiry[];
  loading: boolean;
  onView: (enquiry: Enquiry) => void;
  onEdit: (enquiry: Enquiry) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  formatDateForDisplay: (dateString: string) => string;
}

const EnquiriesTable = ({
  enquiries,
  loading,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
  getStatusBadge,
  formatDateForDisplay,
}: EnquiriesTableProps) => {
  if (loading && enquiries.length === 0) {
    return <EnquiriesTableSkeleton />;
  }

  if (enquiries.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="text-center py-8 text-gray-500">
          <p>No enquiries found</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>All Enquiries ({enquiries.length})</CardTitle>
          <div className="text-sm text-gray-500">
            Showing {enquiries.length} enquiries
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Move-in Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enquiries.map((enquiry) => (
                <TableRow key={enquiry.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{enquiry.tenant_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {enquiry.phone}
                      </div>
                      {enquiry.email && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          {enquiry.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{enquiry.property_full_name || enquiry.property_name || "-"}</TableCell>
                  <TableCell>{formatDateForDisplay(enquiry.preferred_move_in_date)}</TableCell>
                  <TableCell>{getStatusBadge(enquiry.status || "new")}</TableCell>
                  <TableCell>{formatDateForDisplay(enquiry.created_at || "")}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {/* View Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onView(enquiry)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Edit Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(enquiry)}
                        title="Edit Enquiry"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {/* Status Dropdown */}
                      <Select
                        value={enquiry.status || "new"}
                        onValueChange={(value) => onUpdateStatus(enquiry.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="interested">Interested</SelectItem>
                          <SelectItem value="not_interested">Not Interested</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Delete Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(enquiry.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete Enquiry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export const EnquiriesTableSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-40" />
    </CardHeader>
    <CardContent>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              <TableHead><Skeleton className="h-4 w-20" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
);

export default EnquiriesTable;