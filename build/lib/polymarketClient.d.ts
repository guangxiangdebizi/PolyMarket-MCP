/**
 * Polymarket API client for interacting with various Polymarket endpoints
 */
export declare class PolymarketClient {
    private gammaApi;
    private dataApi;
    private clobApi;
    constructor();
    private setupInterceptors;
    /**
     * Get markets from Gamma API
     */
    getMarkets(params?: any): Promise<any>;
    /**
     * Get events from Gamma API
     */
    getEvents(params?: any): Promise<any>;
    /**
     * Get user positions from Data API
     */
    getUserPositions(user: string, params?: any): Promise<any>;
    /**
     * Get user activity from Data API
     */
    getUserActivity(user: string, params?: any): Promise<any>;
    /**
     * Get market holders from Data API
     */
    getMarketHolders(token: string, params?: any): Promise<any>;
    /**
     * Get trades from Data API
     */
    getTrades(params?: any): Promise<any>;
    /**
     * Get order book from CLOB API
     */
    getOrderBook(tokenId: string, params?: any): Promise<any>;
    /**
     * Get market prices from CLOB API
     */
    getMarketPrices(params?: any): Promise<any>;
    /**
     * Search markets with text query
     */
    searchMarkets(query: string, params?: any): Promise<any>;
    /**
     * Get market by ID
     */
    getMarketById(id: string): Promise<any>;
    /**
     * Get event by ID
     */
    getEventById(id: string): Promise<any>;
    /**
     * Get trending markets (high volume/activity)
     */
    getTrendingMarkets(limit?: number): Promise<any>;
    /**
     * Get active markets
     */
    getActiveMarkets(limit?: number): Promise<any>;
    /**
     * Get markets by category/tag
     */
    getMarketsByTag(tagId: number, limit?: number): Promise<any>;
}
export declare const polymarketClient: PolymarketClient;
//# sourceMappingURL=polymarketClient.d.ts.map