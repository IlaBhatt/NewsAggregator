# News Aggregator Backend API

Production-ready news aggregation microservice with sentiment analysis, resilience patterns, and comprehensive caching.

## Features

- ✅ **NewsAPI Integration**: Real-time news from 70,000+ sources
- ✅ **Sentiment Analysis**: Lexicon-based sentiment scoring (AFINN approach)
- ✅ **Source Credibility**: Automated source reliability scoring
- ✅ **Circuit Breaker**: Prevents cascading failures
- ✅ **Intelligent Caching**: In-memory cache with TTL and stale-while-revalidate
- ✅ **Rate Limiting**: Protection against abuse
- ✅ **HATEOAS**: Hypermedia-driven API responses
- ✅ **Comprehensive Logging**: Winston-based structured logging
- ✅ **Security**: Helmet.js security headers, CORS, input validation

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Testing**: Jest + Supertest
- **Logging**: Winston
- **API Client**: Axios with circuit breaker

## Architecture

### Layered Architecture

```
┌───────────────────────┐
│   Controllers        │  ← HTTP Layer
├───────────────────────┤
│   Services           │  ← Business Logic
├───────────────────────┤
│   Repository         │  ← Data Access
├───────────────────────┤
│   Utils/Patterns     │  ← Cache, Circuit Breaker
└───────────────────────┘
```

### Design Patterns

1. **Repository Pattern**: `NewsApiClient` abstracts external API
2. **Singleton Pattern**: `Cache` single instance
3. **Circuit Breaker Pattern**: Resilience against upstream failures
4. **Strategy Pattern**: Sentiment analysis algorithms
5. **Decorator Pattern**: Caching layer around API calls

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- NewsAPI key (get from https://newsapi.org)

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your NewsAPI key
# NEWS_API_KEY=your_api_key_here
```

### Environment Variables

```env
# Server
PORT=8080
NODE_ENV=development

# NewsAPI
NEWS_API_KEY=your_newsapi_key_here
NEWS_API_BASE_URL=https://newsapi.org/v2

# Cache (15 minutes default)
CACHE_TTL_MINUTES=15

# Circuit Breaker
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT_MS=60000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Development

```bash
# Start dev server with hot reload
npm run dev

# Build TypeScript
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Type check
npm run type-check
```

### Production

```bash
# Build
npm run build

# Start production server
npm start
```

## API Documentation

### Base URL

```
http://localhost:8080/api/v1
```

### Endpoints

#### 1. Search News

**GET** `/news/search`

Search news articles with sentiment analysis.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |
| `sources` | string | No | Comma-separated source IDs |
| `from` | string | No | Start date (ISO 8601) |
| `to` | string | No | End date (ISO 8601) |
| `language` | string | No | Language code (default: en) |
| `sortBy` | string | No | relevancy, popularity, publishedAt |
| `pageSize` | number | No | Results per page (default: 20, max: 100) |
| `page` | number | No | Page number (default: 1) |

**Example Request:**

```bash
curl "http://localhost:8080/api/v1/news/search?q=technology&pageSize=10"
```

**Example Response:**

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
        "author": "John Doe",
        "title": "Amazing Tech Breakthrough",
        "description": "A revolutionary discovery...",
        "url": "https://example.com/article",
        "urlToImage": "https://example.com/image.jpg",
        "publishedAt": "2026-08-13T10:00:00Z",
        "content": "Full article content...",
        "sentiment": {
          "score": 0.75,
          "type": "positive",
          "confidence": 0.85
        },
        "credibility": {
          "score": 85,
          "tier": "high",
          "indicators": ["Well-known source", "Tier: high"]
        }
      }
    ],
    "totalResults": 1500,
    "page": 1,
    "pageSize": 10,
    "totalPages": 150
  },
  "metadata": {
    "timestamp": "2026-08-13T12:00:00Z",
    "version": "v1",
    "cached": false,
    "stale": false
  },
  "links": {
    "self": "/api/v1/news/search?q=technology&pageSize=10&page=1",
    "next": "/api/v1/news/search?q=technology&pageSize=10&page=2"
  }
}
```

#### 2. Get Top Headlines

**GET** `/news/headlines`

Get breaking news headlines.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `country` | string | No | Country code (default: us) |
| `category` | string | No | business, entertainment, general, health, science, sports, technology |

**Example Request:**

```bash
curl "http://localhost:8080/api/v1/news/headlines?country=us&category=technology"
```

#### 3. Health Check

**GET** `/health`

Get service health and statistics.

**Example Response:**

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

#### 4. Clear Cache (Admin)

**POST** `/admin/cache/clear`

Clear all cached data.

```bash
curl -X POST "http://localhost:8080/api/v1/admin/cache/clear"
```

## Resilience Patterns

### 1. Circuit Breaker

- **Threshold**: 5 consecutive failures
- **Timeout**: 60 seconds
- **Reset**: 30 seconds after opening

**States:**
- 🟢 **CLOSED**: Normal operation
- 🔴 **OPEN**: Blocking requests, using fallback
- 🟡 **HALF_OPEN**: Testing if service recovered

### 2. Cache Strategy

- **Pattern**: Cache-Aside with Stale-While-Revalidate
- **TTL**: 15 minutes (configurable)
- **Behavior**: Serves stale data during outages
- **Cleanup**: Automatic garbage collection every 30 minutes

### 3. Graceful Degradation

```
NewsAPI Available → Fresh Data
       ↓
NewsAPI Down → Cached Data (fresh)
       ↓
Cache Stale → Cached Data (stale) + warning
       ↓
No Cache → Mock Data + error notification
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- SentimentAnalyzer.test.ts
```

**Coverage Target**: >80% for all metrics

## Performance

- **Cached Response**: <100ms
- **API Call**: <2s (network dependent)
- **Circuit Breaker Timeout**: 5s
- **Rate Limit**: 100 requests per 15 minutes

## Security

- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation
- ✅ API key protection (environment variables)
- ✅ No sensitive data in logs

## License

MIT
