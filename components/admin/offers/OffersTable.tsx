// app/admin/offers/components/OffersTable.tsx
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Offer } from "@/lib/offerApi";
import { PropertyApiResponse } from "./OffersClientPage";
import {
  Building,
  Key,
  Ticket,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Share2,
} from "lucide-react";
import Pagination from "./Pagination";
import { Skeleton } from "@/components/ui/skeleton";

interface OffersTableProps {
  offers: Offer[];
  loading: boolean;
  properties: PropertyApiResponse[];
  onEdit: (offer: Offer) => void;
  onDelete: (offerId: string) => void;
  onToggleActive: (offerId: string, currentStatus: boolean) => void;
  onPreview: (offer: Offer) => void;
  onShare: (offer: Offer) => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange: (page: number) => void;
}

const OffersTable = ({
  offers,
  loading,
  properties,
  onEdit,
  onDelete,
  onToggleActive,
  onPreview,
  onShare,
  pagination,
  onPageChange,
}: OffersTableProps) => {
  if (loading) {
    return <OffersTableSkeleton />;
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gradient-to-r from-blue-100 to-cyan-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <Ticket className="h-12 w-12 text-blue-400" />
        </div>
        <p className="text-slate-700 font-medium text-lg mb-2">
          No offers created yet
        </p>
        <p className="text-slate-500 mb-6">
          Create your first offer to attract more tenants
        </p>
      </div>
    );
  }

  const renderPropertyInfo = (offer: Offer) => {
    if (!offer.property_name) {
      return (
        <div className="flex items-center gap-2">
          <Building className="h-3 w-3 text-gray-400" />
          <span className="text-gray-500 text-sm">General Offer</span>
        </div>
      );
    }
    
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Building className="h-3 w-3 text-purple-500" />
          <span className="font-medium text-sm">{offer.property_name}</span>
        </div>
        {offer.room_number && (
          <div className="flex items-center gap-2 text-xs text-gray-600 ml-1">
            <Key className="h-3 w-3" />
            <span>Room {offer.room_number}</span>
            {offer.sharing_type && (
              <Badge variant="outline" className="text-xs px-1 py-0 h-4 capitalize">
                {offer.sharing_type}
              </Badge>
            )}
            {offer.rent_per_bed && (
              <span className="text-xs text-green-600">
                ₹{offer.rent_per_bed}/bed
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm mb-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50">
              <TableHead className="font-semibold text-gray-700">Code</TableHead>
              <TableHead className="font-semibold text-gray-700">Offer Details</TableHead>
              <TableHead className="font-semibold text-gray-700">Property / Room</TableHead>
              <TableHead className="font-semibold text-gray-700">Discount</TableHead>
              <TableHead className="font-semibold text-gray-700">Min Stay</TableHead>
              <TableHead className="font-semibold text-gray-700">Validity</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer) => (
              <TableRow key={offer.id} className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
                <TableCell className="font-mono font-bold text-blue-700">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-3 w-3 text-blue-500" />
                    {offer.code}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {offer.title}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {offer.description || offer.offer_type.replace('_', ' ')}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {renderPropertyInfo(offer)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`${offer.discount_type === "percentage"
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200"
                      : "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200"
                    } font-medium`}>
                    {offer.discount_type === "percentage" ? (
                      <div className="flex items-center gap-1">
                        {offer.discount_percent}% OFF
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        ₹{offer.discount_value} OFF
                      </div>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="font-medium">{offer.min_months} months</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {offer.start_date ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span>{new Date(offer.start_date).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">No start date</span>
                    )}
                    {offer.end_date && (
                      <p className="text-slate-500 text-xs mt-1">
                        to {new Date(offer.end_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant={offer.is_active ? "default" : "outline"}
                    onClick={() => onToggleActive(offer.id, offer.is_active)}
                    className={`${offer.is_active
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
                        : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    {offer.is_active ? "Active" : "Inactive"}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPreview(offer)}
                      className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border-gray-300"
                      title="View Offer Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(offer)}
                      className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border-gray-300"
                      title="Edit Offer"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(offer.id)}
                      className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 border-gray-300"
                      title="Delete Offer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onShare(offer)}
                      className="hover:bg-green-50 hover:text-green-600 hover:border-green-300 border-gray-300"
                      title="Share Offer"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
            className="py-2"
          />
        </div>
      )}
    </>
  );
};

export const OffersTableSkeleton = () => (
  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
    <Table>
      <TableHeader>
        <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50">
          <TableHead className="font-semibold text-gray-700">Code</TableHead>
          <TableHead className="font-semibold text-gray-700">Offer Details</TableHead>
          <TableHead className="font-semibold text-gray-700">Property / Room</TableHead>
          <TableHead className="font-semibold text-gray-700">Discount</TableHead>
          <TableHead className="font-semibold text-gray-700">Min Stay</TableHead>
          <TableHead className="font-semibold text-gray-700">Validity</TableHead>
          <TableHead className="font-semibold text-gray-700">Status</TableHead>
          <TableHead className="font-semibold text-gray-700">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-12" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-8 w-16" />
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default OffersTable;