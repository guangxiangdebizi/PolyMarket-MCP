import { polymarketClient } from '../lib/polymarketClient.js';

export const getMarketPrices = {
  name: "get_market_prices",
  description: "Get current market prices and trading data for specific markets or tokens. Shows bid/ask spreads, last traded prices, and market depth.",
  parameters: {
    type: "object",
    properties: {
      market_id: {
        type: "string",
        description: "Specific market ID to get prices for"
      },
      token_id: {
        type: "string",
        description: "Specific token/asset ID to get prices for"
      },
      interval: {
        type: "string",
        description: "Price interval for historical data (1m, 5m, 1h, 1d)",
        enum: ["1m", "5m", "1h", "1d"],
        default: "1h"
      },
      fidelity: {
        type: "number",
        description: "Number of price points to return (default: 100, max: 1000)",
        default: 100
      },
      start_ts: {
        type: "number",
        description: "Start timestamp for historical prices (Unix timestamp)"
      },
      end_ts: {
        type: "number",
        description: "End timestamp for historical prices (Unix timestamp)"
      },
      include_orderbook: {
        type: "boolean",
        description: "Include current order book data (default: true)",
        default: true
      }
    },
    required: []
  },

  async run(args: {
    market_id?: string;
    token_id?: string;
    interval?: string;
    fidelity?: number;
    start_ts?: number;
    end_ts?: number;
    include_orderbook?: boolean;
  }) {
    try {
      // Parameter validation
      if (!args.market_id && !args.token_id) {
        throw new Error("Either market_id or token_id must be provided");
      }

      const fidelity = Math.min(args.fidelity || 100, 1000);
      const interval = args.interval || '1h';
      const includeOrderbook = args.include_orderbook !== false;

      let resultText = `# Market Prices\n\n`;
      let pricesData: any = null;
      let orderbookData: any = null;

      // Get market prices
      if (args.market_id) {
        const params: any = {
          market: args.market_id,
          interval,
          fidelity
        };
        
        if (args.start_ts) params.start_ts = args.start_ts;
        if (args.end_ts) params.end_ts = args.end_ts;

        pricesData = await polymarketClient.getMarketPrices(params);
        resultText += `## Market: ${args.market_id}\n\n`;

        // Get orderbook if requested
        if (includeOrderbook) {
          try {
            orderbookData = await polymarketClient.getOrderBook(args.market_id);
          } catch (error) {
            console.warn('Failed to fetch orderbook:', error);
          }
        }
      } else if (args.token_id) {
        const params: any = {
          token_id: args.token_id,
          interval,
          fidelity
        };
        
        if (args.start_ts) params.start_ts = args.start_ts;
        if (args.end_ts) params.end_ts = args.end_ts;

        pricesData = await polymarketClient.getMarketPrices(params);
        resultText += `## Token: ${args.token_id}\n\n`;

        // Get orderbook if requested
        if (includeOrderbook) {
          try {
            orderbookData = await polymarketClient.getOrderBook(args.token_id);
          } catch (error) {
            console.warn('Failed to fetch orderbook:', error);
          }
        }
      }

      // Display current market status
      if (orderbookData) {
        resultText += `### Current Market Status\n\n`;
        
        const bids = orderbookData.bids || [];
        const asks = orderbookData.asks || [];
        
        if (bids.length > 0 && asks.length > 0) {
          const bestBid = Number(bids[0].price);
          const bestAsk = Number(asks[0].price);
          const spread = bestAsk - bestBid;
          const spreadPercent = (spread / bestBid) * 100;
          
          resultText += `- **Best Bid**: $${bestBid.toFixed(4)}\n`;
          resultText += `- **Best Ask**: $${bestAsk.toFixed(4)}\n`;
          resultText += `- **Spread**: $${spread.toFixed(4)} (${spreadPercent.toFixed(2)}%)\n`;
          resultText += `- **Mid Price**: $${((bestBid + bestAsk) / 2).toFixed(4)}\n`;
        }
        
        // Show order book depth
        if (bids.length > 0) {
          resultText += `\n#### Top 5 Bids\n`;
          bids.slice(0, 5).forEach((bid: any, index: number) => {
            resultText += `${index + 1}. $${Number(bid.price).toFixed(4)} × ${Number(bid.size).toLocaleString()} shares\n`;
          });
        }
        
        if (asks.length > 0) {
          resultText += `\n#### Top 5 Asks\n`;
          asks.slice(0, 5).forEach((ask: any, index: number) => {
            resultText += `${index + 1}. $${Number(ask.price).toFixed(4)} × ${Number(ask.size).toLocaleString()} shares\n`;
          });
        }
        
        resultText += `\n`;
      }

      // Display price history
      if (pricesData && pricesData.length > 0) {
        resultText += `### Price History (${interval} intervals)\n\n`;
        
        // Calculate price statistics
        const prices = pricesData.map((p: any) => Number(p.price)).filter((p: number) => p > 0);
        if (prices.length > 0) {
          const currentPrice = prices[prices.length - 1];
          const firstPrice = prices[0];
          const highPrice = Math.max(...prices);
          const lowPrice = Math.min(...prices);
          const priceChange = currentPrice - firstPrice;
          const priceChangePercent = (priceChange / firstPrice) * 100;
          
          resultText += `- **Current Price**: $${currentPrice.toFixed(4)}\n`;
          resultText += `- **Price Change**: ${priceChange >= 0 ? '🟢' : '🔴'} $${priceChange.toFixed(4)} (${priceChangePercent.toFixed(2)}%)\n`;
          resultText += `- **24h High**: $${highPrice.toFixed(4)}\n`;
          resultText += `- **24h Low**: $${lowPrice.toFixed(4)}\n`;
          resultText += `- **Data Points**: ${pricesData.length}\n\n`;
        }
        
        // Show recent price points
        resultText += `#### Recent Price Points\n\n`;
        const recentPrices = pricesData.slice(-10).reverse();
        
        recentPrices.forEach((pricePoint: any, index: number) => {
          const timestamp = new Date(pricePoint.timestamp * 1000);
          const price = Number(pricePoint.price);
          const volume = Number(pricePoint.volume || 0);
          
          resultText += `**${timestamp.toLocaleString()}**\n`;
          resultText += `- Price: $${price.toFixed(4)}\n`;
          if (volume > 0) {
            resultText += `- Volume: ${volume.toLocaleString()} shares\n`;
          }
          resultText += `\n`;
        });
        
        // Show volume statistics if available
        const volumes = pricesData.map((p: any) => Number(p.volume || 0)).filter((v: number) => v > 0);
        if (volumes.length > 0) {
          const totalVolume = volumes.reduce((sum: number, vol: number) => sum + vol, 0);
          const avgVolume = totalVolume / volumes.length;
          
          resultText += `#### Volume Statistics\n\n`;
          resultText += `- **Total Volume**: ${totalVolume.toLocaleString()} shares\n`;
          resultText += `- **Average Volume**: ${avgVolume.toLocaleString()} shares\n`;
          resultText += `- **Peak Volume**: ${Math.max(...volumes).toLocaleString()} shares\n\n`;
        }
      } else {
        resultText += `No price history available for the specified parameters.\n\n`;
      }

      // Add data source info
      resultText += `---\n\n`;
      resultText += `*Data interval: ${interval} | Fidelity: ${fidelity} points*\n`;
      if (args.start_ts || args.end_ts) {
        resultText += `*Time range: ${args.start_ts ? new Date(args.start_ts * 1000).toLocaleDateString() : 'earliest'} to ${args.end_ts ? new Date(args.end_ts * 1000).toLocaleDateString() : 'latest'}*\n`;
      }

      return {
        content: [{
          type: "text",
          text: resultText
        }]
      };

    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: `❌ Failed to fetch market prices: ${error.message}`
        }],
        isError: true
      };
    }
  }
};