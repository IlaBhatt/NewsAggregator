/**
 * Source credibility scoring service
 * Evaluates news sources based on reputation and heuristics
 */

import { SourceCredibility } from '../types';
import { logger } from '../config/logger';

/**
 * Known credible news sources (tier classification)
 * In production, this would be a more comprehensive database
 */
const SOURCE_TIERS: Record<string, 'high' | 'medium' | 'low'> = {
  // High credibility
  'bbc.com': 'high',
  'bbc.co.uk': 'high',
  'reuters.com': 'high',
  'apnews.com': 'high',
  'npr.org': 'high',
  'pbs.org': 'high',
  'economist.com': 'high',
  'wsj.com': 'high',
  'nytimes.com': 'high',
  'washingtonpost.com': 'high',
  'theguardian.com': 'high',
  'ft.com': 'high',
  'bloomberg.com': 'high',
  
  // Medium credibility
  'cnn.com': 'medium',
  'foxnews.com': 'medium',
  'cnbc.com': 'medium',
  'usatoday.com': 'medium',
  'politico.com': 'medium',
  'thehill.com': 'medium',
  'axios.com': 'medium',
  'vox.com': 'medium',
  'buzzfeed.com': 'medium',
  'huffpost.com': 'medium',
  'vice.com': 'medium',
  
  // Additional sources can be added
};

/**
 * Base scores for each tier
 */
const TIER_BASE_SCORES: Record<'high' | 'medium' | 'low', number> = {
  high: 80,
  medium: 60,
  low: 40,
};

export class CredibilityScorer {
  /**
   * Score source credibility
   */
  public score(sourceName: string, sourceUrl?: string): SourceCredibility {
    try {
      // Extract domain from URL if provided
      const domain = sourceUrl ? this.extractDomain(sourceUrl) : null;
      
      // Determine tier
      const tier = this.determineTier(domain, sourceName);
      
      // Calculate base score
      let score = TIER_BASE_SCORES[tier];
      
      // Apply modifiers
      const indicators: string[] = [];
      
      // Domain-based adjustments
      if (domain) {
        if (this.isGovernmentDomain(domain)) {
          score += 10;
          indicators.push('Government source');
        }
        
        if (this.isEducationalDomain(domain)) {
          score += 10;
          indicators.push('Educational institution');
        }
        
        if (this.hasSecureConnection(sourceUrl)) {
          score += 5;
          indicators.push('Secure connection');
        }
      }
      
      // Name-based adjustments
      if (this.isWellKnownSource(sourceName)) {
        indicators.push('Well-known source');
      }
      
      // Tier indicator
      indicators.push(`Tier: ${tier}`);
      
      // Clamp score to 0-100
      score = Math.max(0, Math.min(100, score));

      logger.debug(`Credibility score for ${sourceName}: ${score} (${tier})`);

      return {
        score,
        tier,
        indicators,
      };
    } catch (error) {
      logger.error('Credibility scoring failed', { error });
      return this.createDefaultScore();
    }
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return null;
    }
  }

  /**
   * Determine source tier
   */
  private determineTier(
    domain: string | null,
    sourceName: string
  ): 'high' | 'medium' | 'low' {
    // Check domain first
    if (domain && SOURCE_TIERS[domain]) {
      return SOURCE_TIERS[domain];
    }

    // Check source name (case-insensitive partial match)
    const lowerSourceName = sourceName.toLowerCase();
    for (const [knownDomain, tier] of Object.entries(SOURCE_TIERS)) {
      const sourcePart = knownDomain.split('.')[0];
      if (lowerSourceName.includes(sourcePart)) {
        return tier;
      }
    }

    // Default to low tier for unknown sources
    return 'low';
  }

  /**
   * Check if domain is government
   */
  private isGovernmentDomain(domain: string): boolean {
    return domain.endsWith('.gov') || domain.endsWith('.gov.uk');
  }

  /**
   * Check if domain is educational
   */
  private isEducationalDomain(domain: string): boolean {
    return domain.endsWith('.edu') || domain.endsWith('.ac.uk');
  }

  /**
   * Check if URL uses HTTPS
   */
  private hasSecureConnection(url?: string): boolean {
    return url?.startsWith('https://') ?? false;
  }

  /**
   * Check if source is well-known
   */
  private isWellKnownSource(sourceName: string): boolean {
    const lowerName = sourceName.toLowerCase();
    return Object.keys(SOURCE_TIERS).some((domain) =>
      lowerName.includes(domain.split('.')[0])
    );
  }

  /**
   * Create default credibility score (fallback)
   */
  private createDefaultScore(): SourceCredibility {
    return {
      score: 50,
      tier: 'medium',
      indicators: ['Unknown source'],
    };
  }

  /**
   * Batch score multiple sources
   */
  public scoreBatch(
    sources: Array<{ name: string; url?: string }>
  ): SourceCredibility[] {
    return sources.map(({ name, url }) => this.score(name, url));
  }
}
