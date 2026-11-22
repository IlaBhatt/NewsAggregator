/**
 * Unit tests for ActiveFilters component (Jest + RTL)
 */

import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../../test/test-utils';
import { ActiveFilters } from '../ActiveFilters';
import type { NewsFilters } from '../../hooks/useFilters';

describe('ActiveFilters', () => {
  const defaultFilters: NewsFilters = {
    dateRange: '24h',
    sources: ['all'],
    sentiments: ['positive', 'neutral', 'negative'],
    sortBy: 'latest',
  };

  it('should not render when all filters are at defaults', () => {
    const { container } = renderWithProviders(
      <ActiveFilters filters={defaultFilters} onRemoveFilter={jest.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render when date range is not default', () => {
    const filters = { ...defaultFilters, dateRange: '7d' as const };

    renderWithProviders(
      <ActiveFilters filters={filters} onRemoveFilter={jest.fn()} />
    );

    expect(screen.getByText('Active filters:')).toBeInTheDocument();
    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
  });

  it('should render when specific sources are selected', () => {
    const filters = { ...defaultFilters, sources: ['bbc', 'cnn'] };

    renderWithProviders(
      <ActiveFilters filters={filters} onRemoveFilter={jest.fn()} />
    );

    expect(screen.getByText('BBC')).toBeInTheDocument();
    expect(screen.getByText('CNN')).toBeInTheDocument();
  });

  it('should render when sentiments are filtered', () => {
    const filters = { ...defaultFilters, sentiments: ['positive'] };

    renderWithProviders(
      <ActiveFilters filters={filters} onRemoveFilter={jest.fn()} />
    );

    expect(screen.getByText('Positive')).toBeInTheDocument();
  });

  it('should render when sort by is not default', () => {
    const filters = { ...defaultFilters, sortBy: 'popular' as const };

    renderWithProviders(
      <ActiveFilters filters={filters} onRemoveFilter={jest.fn()} />
    );

    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('should call onRemoveFilter when clicking remove button', async () => {
    const user = userEvent.setup();
    const mockOnRemoveFilter = jest.fn();
    const filters = { ...defaultFilters, dateRange: '7d' as const };

    renderWithProviders(
      <ActiveFilters filters={filters} onRemoveFilter={mockOnRemoveFilter} />
    );

    const removeButton = screen.getByLabelText(/remove.*7 days/i);
    await user.click(removeButton);

    expect(mockOnRemoveFilter).toHaveBeenCalledWith('dateRange');
  });

  it('should call onRemoveFilter with value for source filter', async () => {
    const user = userEvent.setup();
    const mockOnRemoveFilter = jest.fn();
    const filters = { ...defaultFilters, sources: ['bbc'] };

    renderWithProviders(
      <ActiveFilters filters={filters} onRemoveFilter={mockOnRemoveFilter} />
    );

    const removeButton = screen.getByLabelText(/remove.*bbc/i);
    await user.click(removeButton);

    expect(mockOnRemoveFilter).toHaveBeenCalledWith('sources', 'bbc');
  });

  it('should render multiple active filters', () => {
    const filters: NewsFilters = {
      dateRange: '30d',
      sources: ['bbc', 'cnn'],
      sentiments: ['positive'],
      sortBy: 'popular',
    };

    renderWithProviders(
      <ActiveFilters filters={filters} onRemoveFilter={jest.fn()} />
    );

    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    expect(screen.getByText('BBC')).toBeInTheDocument();
    expect(screen.getByText('CNN')).toBeInTheDocument();
    expect(screen.getByText('Positive')).toBeInTheDocument();
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });
});
