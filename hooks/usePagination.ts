import { useEffect, useState } from 'react';

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

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const pageData = data.slice(startIndex, endIndex);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const prevButtonDisabled = currentPage === 1;
  const nextButtonDisabled = currentPage === totalPages;

  useEffect(() => {
    if (currentPage >= totalPages) {
      //If totalPages is non zero positive number - set currentPage as totalPages, else set currentPage as 1
      setCurrentPage(totalPages || 1);
    }
  }, [currentPage, totalPages]);

  return {
    currentPage,
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
