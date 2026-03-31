// app/admin/offers/PricingPlansTable.tsx
import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Edit, Trash2, Star, IndianRupee, Building, ChevronLeft, ChevronRight,
  Sparkles, Clock, Check, Gift, Eye, Loader2, AlertCircle, Trash,
} from "lucide-react";
import { PricingPlan, PaginationMeta } from "@/lib/pricingPlanApi";
import { PropertyApiResponse } from "../offers/OffersClientPage";

interface PricingPlansTableProps {
  plans: PricingPlan[];
  loading: boolean;
  properties: PropertyApiResponse[];
  pagination: PaginationMeta;
  onEdit: (plan: PricingPlan) => void;
  onDelete: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onToggleActive: (id: string, current: boolean) => void;
  onPageChange: (page: number) => void;
  onCreateNew: () => void;
  onView?: (plan: PricingPlan) => void;
}

const PricingPlansTable = ({
  plans,
  loading,
  properties,
  pagination,
  onEdit,
  onDelete,
  onBulkDelete,
  onToggleActive,
  onPageChange,
  onCreateNew,
  onView,
}: PricingPlansTableProps) => {
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<PricingPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const getPropertyName = (propertyId: number | null) => {
    if (!propertyId) return null;
    return properties.find(p => p.id === propertyId)?.name || `Property #${propertyId}`;
  };

  // Handle single plan selection
  const handleSelectPlan = (id: string) => {
    setSelectedPlans(prev => {
      if (prev.includes(id)) {
        return prev.filter(planId => planId !== id);
      } else {
        return [...prev, id];
      }
    });
    setSelectAll(false);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPlans([]);
      setSelectAll(false);
    } else {
      const allIds = plans.map(plan => plan.id);
      setSelectedPlans(allIds);
      setSelectAll(true);
    }
  };

  // Handle single delete with modal
  const handleDeleteClick = (plan: PricingPlan) => {
    setPlanToDelete(plan);
    setShowDeleteDialog(true);
  };

  // Confirm single delete
  const confirmDelete = async () => {
    if (!planToDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(planToDelete.id);
      setShowDeleteDialog(false);
      setPlanToDelete(null);
    } catch (error) {
      console.error("Error deleting plan:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedPlans.length === 0) return;
    setShowBulkDeleteDialog(true);
  };

  // Confirm bulk delete
  const confirmBulkDelete = async () => {
    if (!onBulkDelete) return;
    
    setIsBulkDeleting(true);
    try {
      await onBulkDelete(selectedPlans);
      setSelectedPlans([]);
      setSelectAll(false);
      setShowBulkDeleteDialog(false);
    } catch (error) {
      console.error("Error bulk deleting plans:", error);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!plans.length) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-base font-bold text-gray-700 mb-1">No Pricing Plans Yet</h3>
        <p className="text-sm text-gray-500 mb-4">Create your first pricing plan to get started</p>
        <Button
          onClick={onCreateNew}
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
        >
          Create Plan
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Bulk Actions Bar */}
        {selectedPlans.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-3 flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {selectedPlans.length} {selectedPlans.length === 1 ? 'plan' : 'plans'} selected
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSelectedPlans([]);
                  setSelectAll(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear
              </Button>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash className="h-4 w-4 mr-1" />
              Delete Selected
            </Button>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                {/* Checkbox column */}
                <TableHead className="text-[11px] font-bold text-gray-600 py-2 pl-4 w-8">
                  <Checkbox 
                    checked={selectAll && plans.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="h-3.5 w-3.5"
                  />
                </TableHead>
                <TableHead className="text-[11px] font-bold text-gray-600 py-2 w-8">#</TableHead>
                <TableHead className="text-[11px] font-bold text-gray-600 py-2">Plan</TableHead>
                <TableHead className="text-[11px] font-bold text-gray-600 py-2">Pricing</TableHead>
                <TableHead className="text-[11px] font-bold text-gray-600 py-2 hidden md:table-cell">Features</TableHead>
                <TableHead className="text-[11px] font-bold text-gray-600 py-2 hidden sm:table-cell">Property</TableHead>
                <TableHead className="text-[11px] font-bold text-gray-600 py-2">Status</TableHead>
                <TableHead className="text-[11px] font-bold text-gray-600 py-2 text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {plans.map((plan) => {
                const propertyName = getPropertyName(plan.property_id);
                const isShortStay = plan.is_short_stay;

                return (
                  <TableRow key={plan.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* Checkbox */}
                    <TableCell className="py-2.5 pl-4">
                      <Checkbox 
                        checked={selectedPlans.includes(plan.id)}
                        onCheckedChange={() => handleSelectPlan(plan.id)}
                        className="h-3.5 w-3.5"
                      />
                    </TableCell>

                    {/* Order column */}
                    <TableCell className="py-2.5">
                      {!plan.is_short_stay && (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                          {plan.display_order}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isShortStay
                            ? "bg-gradient-to-br from-amber-500 to-orange-500"
                            : plan.button_style === "blue"
                              ? "bg-gradient-to-br from-blue-600 to-cyan-600"
                              : "bg-gradient-to-br from-gray-700 to-gray-900"
                        }`}>
                          {isShortStay ? (
                            <Gift className="h-3.5 w-3.5 text-white" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-gray-900">{plan.name}</span>
                            {isShortStay && (
                              <Badge className="text-[8px] px-1 py-0 h-3.5 bg-amber-100 text-amber-700 border-amber-200">
                                <Gift className="h-2 w-2 mr-0.5" />
                                Short Stay
                              </Badge>
                            )}
                            {!!plan.is_popular && !isShortStay && (
                              <Badge className="text-[8px] px-1 py-0 h-3.5 bg-amber-100 text-amber-700 border-amber-200">
                                <Star className="h-2 w-2 mr-0.5 fill-amber-500 text-amber-500" />
                                Popular
                              </Badge>
                            )}
                          </div>
                          {!isShortStay && (
                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                              <Clock className="h-2.5 w-2.5" />
                              {plan.duration}
                              <span className="text-gray-300 mx-0.5">•</span>
                              <span className="text-gray-400">{plan.subtitle}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5">
                      {isShortStay ? (
                        <div>
                          <div className="flex items-baseline gap-0.5">
                            <IndianRupee className="h-3 w-3 text-amber-600" />
                            <span className="text-sm font-black text-amber-600">
                              {plan.short_stay_rate_per_day?.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-gray-400">/day</span>
                          </div>
                          <div className="text-[9px] text-gray-400 mt-0.5">
                            Flexible daily booking
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-0.5">
                            <IndianRupee className="h-3 w-3 text-blue-600" />
                            <span className="text-sm font-black text-blue-600">
                              {plan.total_price.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400">
                            ₹{plan.per_day_price}/day
                          </div>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="py-2.5 hidden md:table-cell">
                      {isShortStay ? (
                        <div className="flex flex-wrap gap-1">
                          <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                            <Check className="h-2 w-2" />
                            No minimum stay
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                            <Check className="h-2 w-2" />
                            Flexible check-in
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {plan.features.slice(0, 2).map((f, i) => (
                            <span key={i} className="inline-flex items-center gap-0.5 text-[9px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-full">
                              <Check className="h-2 w-2 text-green-500" />
                              {f}
                            </span>
                          ))}
                          {plan.features.length > 2 && (
                            <span className="text-[9px] text-gray-400">+{plan.features.length - 2} more</span>
                          )}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="py-2.5 hidden sm:table-cell">
                      {propertyName ? (
                        <div className="flex items-center gap-1 text-[10px] text-gray-600">
                          <Building className="h-2.5 w-2.5 text-purple-500" />
                          <span className="truncate max-w-[100px]">{propertyName}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">General</span>
                      )}
                    </TableCell>

                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Switch
                          checked={plan.is_active}
                          onCheckedChange={() => onToggleActive(plan.id, plan.is_active)}
                          className="scale-75 data-[state=checked]:bg-green-500"
                        />
                        <span className={`text-[10px] font-semibold ${plan.is_active ? "text-green-600" : "text-gray-400"}`}>
                          {plan.is_active ? "Active" : "Off"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onView && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onView(plan)}
                            className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
                            title="View Details"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(plan)}
                          className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(plan)}
                          className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] text-gray-500">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1}–
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} of {pagination.totalItems} plans
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="h-6 w-6 p-0"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    size="sm"
                    variant={pagination.currentPage === page ? "default" : "outline"}
                    onClick={() => onPageChange(page)}
                    className={`h-6 w-6 p-0 text-[10px] ${
                      pagination.currentPage === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : ""
                    }`}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="h-6 w-6 p-0"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Single Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this pricing plan?
              {planToDelete && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">{planToDelete.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Price: ₹{planToDelete.is_short_stay 
                      ? planToDelete.short_stay_rate_per_day?.toLocaleString() + "/day"
                      : planToDelete.total_price.toLocaleString()}
                  </p>
                </div>
              )}
              <p className="mt-2 text-sm text-red-600">This action cannot be undone.</p>
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setPlanToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Plan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirm Bulk Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedPlans.length} {selectedPlans.length === 1 ? 'plan' : 'plans'}?
              <div className="mt-3 p-3 bg-gray-50 rounded-md max-h-32 overflow-y-auto">
                <p className="text-xs font-medium text-gray-700 mb-1">Selected plans:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {plans
                    .filter(p => selectedPlans.includes(p.id))
                    .slice(0, 5)
                    .map(p => (
                      <li key={p.id} className="truncate">• {p.name}</li>
                    ))}
                  {selectedPlans.length > 5 && (
                    <li className="text-gray-400">...and {selectedPlans.length - 5} more</li>
                  )}
                </ul>
              </div>
              <p className="mt-2 text-sm text-red-600">This action cannot be undone.</p>
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkDeleteDialog(false)}
              disabled={isBulkDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBulkDelete}
              disabled={isBulkDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isBulkDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete {selectedPlans.length} {selectedPlans.length === 1 ? 'Plan' : 'Plans'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PricingPlansTable;