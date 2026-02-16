"use client";

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function PropertyPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className
}: PropertyPaginationProps) {
  // Calculate visible items range
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // Generate visible page numbers
  const getVisiblePages = () => {
    const maxVisiblePages = 5;
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate start and end of visible range
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        end = Math.min(4, totalPages - 1);
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = Math.max(totalPages - 3, 2);
      }

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('ellipsis-start');
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Handle page click
  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number') {
      onPageChange(page);
    }
  };

  // Navigate to previous page
  const goToPrevious = () => {
    if (!isFirstPage) {
      onPageChange(currentPage - 1);
    }
  };

  // Navigate to next page
  const goToNext = () => {
    if (!isLastPage) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate page buttons
  const renderPageButtons = () => {
    const visiblePages = getVisiblePages();

    return visiblePages.map((page, index) => {
      if (page === 'ellipsis-start' || page === 'ellipsis-end') {
        return (
          <Button
            key={`ellipsis-${index}`}
            variant="outline"
            size="sm"
            className="w-8 h-8 cursor-default hover:bg-transparent"
            disabled
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        );
      }

      const pageNum = page as number;
      const isActive = currentPage === pageNum;

      return (
        <Button
          key={`page-${pageNum}`}
          variant={isActive ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageClick(pageNum)}
          className={cn(
            "w-8 h-8 min-w-8",
            isActive 
              ? "bg-blue-600 hover:bg-blue-700 text-white" 
              : "hover:bg-gray-100"
          )}
          aria-label={`Go to page ${pageNum}`}
          aria-current={isActive ? "page" : undefined}
        >
          {pageNum}
        </Button>
      );
    });
  };

  // If there are no items or only one page, don't show pagination
  if (totalItems === 0 || totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-8 border-t", className)}>
      {/* Items info */}
      <div className="text-sm text-gray-600">
        <span className="font-medium">{startItem}</span> -{" "}
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalItems.toLocaleString()}</span>{" "}
        properties
        {totalPages > 1 && (
          <span className="ml-2 text-gray-500">
            (Page {currentPage} of {totalPages})
          </span>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevious}
          disabled={isFirstPage}
          className="gap-1"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1" role="navigation" aria-label="Pagination">
          {renderPageButtons()}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToNext}
          disabled={isLastPage}
          className="gap-1"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Quick jump (optional) */}
        {totalPages > 10 && (
          <div className="hidden lg:flex items-center gap-2 ml-4">
            <span className="text-sm text-gray-600">Go to:</span>
            <select
              value={currentPage}
              onChange={(e) => handlePageClick(Number(e.target.value))}
              className="h-8 text-sm border rounded-md px-2 bg-white"
              aria-label="Select page number"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <option key={page} value={page}>
                  Page {page}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}