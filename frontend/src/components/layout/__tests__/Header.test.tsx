/**
 * Unit tests for Header component (Jest + RTL)
 */

import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../../../test/test-utils';
import { Header } from '../Header';

describe('Header', () => {
  it('should render app title', () => {
    renderWithProviders(<Header onMenuClick={jest.fn()} />);

    expect(screen.getByText(/news aggregator/i)).toBeInTheDocument();
  });

  it('should render menu button', () => {
    renderWithProviders(<Header onMenuClick={jest.fn()} />);

    const menuButton = screen.getByRole('button', { name: /menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('should call onMenuClick when menu button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnMenuClick = jest.fn();

    renderWithProviders(<Header onMenuClick={mockOnMenuClick} />);

    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    expect(mockOnMenuClick).toHaveBeenCalledTimes(1);
  });

  it('should have fixed positioning', () => {
    const { container } = renderWithProviders(<Header onMenuClick={jest.fn()} />);

    const header = container.querySelector('header');
    expect(header).toHaveClass('fixed');
  });

  it('should be accessible', () => {
    renderWithProviders(<Header onMenuClick={jest.fn()} />);

    // Header should have proper semantic HTML
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });
});
