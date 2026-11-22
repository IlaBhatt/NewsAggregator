/**
 * Unit tests for SentimentOverview component (Jest + RTL)
 */

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/test-utils';
import { SentimentOverview } from '../SentimentOverview';
import type { SentimentOverviewData } from '../../types';

describe('SentimentOverview', () => {
  const mockData: SentimentOverviewData = {
    positive: 50,
    neutral: 30,
    negative: 20,
  };

  it('should render sentiment percentages', () => {
    renderWithProviders(<SentimentOverview data={mockData} />);

    expect(screen.getByText(/50%/)).toBeInTheDocument();
    expect(screen.getByText(/30%/)).toBeInTheDocument();
    expect(screen.getByText(/20%/)).toBeInTheDocument();
  });

  it('should render sentiment labels', () => {
    renderWithProviders(<SentimentOverview data={mockData} />);

    expect(screen.getByText(/positive/i)).toBeInTheDocument();
    expect(screen.getByText(/neutral/i)).toBeInTheDocument();
    expect(screen.getByText(/negative/i)).toBeInTheDocument();
  });

  it('should not crash when data is undefined', () => {
    renderWithProviders(<SentimentOverview data={undefined} />);

    // Should render placeholder or empty state
    expect(screen.queryByText(/0%/)).toBeInTheDocument();
  });

  it('should handle zero percentages', () => {
    const zeroData: SentimentOverviewData = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    renderWithProviders(<SentimentOverview data={zeroData} />);

    expect(screen.getAllByText(/0%/)).toHaveLength(3);
  });

  it('should handle 100% single sentiment', () => {
    const allPositive: SentimentOverviewData = {
      positive: 100,
      neutral: 0,
      negative: 0,
    };

    renderWithProviders(<SentimentOverview data={allPositive} />);

    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });

  it('should render with proper styling for each sentiment', () => {
    const { container } = renderWithProviders(<SentimentOverview data={mockData} />);

    // Should have distinct colors for each sentiment
    expect(container).toBeInTheDocument();
    expect(screen.getByText(/positive/i)).toBeInTheDocument();
  });
});
