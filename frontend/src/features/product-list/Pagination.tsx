import { Pagination as BSPagination } from 'react-bootstrap';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <BSPagination className="justify-content-center mt-4">
      <BSPagination.Prev
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
      
      {startPage > 1 && (
        <>
          <BSPagination.Item onClick={() => onPageChange(1)}>1</BSPagination.Item>
          {startPage > 2 && <BSPagination.Ellipsis disabled />}
        </>
      )}
      
      {pages.map((page) => (
        <BSPagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => onPageChange(page)}
        >
          {page}
        </BSPagination.Item>
      ))}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <BSPagination.Ellipsis disabled />}
          <BSPagination.Item onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </BSPagination.Item>
        </>
      )}
      
      <BSPagination.Next
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    </BSPagination>
  );
}
