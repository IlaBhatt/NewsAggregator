# News Aggregator API Specification

**Version**: 1.0.0  
**Base URL**: `http://localhost:8080/api/v1`  
**Protocol**: HTTP/HTTPS  
**Format**: JSON

## Table of Contents

- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Search News](#1-search-news)
  - [Get Top Headlines](#2-get-top-headlines)
  - [Health Check](#3-health-check)
  - [Clear Cache](#4-clear-cache-admin)
- [Response Schema](#response-schema)
- [Status Codes](#status-codes)

---

## Authentication

Currently, the API does not require authentication for public endpoints. Admin endpoints may require authentication in production.

---

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

  **Rate Limit Exceeded Response** (429):
```json
{
  "status": "error",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later"
  }
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  },
  "metadata": {
    "timestamp": "2026-08-13T12:00:00Z",
    "version": "v1",
    "cached": false
  }
}
```

---

## Endpoints

### 1. Search News

Search news articles with sentiment analysis and credibility scoring.

**Endpoint**: `GET /news/search`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | Yes | - | Search query (e.g., "technology", "climate change") |
| `sources` | string | No | - | Comma-separated source IDs (e.g., "bbc-news,cnn") |
| `from` | string | No | - | Start date in ISO 8601 format (e.g., "2026-08-01T00:00:00Z") |
| `to` | string | No | - | End date in ISO 8601 format |
| `language` | string | No | `en` | Language code (e.g., "en", "es", "fr") |
| `sortBy` | string | No | `publishedAt` | Sort order: `relevancy`, `popularity`, `publishedAt` |
| `pageSize` | number | No | `20` | Results per page (1-100) |
| `page` | number | No | `1` | Page number (1-based) |

#### Example Request

```bash
curl "http://localhost:8080/api/v1/news/search?q=artificial+intelligence&pageSize=5&sortBy=publishedAt"
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "articles": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "source": {
          "id": "techcrunch",
          "name": "TechCrunch"
        },
        "author": "Jane Doe",
        "title": "AI Breakthrough in Medical Diagnostics",
        "description": "Revolutionary AI system achieves 95% accuracy in early cancer detection.",
        "url": "https://techcrunch.com/2026/08/13/ai-medical-breakthrough",
        "urlToImage": "https://techcrunch.com/images/ai-medical.jpg",
        "publishedAt": "2026-08-13T10:30:00Z",
        "content": "Full article content...",
        "sentiment": {
          "score": 0.65,
          "type": "positive",
          "confidence": 0.82
        },
        "credibility": {
          "score": 85,
          "tier": "high",
          "indicators": [
            "Well-known source",
            "Tier: high",
            "Secure connection"
          ]
        }
      }
    ],
    "totalResults": 1247,
    "page": 1,
    "pageSize": 5,
    "totalPages": 250
  },
  "metadata": {
    "timestamp": "2026-08-13T12:00:00Z",
    "version": "v1",
    "cached": false,
    "stale": false
  },
  "links": {
    "self": "/api/v1/news/search?q=artificial+intelligence&pageSize=5&page=1",
    "next": "/api/v1/news/search?q=artificial+intelligence&pageSize=5&page=2"
  }
}
```

#### Error Responses

**400 Bad Request** - Missing required parameter:
```json
{
  "status": "error",
  "error": {
    "code": "BAD_REQUEST",
    "message": "Query parameter 'q' is required"
  },
  "metadata": {
    "timestamp": "2026-08-13T12:00:00Z",
    "version": "v1",
    "cached": false
  }
}
```

---

### 2. Get Top Headlines

Retrieve top breaking news headlines by country and category.

**Endpoint**: `GET /news/headlines`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `country` | string | No | `us` | Country code (e.g., "us", "gb", "ca") |
| `category` | string | No | - | Category: `business`, `entertainment`, `general`, `health`, `science`, `sports`, `technology` |

#### Example Request

```bash
curl "http://localhost:8080/api/v1/news/headlines?country=us&category=technology"
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "data": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "source": {
        "id": "wired",
        "name": "Wired"
      },
      "author": "John Smith",
      "title": "Quantum Computing Reaches New Milestone",
      "description": "Scientists achieve quantum advantage in real-world application.",
      "url": "https://wired.com/quantum-milestone",
      "urlToImage": "https://wired.com/images/quantum.jpg",
      "publishedAt": "2026-08-13T11:45:00Z",
      "content": null,
      "sentiment": {
        "score": 0.72,
        "type": "positive",
        "confidence": 0.88
      },
      "credibility": {
        "score": 82,
        "tier": "high",
        "indicators": [
          "Well-known source",
          "Tier: high"
        ]
      }
    }
  ],
  "metadata": {
    "timestamp": "2026-08-13T12:00:00Z",
    "version": "v1",
    "cached": true,
    "stale": false
  }
}
```

---

### 3. Health Check

Get service health status and statistics.

**Endpoint**: `GET /health`

#### Example Request

```bash
curl "http://localhost:8080/api/v1/health"
```

#### Success Response (200 OK)

```json
{
  "status": "healthy",
  "timestamp": "2026-08-13T12:00:00Z",
  "version": "v1",
  "cache": {
    "size": 15,
    "entries": 15
  },
  "circuitBreaker": {
    "state": "closed",
    "failureCount": 0
  }
}
```

**Circuit Breaker States**:
- `closed`: Normal operation
- `open`: Service degraded, using fallback
- `half_open`: Testing recovery

---

### 4. Clear Cache (Admin)

Clear all cached data.

**Endpoint**: `POST /admin/cache/clear`

**Note**: Should be protected with authentication in production.

#### Example Request

```bash
curl -X POST "http://localhost:8080/api/v1/admin/cache/clear"
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Cache cleared successfully",
  "timestamp": "2026-08-13T12:00:00Z"
}
```

---

## Response Schema

### Article Object

```typescript
interface Article {
  id: string;                    // UUID
  source: {
    id: string | null;           // Source identifier
    name: string;                // Source name
  };
  author: string | null;         // Article author
  title: string;                 // Article title
  description: string | null;    // Brief description
  url: string;                   // Article URL
  urlToImage: string | null;     // Image URL
  publishedAt: string;           // ISO 8601 timestamp
  content: string | null;        // Article content
  sentiment: SentimentResult;    // Sentiment analysis
  credibility: SourceCredibility; // Source credibility
}
```

### Sentiment Result

```typescript
interface SentimentResult {
  score: number;        // -1 to 1 (negative to positive)
  type: 'positive' | 'neutral' | 'negative';
  confidence: number;   // 0 to 1
}
```

**Classification**:
- **Positive**: score > 0.1
- **Neutral**: -0.1 ≤ score ≤ 0.1
- **Negative**: score < -0.1

### Source Credibility

```typescript
interface SourceCredibility {
  score: number;              // 0 to 100
  tier: 'high' | 'medium' | 'low';
  indicators: string[];       // Credibility factors
}
```

**Tiers**:
- **High**: score ≥ 70 (e.g., BBC, Reuters, AP)
- **Medium**: 50 ≤ score < 70 (e.g., CNN, Fox News)
- **Low**: score < 50 (Unknown or unreliable sources)

---

## Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 400 | Bad Request | Invalid parameters |
| 404 | Not Found | Endpoint not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Circuit breaker open |

---

## Metadata Fields

All successful responses include metadata:

```typescript
interface Metadata {
  timestamp: string;   // Response timestamp (ISO 8601)
  version: string;     // API version
  cached: boolean;     // True if from cache
  stale?: boolean;     // True if stale cache data
}
```

**Cache Indicators**:
- `cached: false, stale: false` - Fresh from API
- `cached: true, stale: false` - Fresh from cache (< 15 min old)
- `cached: true, stale: true` - Stale cache (served during API failure)

---

## HATEOAS Links

Paginated responses include hypermedia links:

```typescript
interface Links {
  self: string;   // Current page URL
  next?: string;  // Next page URL (if available)
  prev?: string;  // Previous page URL (if available)
}
```

---

## Examples

### Search by Date Range

```bash
curl "http://localhost:8080/api/v1/news/search?q=climate&from=2026-08-01T00:00:00Z&to=2026-08-13T23:59:59Z"
```

### Search Specific Sources

```bash
curl "http://localhost:8080/api/v1/news/search?q=politics&sources=bbc-news,reuters,associated-press"
```

### Multilingual Search

```bash
curl "http://localhost:8080/api/v1/news/search?q=tecnolog%C3%ADa&language=es"
```

---

**Last Updated**: 2026-08-13  
**Maintained By**: News Aggregator Team
