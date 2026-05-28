import { describe, it, expect } from 'vitest';
import { addSinglePost } from './trend-analyzer';
import { StockAnalysis, InventoryItem } from '../types/planner';

describe('trend-analyzer', () => {
  describe('addSinglePost', () => {
    it('returns null if item is not found in analysis or inventory', () => {
      const mockAnalysis: StockAnalysis = {
        generatedAt: '2023-01-01T00:00:00Z',
        summary: 'Test summary',
        trendKeywords: [],
        pushItems: [],
        dyingItems: [],
        trendMatches: [],
        categoryOpportunities: [],
        trendSnapshot: {
          fetchedAt: '2023-01-01T00:00:00Z',
          generatedFrom: 'fallback',
          headline: 'Test Trend',
          items: []
        }
      };
      
      const result = addSinglePost('NOT_FOUND', mockAnalysis, [], []);
      expect(result).toBeNull();
    });

    it('creates a post from inventory when found', () => {
      const mockAnalysis: StockAnalysis = {
        generatedAt: '2023-01-01T00:00:00Z',
        summary: 'Test summary',
        trendKeywords: [],
        pushItems: [],
        dyingItems: [],
        trendMatches: [],
        categoryOpportunities: [],
        trendSnapshot: {
          fetchedAt: '2023-01-01T00:00:00Z',
          generatedFrom: 'fallback',
          headline: 'Test Trend',
          items: []
        }
      };
      
      const mockInventory: InventoryItem[] = [
        {
          code: 'ITEM-1',
          product: 'Test Item',
          qty: 10,
          cost: 100,
          sellPrice: 150,
          itemType: 'test',
          agingDays: 10,
          serial: 'SN001',
          store: 'HQ',
          agingBucket: '0-30',
          stockValue: 1000,
          projectedRevenue: 1500,
          margin: 500
        }
      ];

      const result = addSinglePost('ITEM-1', mockAnalysis, [], mockInventory);
      
      expect(result).not.toBeNull();
      expect(result?.productCode).toBe('ITEM-1');
      expect(result?.productFocus).toBe('Test Item');
    });
  });
});
