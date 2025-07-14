import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/shadcn/ui/pagination';

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
  siblingCount?: number;
  prevButtonDisabled?: boolean;
  nextButtonDisabled?: boolean;
};

const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  totalPages,
  onChange,
  className = '',
  siblingCount = 1,
  prevButtonDisabled,
  nextButtonDisabled,
}) => {
  const getPageNumbers = () => {
    const range: (number | 'dots')[] = [];
    const start = Math.max(2, page - siblingCount);
    const end = Math.min(totalPages - 1, page + siblingCount);

    range.push(1);

    if (start > 2) range.push('dots');

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (end < totalPages - 1) range.push('dots');

    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  const pageItems = getPageNumbers().map((item, idx) =>
    item === 'dots' ? (
      <PaginationItem key={`dots-${idx}`}>
        <PaginationEllipsis />
      </PaginationItem>
    ) : (
      <PaginationItem key={item}>
        <PaginationLink
          href="#"
          isActive={item === page}
          onClick={(e) => {
            e.preventDefault();
            if (typeof item === 'number') onChange(item);
          }}
        >
          {item}
        </PaginationLink>
      </PaginationItem>
    )
  );

  return (
    <div className={`w-full flex justify-center py-4 ${className}`}>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={(e) => {
                e.preventDefault();
                if (!prevButtonDisabled && page > 1) onChange(page - 1);
              }}
              className={
                prevButtonDisabled || page === 1
                  ? 'pointer-events-none opacity-50'
                  : 'cursor-pointer'
              }
              aria-disabled={prevButtonDisabled ?? page === 1}
            />
          </PaginationItem>

          {pageItems}

          <PaginationItem>
            <PaginationNext
              onClick={(e) => {
                e.preventDefault();
                if (!nextButtonDisabled && page < totalPages)
                  onChange(page + 1);
              }}
              className={
                nextButtonDisabled || page === totalPages
                  ? 'pointer-events-none opacity-50'
                  : 'cursor-pointer'
              }
              aria-disabled={nextButtonDisabled ?? page === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaginationControls;
