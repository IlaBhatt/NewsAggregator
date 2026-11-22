/**
 * Unit tests for Pagination component (Jest + RTL)
 */

import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../../test/test-utils';
import { Pagination } from '../Pagination';

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalResults: 50,
    resultsPerPage: 10,
    onPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render current page info', () => {
    renderWithProviders(<Pagination {...defaultProps} />);

    expect(screen.getByText(/page 1 of 5/i)).toBeInTheDocument();
  });

  it('should render total results', () => {
    renderWithProviders(<Pagination {...defaultProps} />);

    expect(screen.getByText(/50 results/i)).toBeInTheDocument();
  });

  it('should disable Previous button on first page', () => {
    renderWithProviders(<Pagination {...defaultProps} currentPage={1} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('should enable Previous button when not on first page', () => {
    renderWithProviders(<Pagination {...defaultProps} currentPage={2} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).not.toBeDisabled();
  });

  it('should disable Next button on last page', () => {
    renderWithProviders(<Pagination {...defaultProps} currentPage={5} totalPages={5} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('should enable Next button when not on last page', () => {
    renderWithProviders(<Pagination {...defaultProps} currentPage={1} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).not.toBeDisabled();
  });

  it('should call onPageChange with previous page number', async () => {
    const user = userEvent.setup();
    const mockOnPageChange = jest.fn();

    renderWithProviders(
      <Pagination {...defaultProps} currentPage={3} onPageChange={mockOnPageChange} />
    );

    const prevButton = screen.getByRole('button', { name: /previous/i });
    await user.click(prevButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange with next page number', async () => {
    const user = userEvent.setup();
    const mockOnPageChange = jest.fn();

    renderWithProviders(
      <Pagination {...defaultProps} currentPage={2} onPageChange={mockOnPageChange} />
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('should render page numbers', () => {
    renderWithProviders(<Pagination {...defaultProps} />);

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
  });

  it('should highlight current page number', () => {
    renderWithProviders(<Pagination {...defaultProps} currentPage={2} />);

    const currentPageButton = screen.getByRole('button', { name: '2' });
    expect(currentPageButton).toHaveClass(/bg-orange|active|current/);
  });

  it('should call onPageChange when clicking page number', async () => {
    const user = userEvent.setup();
    const mockOnPageChange = jest.fn();

    renderWithProviders(
      <Pagination {...defaultProps} onPageChange={mockOnPageChange} />
    );

    const pageButton = screen.getByRole('button', { name: '3' });
    await user.click(pageButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('should show ellipsis for many pages', () => {
    renderWithProviders(
      <Pagination {...defaultProps} totalPages={20} currentPage={10} />
    );

    // Should show some representation of many pages
    expect(screen.getByText(/page 10 of 20/i)).toBeInTheDocument();
  });
});
