import { useState } from 'react';

interface PaginationResult<T> {
  currentPage: number;
  totalPages: number;
  pageData: T[];
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  goToPage: (page: number) => void;
  prevButtonDisabled: boolean;
  nextButtonDisabled: boolean;
}

const usePagination = <T>(data: T[], perPage: number): PaginationResult<T> => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / perPage);

  const safeTotalPages = Math.max(totalPages, 1);
  const safeCurrentPage = Math.min(currentPage, safeTotalPages);

  const startIndex = (safeCurrentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const pageData = data.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    if (safeCurrentPage > 1) {
      setCurrentPage(safeCurrentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (safeCurrentPage < safeTotalPages) {
      setCurrentPage(safeCurrentPage + 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= safeTotalPages) {
      setCurrentPage(page);
    }
  };

  const prevButtonDisabled = safeCurrentPage === 1;
  const nextButtonDisabled = safeCurrentPage === safeTotalPages;

  return {
    currentPage: safeCurrentPage,
    totalPages,
    pageData,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  };
};

export default usePagination;
