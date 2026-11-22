# High-Level Design (HLD)
## News Aggregator with Sentiment Analysis System

**Version**: 1.0  
**Date**: 2026-07-29  
**Status**: Design Document

---

## 1. Executive Summary

The News Aggregator with Sentiment Analysis is a resilient, microservice-based web application that aggregates news from external sources, performs sentiment analysis, and provides an intelligent user interface with conditional alerts and filtering capabilities.

### 1.1 Key Features
- Real-time news aggregation from NewsAPI
- AI-powered sentiment analysis (positive/negative/neutral)
- Intelligent caching with TTL-based invalidation
- Circuit breaker pattern for fault tolerance
- Conditional alerts based on content analysis
- Advanced filtering (date, source, sentiment)
- Offline mode with mock data
- HATEOAS-compliant REST API

---

## 2. System Architecture

### 2.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │           React Frontend (SPA)                           │     │
│  │  - Component-based UI                                    │     │
│  │  - State management (Context API / Redux)                │     │
│  │  - Client-side filtering & caching                       │     │
│  │  - Responsive design (mobile-first)                      │     │
│  └──────────────────────────────────────────────────────────┘     │
│                              │                                      │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ HTTPS/REST
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐     │
│  │           Express.js API Gateway                         │     │
│  │  - Request routing & validation                          │     │
│  │  - Rate limiting (per IP/user)                           │     │
│  │  - CORS handling                                         │     │
│  │  - Authentication/Authorization                          │     │
│  │  - Request/Response logging                              │     │
│  └──────────────────────────────────────────────────────────┘     │
│                              │                                      │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────┐        ┌──────────────────────┐          │
│  │  News Service        │        │  Sentiment Service   │          │
│  │  - Query handling    │───────▶│  - NLP analysis      │          │
│  │  - Data enrichment   │        │  - Classification    │          │
│  │  - Alert generation  │        │  - Score calculation │          │
│  └─────────┬────────────┘        └──────────────────────┘          │
│            │                                                        │
│            │                                                        │
│  ┌─────────▼────────────┐        ┌──────────────────────┐          │
│  │  Cache Manager       │        │  Circuit Breaker     │          │
│  │  - In-memory cache   │        │  - State management  │          │
│  │  - TTL management    │        │  - Failure tracking  │          │
│  │  - Stale-while-      │        │  - Auto-recovery     │          │
│  │    revalidate        │        │  - Metrics           │          │
│  └──────────────────────┘        └──────────────────────┘          │
│                                                                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     INTEGRATION LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐        ┌──────────────────────┐          │
│  │  NewsAPI Adapter     │        │  Mock Data Service   │          │
│  │  - HTTP client       │        │  - Sample articles   │          │
│  │  - Retry logic       │        │  - Offline support   │          │
│  │  - Error handling    │        │  - Testing data      │          │
│  └──────────────────────┘        └──────────────────────┘          │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │           NewsAPI (newsapi.org)                          │     │
│  │  - Article search                                        │     │
│  │  - Top headlines                                         │     │
│  │  - Source filtering                                      │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Architectural Style
- **Pattern**: Layered + Microservices
- **Communication**: RESTful HTTP/HTTPS
- **Data Flow**: Request-Response with async enrichment
- **Scalability**: Horizontal scaling ready

---

## 3. Component Design

### 3.1 Frontend Components

#### 3.1.1 React Application
```
src/
├── components/
│   ├── SearchBar/          # Search input with autocomplete
│   ├── NewsCard/           # Article display component
│   ├── FilterPanel/        # Date, source, sentiment filters
│   ├── AlertBanner/        # Conditional alerts display
│   ├── SentimentBadge/     # Visual sentiment indicator
│   └── OfflineToggle/      # Offline mode switch
├── contexts/
│   ├── NewsContext.js      # Global news state
│   └── ThemeContext.js     # UI theme management
├── hooks/
│   ├── useNews.js          # News fetching hook
│   ├── useCache.js         # Client-side caching
│   └── useFilters.js       # Filter state management
├── services/
│   └── api.js              # API client wrapper
└── utils/
    ├── sentimentColors.js  # Color mapping for sentiment
    └── dateFormatters.js   # Date display helpers
```

**Key Technologies**:
- React 18+ with Hooks
- Axios for HTTP requests
- React Router for navigation
- CSS Modules / Styled Components
- LocalStorage for offline mode persistence

### 3.2 Backend Services

#### 3.2.1 News Service
**Responsibilities**:
- Handle search queries from frontend
- Coordinate with cache and external APIs
- Enrich articles with metadata
- Generate conditional alerts
- Apply business logic

**Key Operations**:
```javascript
- searchNews(query, filters)
- getTopHeadlines(category, country)
- enrichArticleData(articles)
- generateAlerts(articles, sentiments)
- applySourceCredibility(articles)
```

#### 3.2.2 Sentiment Analysis Service
**Responsibilities**:
- Analyze article content sentiment
- Classify as positive/negative/neutral
- Calculate sentiment scores
- Detect sentiment patterns

**Algorithm Options**:
- VADER (Valence Aware Dictionary and sEntiment Reasoner)
- TextBlob for simplicity
- Hugging Face transformers for advanced analysis

**Output Format**:
```json
{
  "articleId": "123",
  "sentiment": "positive",
  "score": 0.78,
  "confidence": 0.92,
  "breakdown": {
    "positive": 0.78,
    "negative": 0.10,
    "neutral": 0.12
  }
}
```

#### 3.2.3 Cache Manager
**Technology**: In-Memory (Node.js Map) or Redis

**Features**:
- TTL-based expiration (15 minutes default)
- Stale-while-revalidate support
- Key generation strategy
- Size limits with LRU eviction

**Cache Key Strategy**:
```
Pattern: news:{query}:{filters}
Examples:
- news:AI:all
- news:technology:source=bbc&date=24h
- news:politics:sentiment=negative
```

#### 3.2.4 Circuit Breaker
**Implementation**: Opossum or custom implementation

**Configuration**:
```javascript
{
  timeout: 5000,              // 5s request timeout
  errorThresholdPercentage: 50,  // 50% error rate
  resetTimeout: 60000,        // 60s recovery window
  rollingCountTimeout: 10000, // 10s metrics window
  rollingCountBuckets: 10,    // Bucket count
  fallback: serveStalecache   // Fallback function
}
```

**States**:
- **CLOSED**: Normal operation, all requests pass
- **OPEN**: Fast-fail mode, serve stale cache
- **HALF-OPEN**: Test mode, single request allowed

---

## 4. Data Flow

### 4.1 Request Flow (Happy Path)

```
1. User enters search query → Frontend
2. Frontend → GET /api/v1/news?q={query}
3. API Gateway → Validate & route → News Service
4. News Service → Check Cache Manager
5. Cache MISS → News Service → Circuit Breaker
6. Circuit Breaker (CLOSED) → NewsAPI Adapter
7. NewsAPI Adapter → External NewsAPI
8. NewsAPI → Return articles → News Service
9. News Service → Sentiment Service (analyze)
10. Sentiment Service → Return sentiment data
11. News Service → Enrich + Generate alerts
12. News Service → Store in Cache (15min TTL)
13. News Service → Return response → Frontend
14. Frontend → Render with alerts & filters
```

### 4.2 Resilience Flow (API Failure)

```
1. User search → Frontend → API Gateway
2. News Service → Cache MISS
3. Circuit Breaker → NewsAPI (timeout/error)
4. Circuit Breaker → Record failure
5. Failure threshold exceeded → OPEN state
6. News Service → Fallback: Get stale cache
7. Return stale data + warning header
8. Frontend → Display with degraded mode banner
```

---

## 5. API Design

### 5.1 REST Endpoints

#### GET /api/v1/news
**Description**: Search news articles

**Query Parameters**:
```
q          (string, required)  - Search query
from       (date, optional)    - Start date (YYYY-MM-DD)
to         (date, optional)    - End date (YYYY-MM-DD)
sources    (string, optional)  - Comma-separated source IDs
language   (string, optional)  - Language code (en, es, fr...)
sortBy     (string, optional)  - relevancy, popularity, publishedAt
pageSize   (int, optional)     - Results per page (default: 20, max: 100)
page       (int, optional)     - Page number (default: 1)
offline    (boolean, optional) - Enable offline mode
```

**Response** (200 OK):
```json
{
  "status": "ok",
  "totalResults": 150,
  "articles": [
    {
      "id": "abc123",
      "source": {
        "id": "techcrunch",
        "name": "TechCrunch",
        "credibility": 0.89
      },
      "author": "John Doe",
      "title": "AI Breakthrough...",
      "description": "Scientists announce...",
      "url": "https://...",
      "urlToImage": "https://...",
      "publishedAt": "2026-07-29T10:30:00Z",
      "content": "Full article text...",
      "sentiment": {
        "classification": "positive",
        "score": 0.82,
        "confidence": 0.95
      },
      "enrichment": {
        "recencyScore": 0.98,
        "isBreaking": true,
        "topicDiversity": 0.65
      }
    }
  ],
  "alerts": [
    {
      "type": "info",
      "message": "High volume of recent articles (30% in last 2 hours)",
      "severity": "low"
    }
  ],
  "metadata": {
    "cache": "HIT",
    "responseTime": "45ms",
    "sentimentDistribution": {
      "positive": 0.35,
      "negative": 0.25,
      "neutral": 0.40
    }
  },
  "_links": {
    "self": "/api/v1/news?q=AI&page=1",
    "next": "/api/v1/news?q=AI&page=2",
    "filters": {
      "positive": "/api/v1/news?q=AI&sentiment=positive",
      "last24h": "/api/v1/news?q=AI&from=2026-07-28"
    }
  }
}
```

#### GET /api/v1/sources
**Description**: Get available news sources

**Response**:
```json
{
  "status": "ok",
  "sources": [
    {
      "id": "techcrunch",
      "name": "TechCrunch",
      "category": "technology",
      "language": "en",
      "country": "us",
      "credibility": 0.89
    }
  ]
}
```

#### GET /api/v1/health
**Description**: System health check

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-07-29T10:30:00Z",
  "services": {
    "newsAPI": {
      "status": "up",
      "circuitBreaker": "CLOSED",
      "latency": "250ms"
    },
    "sentiment": {
      "status": "up",
      "latency": "50ms"
    },
    "cache": {
      "status": "up",
      "size": "150MB",
      "hitRate": "78%"
    }
  }
}
```

---

## 6. Non-Functional Requirements

### 6.1 Performance
- **Response Time**: 
  - Cache hit: <100ms (P95)
  - Cache miss: <2s (P95)
  - Offline mode: <50ms (P95)
- **Throughput**: 100 concurrent users
- **Cache Hit Rate**: >70%

### 6.2 Reliability
- **Availability**: 99.5% uptime
- **Circuit Breaker**: Auto-recovery within 60s
- **Graceful Degradation**: Serve stale cache during outages
- **Error Rate**: <1% under normal load

### 6.3 Scalability
- **Horizontal Scaling**: Stateless API servers
- **Cache Scaling**: Redis cluster for distributed cache
- **Load Balancing**: Round-robin / least-connections

### 6.4 Security
- **API Keys**: Secure storage (environment variables)
- **HTTPS**: TLS 1.3 encryption
- **Rate Limiting**: 100 requests/hour per IP
- **Input Validation**: Query sanitization, XSS prevention
- **CORS**: Whitelist allowed origins

### 6.5 Observability
- **Logging**: Structured JSON logs (Winston/Bunyan)
- **Metrics**: Prometheus + Grafana
- **Tracing**: OpenTelemetry for distributed tracing
- **Monitoring**: Uptime, latency, error rates

---

## 7. Technology Stack

### 7.1 Frontend
| Component | Technology |
|-----------|------------|
| Framework | React 18+ |
| State Management | Context API / Redux Toolkit |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Styling | CSS Modules / Tailwind CSS |
| Build Tool | Vite / Create React App |
| Testing | Jest + React Testing Library |

### 7.2 Backend
| Component | Technology |
|-----------|------------|
| Runtime | Node.js 18+ LTS |
| Framework | Express.js 4.x |
| Sentiment Analysis | VADER / TextBlob / Hugging Face |
| Cache | In-Memory Map / Redis |
| Circuit Breaker | Opossum |
| HTTP Client | Axios |
| Validation | Joi / express-validator |
| Testing | Jest + Supertest |

### 7.3 DevOps
| Component | Technology |
|-----------|------------|
| Containerization | Docker |
| Orchestration | Docker Compose / Kubernetes |
| CI/CD | GitHub Actions / Jenkins |
| Monitoring | Prometheus + Grafana |
| Logging | Winston + ELK Stack |

---

## 8. Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                        │
│                   (Nginx / ALB)                         │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌───────────────┐
│  API Server 1 │         │  API Server 2 │
│  (Container)  │         │  (Container)  │
└───────┬───────┘         └───────┬───────┘
        │                         │
        └────────────┬────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │    Redis Cluster       │
        │   (Shared Cache)       │
        └────────────────────────┘
```

**Scaling Strategy**:
- Scale API servers horizontally behind load balancer
- Centralized cache (Redis) for consistency
- Stateless design for easy scaling

---

## 9. Resilience Patterns

### 9.1 Circuit Breaker
- Protects against cascading failures
- Fast-fail when external service is down
- Automatic recovery testing

### 9.2 Caching Strategy
- **Cache-Aside**: Load data on demand
- **TTL**: 15-minute expiration
- **Stale-While-Revalidate**: Serve stale during revalidation

### 9.3 Retry Logic
- Exponential backoff for transient failures
- Maximum 3 retry attempts
- Jitter to prevent thundering herd

### 9.4 Timeout Management
- NewsAPI: 5s timeout
- Sentiment analysis: 2s timeout
- Overall request: 10s timeout

---

## 10. Conditional Alerts

### 10.1 Alert Triggers

| Condition | Threshold | Alert Type | Message |
|-----------|-----------|------------|----------|
| Negative sentiment | >60% negative | Warning | "High volume of negative news - Content may be distressing" |
| Source dominance | Single source >50% | Info | "Results dominated by {source} - Consider diversifying" |
| Breaking news | >30% in last 2h | Info | "High volume of recent articles - Breaking news detected" |
| Low credibility | Avg credibility <0.5 | Warning | "Some sources may have low credibility" |
| High variance | Sentiment std dev >0.4 | Info | "Mixed sentiment detected - Controversial topic" |

### 10.2 Alert Severity Levels
- **Info**: Informational, no action required
- **Warning**: User should be aware, proceed with caution
- **Error**: System degradation, limited functionality

---

## 11. Security Considerations

### 11.1 API Key Management
- Store in environment variables (`.env`)
- Never commit to version control
- Rotate keys periodically
- Use secret management services (AWS Secrets Manager)

### 11.2 Input Validation
- Sanitize search queries (prevent injection)
- Validate all query parameters
- Limit query length (max 500 characters)
- Whitelist allowed characters

### 11.3 Rate Limiting
- Per-IP limits: 100 requests/hour
- Per-user limits: 500 requests/hour (authenticated)
- Burst allowance: 10 requests/minute
- Response: 429 Too Many Requests

---

## 12. Future Enhancements

### 12.1 Phase 2
- User authentication & personalization
- Saved searches & notifications
- Custom alert thresholds
- Export to PDF/email

### 12.2 Phase 3
- Real-time updates (WebSockets)
- Advanced NLP (topic extraction, entity recognition)
- Multi-language support
- Machine learning for credibility scoring

### 12.3 Phase 4
- Mobile apps (React Native)
- GraphQL API option
- Elasticsearch for advanced search
- A/B testing framework

---

## 13. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| NewsAPI rate limits | High | Medium | Caching, rate limit monitoring, paid tier upgrade |
| NewsAPI downtime | High | Low | Circuit breaker, stale cache, offline mode |
| Sentiment analysis latency | Medium | Medium | Async processing, caching, timeout limits |
| Cache memory exhaustion | Medium | Low | LRU eviction, size limits, Redis migration |
| Security vulnerabilities | High | Low | Input validation, security audits, dependency scanning |

---

## 14. Success Metrics

### 14.1 Technical KPIs
- API response time <2s (P95)
- Cache hit rate >70%
- Error rate <1%
- Uptime >99.5%

### 14.2 Business KPIs
- User engagement (searches per session)
- Retention rate (daily/weekly active users)
- Feature adoption (filter usage, offline mode)
- User satisfaction (NPS score)

---

## Appendix A: Glossary

- **Circuit Breaker**: Resilience pattern that prevents cascading failures
- **TTL**: Time To Live - Cache expiration duration
- **HATEOAS**: Hypermedia as the Engine of Application State
- **Sentiment Analysis**: NLP technique to determine emotional tone
- **Stale Cache**: Expired cached data served during degraded mode
- **LRU**: Least Recently Used - Cache eviction strategy

---

**Document Owner**: Engineering Team  
**Last Updated**: 2026-07-29  
**Version**: 1.0  
**Status**: Approved for Implementation ✅
