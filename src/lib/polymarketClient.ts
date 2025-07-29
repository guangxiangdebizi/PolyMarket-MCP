import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Polymarket API client for interacting with various Polymarket endpoints
 */
export class PolymarketClient {
  private gammaApi: AxiosInstance;
  private dataApi: AxiosInstance;
  private clobApi: AxiosInstance;

  constructor() {
    // Gamma Markets API - for market discovery and metadata
    this.gammaApi = axios.create({
      baseURL: 'https://gamma-api.polymarket.com',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'polymarket-mcp/1.0.0'
      }
    });

    // Data API - for user data, holdings, and activities
    this.dataApi = axios.create({
      baseURL: 'https://data-api.polymarket.com',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'polymarket-mcp/1.0.0'
      }
    });

    // CLOB API - for order book and trading data
    this.clobApi = axios.create({
      baseURL: 'https://clob.polymarket.com',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'polymarket-mcp/1.0.0'
      }
    });

    // Add response interceptors for error handling
    this.setupInterceptors();
  }

  private setupInterceptors() {
    const responseInterceptor = (response: any) => response;
    const errorInterceptor = (error: any) => {
      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        throw new Error(`API Error ${status}: ${data?.message || data?.error || 'Unknown error'}`);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error: No response from server');
      } else {
        // Something else happened
        throw new Error(`Request error: ${error.message}`);
      }
    };

    this.gammaApi.interceptors.response.use(responseInterceptor, errorInterceptor);
    this.dataApi.interceptors.response.use(responseInterceptor, errorInterceptor);
    this.clobApi.interceptors.response.use(responseInterceptor, errorInterceptor);
  }

  /**
   * Get markets from Gamma API
   */
  async getMarkets(params: any = {}) {
    const response = await this.gammaApi.get('/markets', { params });
    return response.data;
  }

  /**
   * Get events from Gamma API
   */
  async getEvents(params: any = {}) {
    const response = await this.gammaApi.get('/events', { params });
    return response.data;
  }

  /**
   * Get user positions from Data API
   */
  async getUserPositions(user: string, params: any = {}) {
    const response = await this.dataApi.get('/positions', {
      params: { user, ...params }
    });
    return response.data;
  }

  /**
   * Get user activity from Data API
   */
  async getUserActivity(user: string, params: any = {}) {
    const response = await this.dataApi.get('/activity', {
      params: { user, ...params }
    });
    return response.data;
  }

  /**
   * Get market holders from Data API
   */
  async getMarketHolders(token: string, params: any = {}) {
    const response = await this.dataApi.get('/holders', {
      params: { token, ...params }
    });
    return response.data;
  }

  /**
   * Get trades from Data API
   */
  async getTrades(params: any = {}) {
    const response = await this.dataApi.get('/trades', { params });
    return response.data;
  }

  /**
   * Get order book from CLOB API
   */
  async getOrderBook(tokenId: string, params: any = {}) {
    const response = await this.clobApi.get('/book', {
      params: { token_id: tokenId, ...params }
    });
    return response.data;
  }

  /**
   * Get market prices from CLOB API
   */
  async getMarketPrices(params: any = {}) {
    const response = await this.clobApi.get('/prices', { params });
    return response.data;
  }

  /**
   * Search markets with text query
   */
  async searchMarkets(query: string, params: any = {}) {
    const searchParams = {
      ...params,
      search: query
    };
    return await this.getMarkets(searchParams);
  }

  /**
   * Get market by ID
   */
  async getMarketById(id: string) {
    const markets = await this.getMarkets({ id });
    return markets.length > 0 ? markets[0] : null;
  }

  /**
   * Get event by ID
   */
  async getEventById(id: string) {
    const events = await this.getEvents({ id });
    return events.length > 0 ? events[0] : null;
  }

  /**
   * Get trending markets (high volume/activity)
   */
  async getTrendingMarkets(limit: number = 10) {
    return await this.getMarkets({
      active: true,
      order: 'volume',
      ascending: false,
      limit
    });
  }

  /**
   * Get active markets
   */
  async getActiveMarkets(limit: number = 50) {
    return await this.getMarkets({
      active: true,
      closed: false,
      limit
    });
  }

  /**
   * Get markets by category/tag
   */
  async getMarketsByTag(tagId: number, limit: number = 20) {
    return await this.getMarkets({
      tag_id: tagId,
      active: true,
      limit
    });
  }
}

// Export singleton instance
export const polymarketClient = new PolymarketClient();