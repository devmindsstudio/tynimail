import {
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronsLeft,
} from "lucide-react";

const Pagination = ({
  size,
  length,
  currentPage,
  totalPages,
  setCurrentPage,
}: {
  size: number;
  length: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}) => {
  return (
    <>
      <div className="flex items-center justify-between flex-col lg:flex-row  pt-8">
        <p className="text-sm text-muted-foreground w-full lg:max-w-30/100">
          {size} of {length} row(s) selected.
        </p>
        <div className="flex items-center flex-wrap justify-center lg:flex-nowrap gap-4 w-full lg:max-w-70/100 lg:justify-end">
          <h2 className="text-sm text-foreground font-normal font-inter">
            Page {currentPage} of {totalPages}
          </h2>

          <div className="flex gap-2 items-center justify-end">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="h-10 w-10 min-h-10 max-w-10 border border-muted-foreground text-foreground rounded-lg shadow-buttons flex justify-center items-center hover:bg-accent transition-all cursor-pointer  disabled:cursor-not-allowed"
            >
              <ChevronsLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-10 w-10 min-h-10 max-w-10 border border-muted-foreground text-foreground rounded-lg shadow-buttons flex justify-center items-center hover:bg-accent transition-all cursor-pointer  disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="h-10 w-10 min-h-10 max-w-10 border border-muted-foreground text-foreground rounded-lg shadow-buttons flex justify-center items-center hover:bg-accent transition-all cursor-pointer  disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="h-10 w-10 min-h-10 max-w-10 border border-muted-foreground text-foreground rounded-lg shadow-buttons flex justify-center items-center hover:bg-accent transition-all cursor-pointer  disabled:cursor-not-allowed"
            >
              <ChevronsRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pagination;
