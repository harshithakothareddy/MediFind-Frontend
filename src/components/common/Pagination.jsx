import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between py-3 px-1">
      {totalItems !== undefined && (
        <p className="text-sm text-neutral-500">
          Showing <span className="font-medium text-neutral-700">{startItem}–{endItem}</span> of{' '}
          <span className="font-medium text-neutral-700">{totalItems}</span> results
        </p>
      )}
      <nav className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {start > 1 && (
          <>
            <PageButton page={1} current={currentPage} onChange={onPageChange} />
            {start > 2 && <span className="px-1 text-neutral-400">…</span>}
          </>
        )}
        
        {pages.map(p => <PageButton key={p} page={p} current={currentPage} onChange={onPageChange} />)}
        
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-neutral-400">…</span>}
            <PageButton page={totalPages} current={currentPage} onChange={onPageChange} />
          </>
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};

const PageButton = ({ page, current, onChange }) => (
  <button
    onClick={() => onChange(page)}
    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
      page === current
        ? 'bg-primary-600 text-white'
        : 'text-neutral-600 hover:bg-neutral-100'
    }`}
  >
    {page}
  </button>
);

export default Pagination;
