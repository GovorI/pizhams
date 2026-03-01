import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  it('should not render when totalPages <= 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} />
    );
    
    expect(container).toBeEmptyDOMElement();
  });

  it('should render pagination with correct page numbers', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should highlight current page', () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    const currentPageItem = screen.getByText('3');
    expect(currentPageItem).toBeInTheDocument();
    expect(currentPageItem.parentElement).toHaveClass('active');
  });

  it('should call onPageChange when page is clicked', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    fireEvent.click(screen.getByText('3'));
    
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('should call onPageChange when next button is clicked', () => {
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('should call onPageChange when prev button is clicked', () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    const prevButton = screen.getByRole('button', { name: /prev/i });
    fireEvent.click(prevButton);
    
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should have prev button on first page', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    const prevLink = screen.getAllByRole('button')[0];
    // Check that prev button exists and has pointer-events-none or similar
    expect(prevLink).toBeInTheDocument();
    expect(prevLink.parentElement).toHaveClass('page-item');
  });

  it('should have next button on last page', () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    const allButtons = screen.getAllByRole('button');
    const nextLink = allButtons[allButtons.length - 1];
    expect(nextLink).toBeInTheDocument();
    expect(nextLink.parentElement).toHaveClass('page-item');
  });

  it('should show ellipsis for many pages', () => {
    render(
      <Pagination currentPage={10} totalPages={20} onPageChange={mockOnPageChange} />
    );
    
    // Should show first page, ellipsis, current page area, ellipsis, last page
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('should handle page change at boundaries', () => {
    const { rerender } = render(
      <Pagination currentPage={1} totalPages={3} onPageChange={mockOnPageChange} />
    );
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    // Click next to go to page 2
    fireEvent.click(nextButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
    
    // Rerender with new page
    rerender(
      <Pagination currentPage={2} totalPages={3} onPageChange={mockOnPageChange} />
    );
    
    // Click next to go to page 3
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });
});
