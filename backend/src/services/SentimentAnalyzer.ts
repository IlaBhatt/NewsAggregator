/**
 * Lexicon-based sentiment analysis using AFINN approach
 * Pattern: Strategy Pattern (can be extended with different algorithms)
 */

import { SentimentResult, SentimentType } from '../types';
import { logger } from '../config/logger';

/**
 * Simplified AFINN wordlist (subset for demonstration)
 * In production, use full AFINN-165 or similar lexicon
 * Scores range from -5 (most negative) to +5 (most positive)
 */
const AFINN_WORDLIST: Record<string, number> = {
  // Positive words
  good: 3,
  great: 3,
  excellent: 4,
  amazing: 4,
  wonderful: 4,
  fantastic: 4,
  outstanding: 4,
  superb: 5,
  brilliant: 4,
  positive: 2,
  success: 3,
  successful: 3,
  win: 4,
  winner: 4,
  winning: 4,
  love: 3,
  loved: 3,
  like: 2,
  liked: 2,
  happy: 3,
  happiness: 3,
  joy: 3,
  delighted: 3,
  perfect: 3,
  best: 3,
  better: 2,
  improved: 2,
  improvement: 2,
  
  // Negative words
  bad: -3,
  terrible: -3,
  awful: -3,
  horrible: -3,
  worst: -3,
  worse: -2,
  poor: -2,
  negative: -2,
  fail: -3,
  failure: -3,
  failed: -3,
  hate: -3,
  hated: -3,
  dislike: -2,
  sad: -2,
  disappointing: -2,
  disappointed: -2,
  unfortunate: -2,
  crisis: -3,
  disaster: -3,
  problem: -2,
  issue: -1,
  concern: -2,
  worried: -2,
  worry: -2,
  risk: -2,
  threat: -3,
  danger: -3,
  dangerous: -3,
  death: -3,
  kill: -3,
  killed: -3,
  attack: -3,
  attacked: -3,
  violence: -3,
  violent: -3,
  war: -3,
  corruption: -3,
  corrupt: -3,
  scandal: -3,
  very: 0.5,
  really: 0.5,
  extremely: 0.8,
  absolutely: 0.8,
  not: -0.5,
  never: -0.5,
  no: -0.3,
};

export class SentimentAnalyzer {
  public analyze(text: string): SentimentResult {
    try {
      if (!text || text.trim().length === 0) {
        return this.createNeutralResult();
      }

      const tokens = this.tokenize(text);
      const rawScore = this.calculateScore(tokens);
      const normalizedScore = this.normalizeScore(rawScore, tokens.length);
      const type = this.classifySentiment(normalizedScore);
      const confidence = this.calculateConfidence(tokens);

      logger.debug(`Sentiment analysis: score=${normalizedScore}, type=${type}`);

      return {
        score: normalizedScore,
        type,
        confidence,
      };
    } catch (error) {
      logger.error('Sentiment analysis failed', { error });
      return this.createNeutralResult();
    }
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 0);
  }

  private calculateScore(tokens: string[]): number {
    let score = 0;
    let modifier = 1;

    for (let i = 0; i < tokens.length; i++) {
      const word = tokens[i];
      const wordScore = AFINN_WORDLIST[word];

      if (wordScore !== undefined) {
        if (Math.abs(wordScore) < 1) {
          modifier *= 1 + wordScore;
        } else {
          score += wordScore * modifier;
          modifier = 1; 
        }
      }
    }

    return score;
  }

  private normalizeScore(rawScore: number, tokenCount: number): number {
    if (tokenCount === 0) return 0;
    const avgScore = rawScore / tokenCount;
    return Math.max(-1, Math.min(1, avgScore));
  }


  private classifySentiment(score: number): SentimentType {
    if (score > 0.1) return SentimentType.POSITIVE;
    if (score < -0.1) return SentimentType.NEGATIVE;
    return SentimentType.NEUTRAL;
  }

  private calculateConfidence(tokens: string[]): number {
    const sentimentWords = tokens.filter(
      (word) => AFINN_WORDLIST[word] !== undefined && Math.abs(AFINN_WORDLIST[word]) >= 1
    );

    if (tokens.length === 0) return 0;
    const coverage = sentimentWords.length / tokens.length;

    return coverage;
  }

  private createNeutralResult(): SentimentResult {
    return {
      score: 0,
      type: SentimentType.NEUTRAL,
      confidence: 0,
    };
  }

  public analyzeBatch(texts: string[]): SentimentResult[] {
    return texts.map((text) => this.analyze(text));
  }
}
