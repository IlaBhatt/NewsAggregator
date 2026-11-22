/**
 * Test utilities for React components with Jest + RTL
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

/**
 * Create a new QueryClient for each test
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Suppress error logs in tests
    },
  });
}

/**
 * Custom render with providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  router?: boolean;
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { queryClient = createTestQueryClient(), router = false, ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    const content = (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    if (router) {
      return <BrowserRouter>{content}</BrowserRouter>;
    }

    return content;
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

/**
 * Mock article data for testing
 */
export const mockArticle = {
  id: 'test-article-1',
  title: 'Test Article Title',
  description: 'This is a test article description',
  source: 'Test Source',
  sentiment: 'positive' as const,
  credibilityScore: 85,
  publishedAt: '2026-09-20T10:00:00Z',
  url: 'https://example.com/article',
  imageUrl: 'https://example.com/image.jpg',
  author: 'Test Author',
};

/**
 * Mock enhanced article for API responses
 */
export const mockEnhancedArticle = {
  id: 'test-article-1',
  source: {
    id: 'test-source',
    name: 'Test Source',
  },
  author: 'Test Author',
  title: 'Test Article Title',
  description: 'This is a test article description',
  url: 'https://example.com/article',
  urlToImage: 'https://example.com/image.jpg',
  publishedAt: '2026-09-20T10:00:00Z',
  content: 'Full article content here',
  sentiment: {
    score: 0.8,
    type: 'positive' as const,
    confidence: 0.95,
  },
  credibility: {
    score: 85,
    tier: 'high' as const,
    indicators: ['verified', 'reputable'],
  },
};

/**
 * Mock API response
 */
export const mockApiResponse = {
  status: 'success' as const,
  data: {
    articles: [mockEnhancedArticle],
    totalResults: 1,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  },
  metadata: {
    timestamp: '2026-09-20T10:00:00Z',
    version: 'v1',
    cached: false,
  },
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { userEvent };
