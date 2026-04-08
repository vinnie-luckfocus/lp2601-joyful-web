/**
 * Public API Service Tests
 * Tests for service layer business logic
 */

// Mock the database pool
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

import pool from '../../config/database';
import {
  getRecentGames,
  getStandings,
  getLeaders,
  getRecentGameResults,
  PublicApiError,
  ErrorCodes,
} from '../../services/publicApi';

const mockQuery = pool.query as jest.Mock;

describe('Public API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecentGames', () => {
    it('should fetch recent games from database', async () => {
      const mockGames = [
        {
          id: 1,
          scheduled_at: '2026-04-10T14:00:00Z',
          location: 'Stadium A',
          home_team_id: 1,
          away_team_id: 2,
          home_team_name: 'A队',
          away_team_name: 'B队',
          home_score: null,
          away_score: null,
          status: 'scheduled',
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockGames });

      const result = await getRecentGames(4);

      expect(result).toEqual(mockGames);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should throw PublicApiError for invalid limit', async () => {
      await expect(getRecentGames(0)).rejects.toThrow(PublicApiError);
      await expect(getRecentGames(0)).rejects.toMatchObject({
        code: ErrorCodes.INVALID_PARAMETER,
      });
    });

    it('should throw PublicApiError for limit exceeding max', async () => {
      await expect(getRecentGames(100)).rejects.toThrow(PublicApiError);
    });

    it('should throw PublicApiError for non-integer limit', async () => {
      await expect(getRecentGames(3.5 as unknown as number)).rejects.toThrow(
        PublicApiError
      );
    });
  });

  describe('getStandings', () => {
    it('should fetch team standings', async () => {
      const mockStandings = [
        {
          id: 1,
          name: 'A队',
          division: '大联盟',
          wins: 10,
          losses: 2,
          win_percentage: 83.33,
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockStandings });

      const result = await getStandings();

      expect(result).toEqual(mockStandings);
    });
  });

  describe('getLeaders', () => {
    it('should fetch batting average leaders', async () => {
      const mockLeaders = [
        {
          user_id: 1,
          player_name: '张三',
          jersey_number: 10,
          team_name: 'A队',
          value: 0.385,
          category: 'batting_average',
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockLeaders });

      const result = await getLeaders('batting_average', 10);

      expect(result).toEqual(mockLeaders);
    });

    it('should fetch home run leaders', async () => {
      const mockLeaders = [
        {
          user_id: 1,
          player_name: '张三',
          jersey_number: 10,
          team_name: 'A队',
          value: 15,
          category: 'home_runs',
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockLeaders });

      const result = await getLeaders('home_runs', 10);

      expect(result).toEqual(mockLeaders);
    });

    it('should throw PublicApiError for invalid category', async () => {
      await expect(getLeaders('invalid_category', 10)).rejects.toThrow(
        PublicApiError
      );
      await expect(getLeaders('invalid_category', 10)).rejects.toMatchObject({
        code: ErrorCodes.INVALID_PARAMETER,
      });
    });

    it('should throw PublicApiError for invalid limit', async () => {
      await expect(getLeaders('batting_average', 0)).rejects.toThrow(
        PublicApiError
      );
    });
  });

  describe('getRecentGameResults', () => {
    it('should fetch recent completed games with highlights', async () => {
      mockQuery
        .mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              scheduled_at: '2026-04-05T14:00:00Z',
              location: 'Stadium A',
              home_team_name: 'A队',
              away_team_name: 'B队',
              home_score: 5,
              away_score: 3,
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [{ player: '张三', count: 2 }] })
        .mockResolvedValueOnce({ rows: [{ player: '李四', count: 3 }] });

      const result = await getRecentGameResults(3);

      expect(result).toHaveLength(1);
      expect(result[0].highlights).toHaveLength(2);
      expect(result[0].highlights[0]).toMatchObject({
        type: 'hr',
        player: '张三',
        count: 2,
      });
    });

    it('should handle games without highlights', async () => {
      mockQuery
        .mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              scheduled_at: '2026-04-05T14:00:00Z',
              location: 'Stadium A',
              home_team_name: 'A队',
              away_team_name: 'B队',
              home_score: 1,
              away_score: 0,
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await getRecentGameResults(3);

      expect(result[0].highlights).toEqual([]);
    });

    it('should throw PublicApiError for invalid limit', async () => {
      await expect(getRecentGameResults(0)).rejects.toThrow(PublicApiError);
    });
  });

  describe('Retry mechanism', () => {
    it('should retry on connection errors and eventually succeed', async () => {
      mockQuery
        .mockRejectedValueOnce(new Error('connection failed'))
        .mockResolvedValueOnce({ rows: [] });

      const result = await getStandings();

      expect(result).toEqual([]);
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('should throw QUERY_TIMEOUT error on timeout after retries', async () => {
      mockQuery.mockRejectedValue(new Error('timeout'));

      await expect(getStandings()).rejects.toThrow(PublicApiError);
      await expect(getStandings()).rejects.toMatchObject({
        code: ErrorCodes.QUERY_TIMEOUT,
        statusCode: 504,
      });
    });

    it('should throw DB_CONNECTION_ERROR on connection failure after retries', async () => {
      mockQuery.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(getStandings()).rejects.toThrow(PublicApiError);
      await expect(getStandings()).rejects.toMatchObject({
        code: ErrorCodes.DB_CONNECTION_ERROR,
        statusCode: 503,
      });
    });

    it('should not retry on non-connection errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('syntax error in SQL'));

      await expect(getStandings()).rejects.toThrow('syntax error in SQL');
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it('should retry exactly MAX_RETRIES times before giving up', async () => {
      mockQuery.mockRejectedValue(new Error('connection failed'));

      await expect(getStandings()).rejects.toThrow(PublicApiError);
      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it('should handle non-Error objects thrown', async () => {
      mockQuery.mockRejectedValue('string error');

      // Non-connection errors are re-thrown as-is without wrapping
      await expect(getStandings()).rejects.toBe('string error');
    });
  });

  describe('PublicApiError', () => {
    it('should create error with correct properties', () => {
      const error = new PublicApiError(
        '4001',
        'Test message',
        400,
        { field: 'value' }
      );

      expect(error.code).toBe('4001');
      expect(error.message).toBe('Test message');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ field: 'value' });
    });
  });
});
