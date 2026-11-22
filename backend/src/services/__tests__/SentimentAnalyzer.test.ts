/**
 * Unit tests for SentimentAnalyzer
 */

import { SentimentAnalyzer } from '../SentimentAnalyzer';
import { SentimentType } from '../../types';

describe('SentimentAnalyzer', () => {
  let analyzer: SentimentAnalyzer;

  beforeEach(() => {
    analyzer = new SentimentAnalyzer();
  });

  describe('analyze', () => {
    it('should classify positive sentiment correctly', () => {
      const result = analyzer.analyze('This is a great and amazing success story');
      
      expect(result.type).toBe(SentimentType.POSITIVE);
      expect(result.score).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should classify negative sentiment correctly', () => {
      const result = analyzer.analyze('This is a terrible and horrible disaster');
      
      expect(result.type).toBe(SentimentType.NEGATIVE);
      expect(result.score).toBeLessThan(0);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should classify neutral sentiment correctly', () => {
      const result = analyzer.analyze('The weather is cloudy today');
      
      expect(result.type).toBe(SentimentType.NEUTRAL);
      expect(Math.abs(result.score)).toBeLessThanOrEqual(0.1);
    });

    it('should handle empty text', () => {
      const result = analyzer.analyze('');
      
      expect(result.type).toBe(SentimentType.NEUTRAL);
      expect(result.score).toBe(0);
      expect(result.confidence).toBe(0);
    });

    it('should handle text with no sentiment words', () => {
      const result = analyzer.analyze('The table has four legs');
      
      expect(result.type).toBe(SentimentType.NEUTRAL);
    });

    it('should normalize scores to -1 to 1 range', () => {
      const result = analyzer.analyze('excellent wonderful amazing fantastic superb brilliant');
      
      expect(result.score).toBeGreaterThanOrEqual(-1);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('should handle mixed sentiment with more positive words', () => {
      const result = analyzer.analyze('This is great and excellent but has a small problem');
      
      expect(result.type).toBe(SentimentType.POSITIVE);
    });

    it('should handle mixed sentiment with more negative words', () => {
      const result = analyzer.analyze('This is terrible and awful but has a good feature');
      
      expect(result.type).toBe(SentimentType.NEGATIVE);
    });

    it('should be case insensitive', () => {
      const result1 = analyzer.analyze('GREAT');
      const result2 = analyzer.analyze('great');
      const result3 = analyzer.analyze('GrEaT');
      
      expect(result1.type).toBe(result2.type);
      expect(result2.type).toBe(result3.type);
    });

    it('should handle special characters', () => {
      const result = analyzer.analyze('This is great!!! Amazing??? Wonderful...');
      
      expect(result.type).toBe(SentimentType.POSITIVE);
    });

    it('should calculate confidence based on sentiment word coverage', () => {
      const highCoverage = analyzer.analyze('great excellent wonderful');
      const lowCoverage = analyzer.analyze('great table chair desk lamp');
      
      expect(highCoverage.confidence).toBeGreaterThan(lowCoverage.confidence);
    });
  });

  describe('analyzeBatch', () => {
    it('should analyze multiple texts', () => {
      const texts = [
        'This is great',
        'This is terrible',
        'This is okay',
      ];
      
      const results = analyzer.analyzeBatch(texts);
      
      expect(results).toHaveLength(3);
      expect(results[0].type).toBe(SentimentType.POSITIVE);
      expect(results[1].type).toBe(SentimentType.NEGATIVE);
      expect(results[2].type).toBe(SentimentType.NEUTRAL);
    });

    it('should handle empty array', () => {
      const results = analyzer.analyzeBatch([]);
      
      expect(results).toHaveLength(0);
    });
  });
});
