import { polymarketClient } from '../lib/polymarketClient.js';

export const getUserPositions = {
  name: "get_user_positions",
  description: "Retrieve user's current positions in Polymarket prediction markets. Shows holdings, P&L, and position details.",
  parameters: {
    type: "object",
    properties: {
      user_address: {
        type: "string",
        description: "User's wallet address (proxy wallet address)"
      },
      limit: {
        type: "number",
        description: "Maximum number of positions to return (default: 50, max: 100)",
        default: 50
      },
      offset: {
        type: "number",
        description: "Number of positions to skip for pagination (default: 0)",
        default: 0
      },
      asset_type: {
        type: "string",
        description: "Filter by asset type (conditional_token, collateral_token)",
        enum: ["conditional_token", "collateral_token"]
      },
      market_id: {
        type: "string",
        description: "Filter positions by specific market ID"
      },
      min_size: {
        type: "number",
        description: "Minimum position size threshold"
      },
      show_zero_positions: {
        type: "boolean",
        description: "Include positions with zero size (default: false)",
        default: false
      }
    },
    required: ["user_address"]
  },

  async run(args: {
    user_address: string;
    limit?: number;
    offset?: number;
    asset_type?: string;
    market_id?: string;
    min_size?: number;
    show_zero_positions?: boolean;
  }) {
    try {
      // Parameter validation
      if (!args.user_address) {
        throw new Error("User address is required");
      }

      const limit = Math.min(args.limit || 50, 100);
      const offset = Math.max(args.offset || 0, 0);

      // Build query parameters
      const params: any = {
        user: args.user_address,
        limit,
        offset
      };

      if (args.asset_type) params.asset_type = args.asset_type;
      if (args.market_id) params.market_id = args.market_id;
      if (args.min_size) params.min_size = args.min_size;
      if (!args.show_zero_positions) params.min_size = params.min_size || 0.01;

      // Fetch user positions
      const positions = await polymarketClient.getUserPositions(params);

      // Calculate totals
      let totalValue = 0;
      let totalPnL = 0;
      let totalRealizedPnL = 0;
      let activePositions = 0;

      const formattedPositions = positions.map((position: any) => {
        const size = Number(position.size || 0);
        const currentValue = Number(position.current_value || 0);
        const pnl = Number(position.pnl || 0);
        const realizedPnl = Number(position.realized_pnl || 0);
        const avgPrice = Number(position.avg_price || 0);
        const currentPrice = Number(position.current_price || 0);

        if (size > 0) {
          totalValue += currentValue;
          totalPnL += pnl;
          totalRealizedPnL += realizedPnl;
          activePositions++;
        }

        return {
          marketId: position.market_id,
          marketQuestion: position.market?.question || 'Unknown Market',
          asset: position.asset,
          conditionId: position.condition_id,
          size: size,
          avgPrice: avgPrice,
          currentPrice: currentPrice,
          initialValue: Number(position.initial_value || 0),
          currentValue: currentValue,
          pnl: pnl,
          pnlPercent: Number(position.pnl_percent || 0),
          realizedPnl: realizedPnl,
          totalBought: Number(position.total_bought || 0),
          redeemable: position.redeemable || false,
          outcome: position.outcome || 'Unknown'
        };
      });

      // Filter out zero positions if requested
      const filteredPositions = args.show_zero_positions 
        ? formattedPositions
        : formattedPositions.filter((p: any) => p.size > 0);

      const summary = `Found ${filteredPositions.length} positions for user ${args.user_address.slice(0, 6)}...${args.user_address.slice(-4)}`;
      
      let resultText = `# User Positions\n\n${summary}\n\n`;
      
      // Portfolio summary
      if (activePositions > 0) {
        resultText += `## Portfolio Summary\n\n`;
        resultText += `- **Active Positions**: ${activePositions}\n`;
        resultText += `- **Total Current Value**: $${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n`;
        resultText += `- **Total Unrealized P&L**: ${totalPnL >= 0 ? '🟢' : '🔴'} $${totalPnL.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n`;
        resultText += `- **Total Realized P&L**: ${totalRealizedPnL >= 0 ? '🟢' : '🔴'} $${totalRealizedPnL.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n\n`;
      }
      
      if (filteredPositions.length === 0) {
        resultText += "No positions found matching the specified criteria.";
      } else {
        resultText += `## Position Details\n\n`;
        
        filteredPositions.forEach((position: any, index: number) => {
          resultText += `### ${index + 1}. ${position.marketQuestion}\n\n`;
          resultText += `- **Market ID**: ${position.marketId}\n`;
          resultText += `- **Outcome**: ${position.outcome}\n`;
          resultText += `- **Position Size**: ${position.size.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})} shares\n`;
          resultText += `- **Average Price**: $${position.avgPrice.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}\n`;
          resultText += `- **Current Price**: $${position.currentPrice.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}\n`;
          resultText += `- **Initial Value**: $${position.initialValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n`;
          resultText += `- **Current Value**: $${position.currentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n`;
          
          const pnlIcon = position.pnl >= 0 ? '🟢' : '🔴';
          resultText += `- **Unrealized P&L**: ${pnlIcon} $${position.pnl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${position.pnlPercent.toFixed(2)}%)\n`;
          
          if (position.realizedPnl !== 0) {
            const realizedIcon = position.realizedPnl >= 0 ? '🟢' : '🔴';
            resultText += `- **Realized P&L**: ${realizedIcon} $${position.realizedPnl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n`;
          }
          
          resultText += `- **Total Bought**: $${position.totalBought.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n`;
          resultText += `- **Redeemable**: ${position.redeemable ? '✅ Yes' : '❌ No'}\n`;
          resultText += `- **Asset ID**: ${position.asset}\n`;
          resultText += `\n---\n\n`;
        });

        // Add pagination info
        if (positions.length === limit) {
          resultText += `\n*Showing ${limit} results. Use offset=${offset + limit} to see more.*\n`;
        }
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
          text: `❌ Failed to fetch user positions: ${error.message}`
        }],
        isError: true
      };
    }
  }
};