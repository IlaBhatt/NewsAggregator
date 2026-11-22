/**
 * Unit tests for SearchBar component (Jest + RTL)
 */

import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent } from '../../test/test-utils';
import { SearchBar } from '../SearchBar';

describe('SearchBar', () => {
  it('should render with default placeholder', () => {
    renderWithProviders(<SearchBar />);

    const input = screen.getByPlaceholderText('Search news articles...');
    expect(input).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    renderWithProviders(<SearchBar placeholder="Custom placeholder" />);

    const input = screen.getByPlaceholderText('Custom placeholder');
    expect(input).toBeInTheDocument();
  });

  it('should render search button', () => {
    renderWithProviders(<SearchBar />);

    const button = screen.getByRole('button', { name: /search/i });
    expect(button).toBeInTheDocument();
  });

  it('should update input value when typing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SearchBar />);

    const input = screen.getByPlaceholderText('Search news articles...');

    await user.type(input, 'AI technology');

    expect(input).toHaveValue('AI technology');
  });

  it('should call onSearch when form is submitted', async () => {
    const user = userEvent.setup();
    const mockOnSearch = jest.fn();

    renderWithProviders(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search news articles...');
    const button = screen.getByRole('button', { name: /search/i });

    await user.type(input, 'test query');
    await user.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('test query');
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it('should call onSearch when Enter is pressed', async () => {
    const user = userEvent.setup();
    const mockOnSearch = jest.fn();

    renderWithProviders(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search news articles...');

    await user.type(input, 'test query{Enter}');

    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('should call onSearch with empty string if no value', async () => {
    const user = userEvent.setup();
    const mockOnSearch = jest.fn();

    renderWithProviders(<SearchBar onSearch={mockOnSearch} />);

    const button = screen.getByRole('button', { name: /search/i });
    await user.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('should be accessible', () => {
    renderWithProviders(<SearchBar />);

    const input = screen.getByLabelText('Search news');
    expect(input).toBeInTheDocument();
  });
});
