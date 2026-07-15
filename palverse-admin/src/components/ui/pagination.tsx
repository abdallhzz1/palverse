import { Button } from "./button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({ currentPage, totalPages, onPageChange, disabled = false }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-border dark:border-slate-800 bg-card dark:bg-[#1F2522] px-4 py-3 sm:px-6 rounded-b-lg">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            صفحة <span className="font-medium">{currentPage}</span> من <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm gap-1" aria-label="Pagination">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1 || disabled}
              title="الصفحة الأولى"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || disabled}
              title="السابق"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <span className="flex h-8 w-8 items-center justify-center text-sm font-semibold text-foreground dark:text-white">
              {currentPage}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || disabled}
              title="التالي"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages || disabled}
              title="الصفحة الأخيرة"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </div>
      
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || disabled}
        >
          السابق
        </Button>
        <div className="flex items-center">
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {currentPage} / {totalPages}
          </span>
        </div>
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || disabled}
        >
          التالي
        </Button>
      </div>
    </div>
  );
}
