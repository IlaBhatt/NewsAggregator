import axios, { AxiosError } from 'axios';
import type {
  ApiResponse,
  PaginatedArticles,
  SearchParams,
  HeadlinesParams,
} from '../types';

const API_BASE_URL = 'http://localhost:8080';
const API_VERSION = 'v1';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error('[API Response Error]', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as ApiResponse<never> | undefined;

    if (data?.error) {
      throw new ApiError(
        data.error.code,
        data.error.message,
        status
      );
    }

    // Network or timeout error
    if (!error.response) {
      throw new ApiError(
        'NETWORK_ERROR',
        'Unable to connect to the server. Please check your connection.',
        undefined
      );
    }

    // Generic HTTP error
    throw new ApiError(
      `HTTP_${status}`,
      error.message,
      status
    );
  }

  // Unknown error
  throw new ApiError(
    'UNKNOWN_ERROR',
    'An unexpected error occurred',
    undefined
  );
}

export const newsApi = {
  /**
   * Search news articles
   * GET /api/v1/news/search
   */
  async searchNews(
    params: SearchParams
  ): Promise<ApiResponse<PaginatedArticles>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedArticles>>(
        '/news/search',
        { params }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get top headlines
   * GET /api/v1/news/headlines
   */
  async getHeadlines(
    params?: HeadlinesParams
  ): Promise<ApiResponse<PaginatedArticles>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedArticles>>(
        '/news/headlines',
        { params }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get API health status
   * GET /api/v1/health
   */
  async getHealth(): Promise<ApiResponse<unknown>> {
    try {
      const response = await apiClient.get<ApiResponse<unknown>>('/health');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export { apiClient };
