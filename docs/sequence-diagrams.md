# Sequence Diagrams - News Aggregator with Sentiment Analysis

**Project**: News Aggregator with Sentiment Analysis Microservice  
**Created**: 2026-07-24  
**Purpose**: Visual documentation of system interactions and resilience patterns

---

## Overview

This document contains sequence diagrams for all critical user flows and resilience scenarios. These diagrams illustrate the interactions between:
- **User/Client**: Web browser or API client
- **Frontend**: React application
- **Backend API**: Express.js REST service
- **Cache**: In-memory cache with TTL
- **Circuit Breaker**: Resilience component
- **NewsAPI**: External news data source
- **Sentiment Analyzer**: Internal sentiment analysis service

---

## Diagram 1: Happy Path - News Search (Cache Miss)

**Scenario**: User searches for news, cache is empty or expired, NewsAPI responds successfully.

```
┌──────┐         ┌──────────┐         ┌─────────────┐         ┌───────┐         ┌─────────┐         ┌────────────────────┐
│ User │         │ Frontend │         │ Backend API │         │ Cache │         │ NewsAPI │         │ Sentiment Analyzer │
└──┬───┘         └────┬─────┘         └──────┬──────┘         └───┬───┘         └────┬────┘         └─────────┬──────────┘
   │                  │                       │                    │                  │                        │
   │ 1. Enter search  │                       │                    │                  │                        │
   │   query "AI"     │                       │                    │                  │                        │
   ├─────────────────>│                       │                    │                  │                        │
   │                  │                       │                    │                  │                        │
   │                  │ 2. GET /api/v1/news?q=AI                   │                  │                        │
   │                  ├──────────────────────>│                    │                  │                        │
   │                  │                       │                    │                  │                        │
   │                  │                       │ 3. Check cache     │                  │                        │
   │                  │                       │   key: "news:AI"   │                  │                        │
   │                  │                       ├───────────────────>│                  │                        │
   │                  │                       │                    │                  │                        │
   │                  │                       │ 4. Cache MISS      │                  │                        │
   │                  │                       │<───────────────────┤                  │                        │
   │                  │                       │                    │                  │                        │
   │                  │                       │ 5. Fetch news from NewsAPI            │                        │
   │                  │                       │   GET /v2/everything?q=AI&apiKey=XXX  │                        │
   │                  │                       ├──────────────────────────────────────>│                        │
   │                  │                       │                    │                  │                        │
   │                  │                       │ 6. News articles (JSON)               │                        │
   │                  │                       │<──────────────────────────────────────┤                        │
   │                  │                       │                    │                  │                        │
   │                  │                       │ 7. Analyze sentiment for each article │                        │
   │                  │                       ├───────────────────────────────────────────────────────────────>│
   │                  │                       │                    │                  │                        │
   │                  │                       │ 8. Sentiment scores (positive/negative/neutral)                │
   │                  │                       │<───────────────────────────────────────────────────────────────┤
   │                  │                       │                    │                  │                        │
   │                  │                       │ 9. Enrich articles with:               │                        │
   │                  │                       │    - Sentiment classification          │                        │
   │                  │                       │    - Source credibility                │                        │
   │                  │                       │    - Recency ranking                   │                        │
   │                  │                       │    - Diversity analysis                │                        │
   │                  │                       │                    │                  │                        │
   │                  │                       │ 10. Store in cache │                  │                        │
   │                  │                       │    (TTL: 15 min)   │                  │                        │
   │                  │                       ├───────────────────>│                  │                        │
   │                  │                       │                    │                  │                        │
   │                  │                       │ 11. Cache stored   │                  │                        │
   │                  │                       │<───────────────────┤                  │                        │
   │                  │                       │                    │                  │                        │
   │                  │ 12. Response with:    │                    │                  │                        │
   │                  │     - Articles        │                    │                  │                        │
   │                  │     - Sentiment data  │                    │                  │                        │
   │                  │     - Alerts (if any) │                    │                  │                        │
   │                  │     - HATEOAS links   │                    │                  │                        │
   │                  │<──────────────────────┤                    │                  │                        │
   │                  │                       │                    │                  │                        │
   │ 13. Display news │                       │                    │                  │                        │
   │    with alerts   │                       │                    │                  │                        │
   │<─────────────────┤                       │                    │                  │                        │
   │                  │                       │                    │                  │                        │
```

**Key Points**:
- Cache miss triggers NewsAPI call
- Sentiment analysis performed on fresh data
- Results cached for 15 minutes
- Response includes conditional alerts
- HATEOAS links for pagination/filtering

---

## Diagram 2: Cache Hit Scenario

**Scenario**: User searches for news, cache contains valid (non-expired) data.

```
┌──────┐         ┌──────────┐         ┌─────────────┐         ┌───────┐
│ User │         │ Frontend │         │ Backend API │         │ Cache │
└──┬───┘         └────┬─────┘         └──────┬──────┘         └───┬───┘
   │                  │                       │                    │
   │ 1. Enter search  │                       │                    │
   │   query "AI"     │                       │                    │
   ├─────────────────>│                       │                    │
   │                  │                       │                    │
   │                  │ 2. GET /api/v1/news?q=AI                   │
   │                  ├──────────────────────>│                    │
   │                  │                       │                    │
   │                  │                       │ 3. Check cache     │
   │                  │                       │   key: "news:AI"   │
   │                  │                       ├───────────────────>│
   │                  │                       │                    │
   │                  │                       │ 4. Cache HIT       │
   │                  │                       │    (TTL valid)     │
   │                  │                       │    Return cached   │
   │                  │                       │    articles with   │
   │                  │                       │    sentiment data  │
   │                  │                       │<───────────────────┤
   │                  │                       │                    │
   │                  │ 5. Response (cached)  │                    │
   │                  │    - Articles         │                    │
   │                  │    - Sentiment data   │                    │
   │                  │    - Alerts           │                    │
   │                  │    - HATEOAS links    │                    │
   │                  │    - X-Cache: HIT     │                    │
   │                  │<──────────────────────┤                    │
   │                  │                       │                    │
   │ 6. Display news  │                       │                    │
   │    (fast!)       │                       │                    │
   │<─────────────────┤                       │                    │
   │                  │                       │                    │
```

**Key Points**:
- No external API call needed
- Sub-100ms response time
- X-Cache header indicates cache hit
- Reduces NewsAPI rate limit usage
- Improves user experience

---

## Diagram 3: Circuit Breaker - NewsAPI Failure (Stale Cache)

**Scenario**: NewsAPI is down/slow, circuit breaker opens, system serves stale cached data.

```
┌──────┐    ┌──────────┐    ┌─────────────┐    ┌─────────────────┐    ┌───────┐    ┌─────────┐
│ User │    │ Frontend │    │ Backend API │    │ Circuit Breaker │    │ Cache │    │ NewsAPI │
└──┬───┘    └────┬─────┘    └──────┬──────┘    └────────┬────────┘    └───┬───┘    └────┬────┘
   │             │                  │                    │                 │             │
   │ 1. Search   │                  │                    │                 │             │
   │   "AI"      │                  │                    │                 │             │
   ├────────────>│                  │                    │                 │             │
   │             │                  │                    │                 │             │
   │             │ 2. GET /api/v1/news?q=AI              │                 │             │
   │             ├─────────────────>│                    │                 │             │
   │             │                  │                    │                 │             │
   │             │                  │ 3. Check cache     │                 │             │
   │             │                  ├────────────────────────────────────>│             │
   │             │                  │                    │                 │             │
   │             │                  │ 4. Cache MISS or EXPIRED             │             │
   │             │                  │<────────────────────────────────────┤             │
   │             │                  │                    │                 │             │
   │             │                  │ 5. Check circuit   │                 │             │
   │             │                  │    breaker state   │                 │             │
   │             │                  ├───────────────────>│                 │             │
   │             │                  │                    │                 │             │
   │             │                  │ 6. State: CLOSED   │                 │             │
   │             │                  │    (allow request) │                 │             │
   │             │                  │<───────────────────┤                 │             │
   │             │                  │                    │                 │             │
   │             │                  │ 7. Call NewsAPI    │                 │             │
   │             │                  ├────────────────────────────────────────────────────>│
   │             │                  │                    │                 │             │
   │             │                  │ 8. TIMEOUT / ERROR │                 │             │
   │             │                  │    (5 seconds)     │                 │             │
   │             │                  │<────────────────────────────────────────────────────┤
   │             │                  │                    │                 │             │
   │             │                  │ 9. Record failure  │                 │             │
   │             │                  ├───────────────────>│                 │             │
   │             │                  │                    │                 │             │
   │             │                  │ 10. Failure count  │                 │             │
   │             │                  │     exceeds        │                 │             │
   │             │                  │     threshold (5)  │                 │             │
   │             │                  │     → OPEN circuit │                 │             │
   │             │                  │<───────────────────┤                 │             │
   │             │                  │                    │                 │             │
   │             │                  │ 11. Fallback: Get stale cache        │             │
   │             │                  ├────────────────────────────────────>│             │
   │             │                  │                    │                 │             │
   │             │                  │ 12. Return stale data (if available) │             │
   │             │                  │<────────────────────────────────────┤             │
   │             │                  │                    │                 │             │
   │             │ 13. Response:    │                    │                 │             │
   │             │     - Stale data │                    │                 │             │
   │             │     - Warning:   │                    │                 │             │
   │             │       "Showing   │                    │                 │             │
   │             │        cached    │                    │                 │             │
   │             │        results" │                    │                 │             │
   │             │     - X-Cache:   │                    │                 │             │
   │             │       STALE      │                    │                 │             │
   │             │<─────────────────┤                    │                 │             │
   │             │                  │                    │                 │             │
   │ 14. Display │                  │                    │                 │             │
   │     with    │                  │                    │                 │             │
   │     warning │                  │                    │                 │             │
   │<────────────┤                  │                    │                 │             │
   │             │                  │                    │                 │             │
```

**Key Points**:
- Circuit breaker monitors failure rate
- After threshold (5 failures), circuit opens
- Stale cache served during outage
- User receives warning banner
- X-Cache: STALE header indicates degraded mode
- Circuit auto-closes after timeout (60s)

---

## Diagram 4: Circuit Breaker - OPEN State (Fast Fail)

**Scenario**: Circuit is already open, subsequent requests fail fast without calling NewsAPI.

```
┌──────┐    ┌──────────┐    ┌─────────────┐    ┌─────────────────┐    ┌───────┐
│ User │    │ Frontend │    │ Backend API │    │ Circuit Breaker │    │ Cache │
└──┬───┘    └────┬─────┘    └──────┬──────┘    └────────┬────────┘    └───┬───┘
   │             │                  │                    │                 │
   │ 1. Search   │                  │                    │                 │
   │   "Tech"    │                  │                    │                 │
   ├────────────>│                  │                    │                 │
   │             │                  │                    │                 │
   │             │ 2. GET /api/v1/news?q=Tech            │                 │
   │             ├─────────────────>│                    │                 │
   │             │                  │                    │                 │
   │             │                  │ 3. Check circuit   │                 │
   │             │                  │    breaker state   │                 │
   │             │                  ├───────────────────>│                 │
   │             │                  │                    │                 │
   │             │                  │ 4. State: OPEN     │                 │
   │             │                  │    (fast fail)     │                 │
   │             │                  │<───────────────────┤                 │
   │             │                  │                    │                 │
   │             │                  │ 5. Skip NewsAPI,   │                 │
   │             │                  │    get stale cache │                 │
   │             │                  ├────────────────────────────────────>│
   │             │                  │                    │                 │
   │             │                  │ 6. Stale data      │                 │
   │             │                  │<────────────────────────────────────┤
   │             │                  │                    │                 │
   │             │ 7. Response:     │                    │                 │
   │             │    - Stale data  │                    │                 │
   │             │    - Warning     │                    │                 │
   │             │    - X-Cache:    │                    │                 │
   │             │      STALE       │                    │                 │
   │             │<─────────────────┤                    │                 │
   │             │                  │                    │                 │
   │ 8. Display  │                  │                    │                 │
   │    cached   │                  │                    │                 │
   │    results  │                  │                    │                 │
   │<────────────┤                  │                    │                 │
   │             │                  │                    │                 │
```

**Key Points**:
- No NewsAPI call attempted (fast fail)
- Protects upstream service from overload
- Response time <100ms
- Circuit auto-transitions to HALF-OPEN after timeout
- System remains operational with degraded data

---

## Diagram 5: Circuit Breaker - HALF-OPEN State (Recovery)

**Scenario**: Circuit transitions to half-open, allows test request to check if NewsAPI recovered.

```
┌──────┐    ┌──────────┐    ┌─────────────┐    ┌─────────────────┐    ┌─────────┐
│ User │    │ Frontend │    │ Backend API │    │ Circuit Breaker │    │ NewsAPI │
└──┬───┘    └────┬─────┘    └──────┬──────┘    └────────┬────────┘    └────┬────┘
   │             │                  │                    │                  │
   │             │                  │ [60s after OPEN]   │                  │
   │             │                  │                    │                  │
   │             │                  │ 1. Auto-transition │                  │
   │             │                  │    to HALF-OPEN    │                  │
   │             │                  │<───────────────────┤                  │
   │             │                  │                    │                  │
   │ 2. Search   │                  │                    │                  │
   │   "AI"      │                  │                    │                  │
   ├────────────>│                  │                    │                  │
   │             │                  │                    │                  │
   │             │ 3. GET /api/v1/news?q=AI              │                  │
   │             ├─────────────────>│                    │                  │
   │             │                  │                    │                  │
   │             │                  │ 4. Check circuit   │                  │
   │             │                  ├───────────────────>│                  │
   │             │                  │                    │                  │
   │             │                  │ 5. State:          │                  │
   │             │                  │    HALF-OPEN       │                  │
   │             │                  │    (allow 1 test)  │                  │
   │             │                  │<───────────────────┤                  │
   │             │                  │                    │                  │
   │             │                  │ 6. Test request to NewsAPI            │
   │             │                  ├──────────────────────────────────────>│
   │             │                  │                    │                  │
   │             │                  │ 7. SUCCESS (200 OK)│                  │
   │             │                  │<──────────────────────────────────────┤
   │             │                  │                    │                  │
   │             │                  │ 8. Record success  │                  │
   │             │                  ├───────────────────>│                  │
   │             │                  │                    │                  │
   │             │                  │ 9. Transition to   │                  │
   │             │                  │    CLOSED state    │                  │
   │             │                  │    (fully healed)  │                  │
   │             │                  │<───────────────────┤                  │
   │             │                  │                    │                  │
   │             │ 10. Response     │                    │                  │
   │             │     (fresh data) │                    │                  │
   │             │<─────────────────┤                    │                  │
   │             │                  │                    │                  │
   │ 11. Display │                  │                    │                  │
   │     news    │                  │                    │                  │
   │<────────────┤                  │                    │                  │
   │             │                  │                    │                  │
```

**Key Points**:
- Circuit auto-transitions after timeout (60s)
- Single test request allowed
- Success → CLOSED (normal operation)
- Failure → OPEN (continue degraded mode)
- Self-healing mechanism

---

## Diagram 6: Offline Mode Toggle

**Scenario**: User manually enables offline mode, system uses mock data.

```
┌──────┐         ┌──────────┐         ┌─────────────┐         ┌──────────────┐
│ User │         │ Frontend │         │ Backend API │         │ Mock Service │
└──┬───┘         └────┬─────┘         └──────┬──────┘         └──────┬───────┘
   │                  │                       │                       │
   │ 1. Toggle        │                       │                       │
   │    "Offline Mode"│                       │                       │
   │    ON            │                       │                       │
   ├─────────────────>│                       │                       │
   │                  │                       │                       │
   │                  │ 2. Store preference   │                       │
   │                  │    (localStorage)     │                       │
   │                  │                       │                       │
   │ 3. Search "AI"   │                       │                       │
   ├─────────────────>│                       │                       │
   │                  │                       │                       │
   │                  │ 3. GET /api/v1/news?q=AI&offline=true         │
   │                  ├──────────────────────>│                       │
   │                  │                       │                       │
   │                  │                       │ 4. Detect offline flag│
   │                  │                       │                       │
   │                  │                       │ 5. Call mock service  │
   │                  │                       ├──────────────────────>│
   │                  │                       │                       │
   │                  │                       │ 6. Return mock news   │
   │                  │                       │    with sentiment     │
   │                  │                       │<──────────────────────┤
   │                  │                       │                       │
   │                  │ 7. Response:          │                       │
   │                  │    - Mock articles    │                       │
   │                  │    - Sentiment data   │                       │
   │                  │    - Banner: "Offline │                       │
   │                  │      Mode Active"     │                       │
   │                  │    - X-Mode: OFFLINE  │                       │
   │                  │<──────────────────────┤                       │
   │                  │                       │                       │
   │ 8. Display mock  │                       │                       │
   │    data with     │                       │                       │
   │    offline banner│                       │                       │
   │<─────────────────┤                       │                       │
   │                  │                       │                       │
```

**Key Points**:
- User-controlled offline mode
- No external API calls
- Instant response with mock data
- Useful for testing/demos
- Banner indicates offline status

---

## Diagram 7: Conditional Alerts - Negative Sentiment

**Scenario**: Search returns predominantly negative news, system displays alert.

```
┌──────┐         ┌──────────┐         ┌─────────────┐         ┌────────────────────┐
│ User │         │ Frontend │         │ Backend API │         │ Sentiment Analyzer │
└──┬───┘         └────┬─────┘         └──────┬──────┘         └─────────┬──────────┘
   │                  │                       │                          │
   │ 1. Search        │                       │                          │
   │    "recession"   │                       │                          │
   ├─────────────────>│                       │                          │
   │                  │                       │                          │
   │                  │ 2. GET /api/v1/news?q=recession                  │
   │                  ├──────────────────────>│                          │
   │                  │                       │                          │
   │                  │                       │ 3. Fetch & analyze       │
   │                  │                       ├─────────────────────────>│
   │                  │                       │                          │
   │                  │                       │ 4. Results:              │
   │                  │                       │    - 8/10 negative       │
   │                  │                       │    - 2/10 neutral        │
   │                  │                       │    - 0/10 positive       │
   │                  │                       │<─────────────────────────┤
   │                  │                       │                          │
   │                  │                       │ 5. Calculate sentiment   │
   │                  │                       │    distribution:         │
   │                  │                       │    negative = 80%        │
   │                  │                       │                          │
   │                  │                       │ 6. Trigger alert:        │
   │                  │                       │    "High volume of       │
   │                  │                       │     negative news"       │
   │                  │                       │                          │
   │                  │ 7. Response with:     │                          │
   │                  │    - Articles         │                          │
   │                  │    - Sentiment data   │                          │
   │                  │    - Alert: {         │                          │
   │                  │        type: "warning"│                          │
   │                  │        message: "High │                          │
   │                  │         volume of     │                          │
   │                  │         negative news │                          │
   │                  │         - Content may │                          │
   │                  │         be distressing│                          │
   │                  │      }                │                          │
   │                  │<──────────────────────┤                          │
   │                  │                       │                          │
   │ 8. Display news  │                       │                          │
   │    with warning  │                       │                          │
   │    banner        │                       │                          │
   │<─────────────────┤                       │                          │
   │                  │                       │                          │
```

**Alert Triggers**:
- **Negative Sentiment**: >60% negative articles
- **Source Dominance**: Single source >50% of results
- **Breaking News**: >30% published in last 2 hours
- **Controversial Topics**: High sentiment variance

---

## Diagram 8: Filter Application (Date, Source, Sentiment)

**Scenario**: User applies filters to refine search results.

```
┌──────┐         ┌──────────┐         ┌─────────────┐         ┌───────┐
│ User │         │ Frontend │         │ Backend API │         │ Cache │
└──┬───┘         └────┬─────┘         └──────┬──────┘         └───┬───┘
   │                  │                       │                    │
   │ 1. Initial       │                       │                    │
   │    search "AI"   │                       │                    │
   ├─────────────────>│                       │                    │
   │                  │                       │                    │
   │                  │ 2. GET /api/v1/news?q=AI                   │
   │                  ├──────────────────────>│                    │
   │                  │                       │                    │
   │                  │ [... fetch & cache ...] (see Diagram 1)    │
   │                  │                       │                    │
   │                  │ 3. Response (50 articles)                  │
   │                  │<──────────────────────┤                    │
   │                  │                       │                    │
   │ 4. Display all   │                       │                    │
   │    results       │                       │                    │
   │<─────────────────┤                       │                    │
   │                  │                       │                    │
   │ 5. Apply filters:│                       │                    │
   │    - Date: Last  │                       │                    │
   │      24 hours    │                       │                    │
   │    - Sentiment:  │                       │                    │
   │      Positive    │                       │                    │
   │    - Source:     │                       │                    │
   │      TechCrunch  │                       │                    │
   ├─────────────────>│                       │                    │
   │                  │                       │                    │
   │                  │ 6. Client-side filter │                    │
   │                  │    (no API call)      │                    │
   │                  │                       │                    │
   │                  │    Filter logic:      │                    │
   │                  │    - publishedAt >=   │                    │
   │                  │      now - 24h        │                    │
   │                  │    - sentiment ==     │                    │
   │                  │      "positive"       │                    │
   │                  │    - source.name ==   │                    │
   │                  │      "TechCrunch"     │                    │
   │                  │                       │                    │
   │ 7. Display       │                       │                    │
   │    filtered      │                       │                    │
   │    results (5)   │                       │                    │
   │<─────────────────┤                       │                    │
   │                  │                       │                    │
```

**Key Points**:
- Filters applied client-side (no re-fetch)
- Instant response
- Reduces API calls
- All filter data included in initial response

---

## Circuit Breaker State Machine

```
                    ┌─────────────────────────────────────┐
                    │                                     │
                    │         CLOSED (Normal)             │
                    │                                     │
                    │  - All requests pass through        │
                    │  - Monitor failure rate             │
                    │                                     │
                    └──────────────┬──────────────────────┘
                                   │
                                   │ Failure threshold
                                   │ exceeded (5 failures)
                                   │
                                   ▼
                    ┌─────────────────────────────────────┐
                    │                                     │
                    │          OPEN (Failing)             │
                    │                                     │
                    │  - Reject requests immediately      │
                    │  - Serve stale cache                │
                    │  - Start timeout timer (60s)        │
                    │                                     │
                    └──────────────┬──────────────────────┘
                                   │
                                   │ Timeout expires
                                   │ (60 seconds)
                                   │
                                   ▼
                    ┌─────────────────────────────────────┐
                    │                                     │
                    │       HALF-OPEN (Testing)           │
                    │                                     │
                    │  - Allow 1 test request             │
                    │  - If success → CLOSED              │
                    │  - If failure → OPEN                │
                    │                                     │
                    └─────────────────────────────────────┘
                         │                        │
                         │                        │
                  Success│                        │Failure
                         │                        │
                         ▼                        ▼
                    [CLOSED]                  [OPEN]
```

---

## Cache TTL Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    Cache Lifecycle                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  T=0min    │  T=5min    │  T=10min   │  T=15min   │  T=16min   │
│  ─────────────────────────────────────────────────────────────  │
│  Cache     │  Cache     │  Cache     │  Cache     │  Cache     │
│  MISS      │  HIT       │  HIT       │  HIT       │  MISS      │
│  (fetch)   │  (valid)   │  (valid)   │  (expires) │  (fetch)   │
│            │            │            │            │            │
│  NewsAPI   │  No API    │  No API    │  No API    │  NewsAPI   │
│  called    │  call      │  call      │  call      │  called    │
│            │            │            │            │            │
│  Store     │  Serve     │  Serve     │  Serve     │  Store     │
│  15min TTL │  cached    │  cached    │  cached    │  15min TTL │
│            │            │            │            │            │
└─────────────────────────────────────────────────────────────────┘

**TTL Rationale**: 15 minutes balances:
- News freshness (reasonable for non-breaking news)
- NewsAPI rate limits (100 requests/day on free tier)
- User experience (fast responses)
```

---

## Response Headers

**Standard Response**:
```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Cache: HIT
X-Cache-Expires: 2026-07-24T10:45:00Z
X-RateLimit-Remaining: 95
X-Response-Time: 45ms
```

**Degraded Mode (Stale Cache)**:
```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Cache: STALE
X-Circuit-Breaker: OPEN
X-Warning: "Showing cached results - API unavailable"
X-Response-Time: 12ms
```

**Offline Mode**:
```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Mode: OFFLINE
X-Data-Source: MOCK
X-Response-Time: 5ms
```

---

## Summary

These sequence diagrams illustrate:

1. **Happy Path**: Normal operation with cache miss/hit
2. **Resilience**: Circuit breaker protecting against upstream failures
3. **Degradation**: Graceful fallback to stale cache
4. **Recovery**: Self-healing via half-open state
5. **Offline Mode**: User-controlled mock data
6. **Alerts**: Conditional warnings based on content analysis
7. **Filtering**: Client-side data refinement

**Key Architectural Principles**:
- ✅ Fail gracefully (stale cache > error)
- ✅ Fast fail (circuit breaker)
- ✅ Self-healing (half-open state)
- ✅ User transparency (headers, alerts)
- ✅ Performance optimization (caching)
- ✅ Resilience patterns (circuit breaker, TTL)

---

**Next Steps**:
1. Create draw.io visual diagrams from these text diagrams
2. Define OpenAPI/Swagger specification
3. Begin backend implementation

**Last Updated**: 2026-07-24  
**Status**: Sequence diagrams complete ✅
