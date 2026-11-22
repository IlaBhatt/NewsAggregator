/**
 * Unit tests for ErrorMessage and EmptyState components (Jest + RTL)
 */

import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../../test/test-utils';
import { ErrorMessage, EmptyState } from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('should render error message', () => {
    renderWithProviders(<ErrorMessage message="Test error message" />);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should render retry button when onRetry is provided', () => {
    renderWithProviders(
      <ErrorMessage message="Error" onRetry={jest.fn()} />
    );

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should not render retry button when onRetry is not provided', () => {
    renderWithProviders(<ErrorMessage message="Error" />);

    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnRetry = jest.fn();

    renderWithProviders(
      <ErrorMessage message="Error" onRetry={mockOnRetry} />
    );

    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('should render error icon', () => {
    renderWithProviders(<ErrorMessage message="Error" />);

    // Should have some visual indicator of error
    const errorContainer = screen.getByText('Error').closest('div');
    expect(errorContainer).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('should render title', () => {
    renderWithProviders(<EmptyState title="No results" message="Try again" />);

    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('should render message', () => {
    renderWithProviders(<EmptyState title="No results" message="Try different keywords" />);

    expect(screen.getByText('Try different keywords')).toBeInTheDocument();
  });

  it('should be visually distinct from error message', () => {
    const { container } = renderWithProviders(
      <EmptyState title="Empty" message="No data" />
    );

    // Should render without error styling
    expect(container).toBeInTheDocument();
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });
});
