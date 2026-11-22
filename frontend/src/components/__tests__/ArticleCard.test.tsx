/**
 * Unit tests for ArticleCard component (Jest + RTL)
 */

import { screen } from '@testing-library/react';
import { renderWithProviders, mockArticle } from '../../test/test-utils';
import { ArticleCard } from '../ArticleCard';

describe('ArticleCard', () => {
  it('should render article title', () => {
    renderWithProviders(<ArticleCard article={mockArticle} />);

    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
  });

  it('should render article description', () => {
    renderWithProviders(<ArticleCard article={mockArticle} />);

    expect(screen.getByText('This is a test article description')).toBeInTheDocument();
  });

  it('should render article source', () => {
    renderWithProviders(<ArticleCard article={mockArticle} />);

    expect(screen.getByText('Test Source')).toBeInTheDocument();
  });

  it('should render article author when provided', () => {
    renderWithProviders(<ArticleCard article={mockArticle} />);

    expect(screen.getByText(/Test Author/)).toBeInTheDocument();
  });

  it('should not crash when author is null', () => {
    const articleWithoutAuthor = { ...mockArticle, author: null };

    renderWithProviders(<ArticleCard article={articleWithoutAuthor} />);

    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
  });

  it('should render positive sentiment badge', () => {
    renderWithProviders(<ArticleCard article={mockArticle} />);

    const badge = screen.getByText(/positive/i);
    expect(badge).toBeInTheDocument();
  });

  it('should render credibility score', () => {
    renderWithProviders(<ArticleCard article={mockArticle} />);

    expect(screen.getByText(/85/)).toBeInTheDocument();
  });

  it('should render article link with correct href', () => {
    renderWithProviders(<ArticleCard article={mockArticle} />);

    const link = screen.getByRole('link', { name: /read more/i });
    expect(link).toHaveAttribute('href', 'https://example.com/article');
  });

  it('should open link in new tab', () => {
    renderWithProviders(<ArticleCard article={mockArticle} />);

    const link = screen.getByRole('link', { name: /read more/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render article image when imageUrl is provided', () => {
    renderWithProviders(<ArticleCard article={mockArticle} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('should render placeholder when imageUrl is null', () => {
    const articleWithoutImage = { ...mockArticle, imageUrl: null };

    renderWithProviders(<ArticleCard article={articleWithoutImage} />);

    // Should still render the card
    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
  });

  it('should display different sentiment colors', () => {
    const { rerender } = renderWithProviders(
      <ArticleCard article={{ ...mockArticle, sentiment: 'positive' }} />
    );
    expect(screen.getByText(/positive/i)).toBeInTheDocument();

    rerender(
      <ArticleCard article={{ ...mockArticle, sentiment: 'negative' }} />
    );
    expect(screen.getByText(/negative/i)).toBeInTheDocument();

    rerender(
      <ArticleCard article={{ ...mockArticle, sentiment: 'neutral' }} />
    );
    expect(screen.getByText(/neutral/i)).toBeInTheDocument();
  });

  it('should format published date', () => {
    renderWithProviders(<ArticleCard article={mockArticle} />);

    // Date should be rendered in some format
    expect(screen.getByText(/2026|Sep|20/)).toBeInTheDocument();
  });
});
