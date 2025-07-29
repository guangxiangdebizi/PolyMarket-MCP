import { polymarketClient } from '../lib/polymarketClient.js';

export const getUserActivity = {
  name: "get_user_activity",
  description: "Retrieve user's on-chain activity history including trades, splits, merges, redeems, rewards, and conversions.",
  parameters: {
    type: "object",
    properties: {
      user_address: {
        type: "string",
        description: "User's wallet address (proxy wallet address)"
      },
      limit: {
        type: "number",
        description: "Maximum number of activities to return (default: 50, max: 100)",
        default: 50
      },
      offset: {
        type: "number",
        description: "Number of activities to skip for pagination (default: 0)",
        default: 0
      },
      activity_type: {
        type: "string",
        description: "Filter by activity type",
        enum: ["TRADE", "SPLIT", "MERGE", "REDEEM", "REWARD", "CONVERSION"]
      },
      side: {
        type: "string",
        description: "Filter trades by side (BUY or SELL)",
        enum: ["BUY", "SELL"]
      },
      market_id: {
        type: "string",
        description: "Filter activities by specific market ID"
      },
      asset_id: {
        type: "string",
        description: "Filter activities by specific asset/token ID"
      },
      order_by: {
        type: "string",
        description: "Field to sort by (timestamp, amount, price)",
        enum: ["timestamp", "amount", "price"],
        default: "timestamp"
      },
      order_direction: {
        type: "string",
        description: "Sort direction (ASC or DESC)",
        enum: ["ASC", "DESC"],
        default: "DESC"
      },
      start_date: {
        type: "string",
        description: "Start date filter (ISO 8601 format: YYYY-MM-DD)"
      },
      end_date: {
        type: "string",
        description: "End date filter (ISO 8601 format: YYYY-MM-DD)"
      }
    },
    required: ["user_address"]
  },

  async run(args: {
    user_address: string;
    limit?: number;
    offset?: number;
    activity_type?: string;
    side?: string;
    market_id?: string;
    asset_id?: string;
    order_by?: string;
    order_direction?: string;
    start_date?: string;
    end_date?: string;
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
        offset,
        order_by: args.order_by || 'timestamp',
        order_direction: args.order_direction || 'DESC'
      };

      if (args.activity_type) params.activity_type = args.activity_type;
      if (args.side) params.side = args.side;
      if (args.market_id) params.market_id = args.market_id;
      if (args.asset_id) params.asset_id = args.asset_id;
      if (args.start_date) params.start_date = args.start_date;
      if (args.end_date) params.end_date = args.end_date;

      // Fetch user activity
      const activities = await polymarketClient.getUserActivity(params);

      // Calculate statistics
      const stats = {
        totalActivities: activities.length,
        trades: activities.filter((a: any) => a.activity_type === 'TRADE').length,
        buys: activities.filter((a: any) => a.activity_type === 'TRADE' && a.side === 'BUY').length,
        sells: activities.filter((a: any) => a.activity_type === 'TRADE' && a.side === 'SELL').length,
        splits: activities.filter((a: any) => a.activity_type === 'SPLIT').length,
        merges: activities.filter((a: any) => a.activity_type === 'MERGE').length,
        redeems: activities.filter((a: any) => a.activity_type === 'REDEEM').length,
        rewards: activities.filter((a: any) => a.activity_type === 'REWARD').length,
        conversions: activities.filter((a: any) => a.activity_type === 'CONVERSION').length,
        totalVolume: activities
          .filter((a: any) => a.activity_type === 'TRADE')
          .reduce((sum: number, a: any) => sum + Number(a.amount || 0), 0)
      };

      const formattedActivities = activities.map((activity: any) => {
        const timestamp = new Date(activity.timestamp);
        const amount = Number(activity.amount || 0);
        const price = Number(activity.price || 0);
        const value = amount * price;

        return {
          id: activity.id,
          type: activity.activity_type,
          side: activity.side,
          timestamp: timestamp,
          marketId: activity.market_id,
          marketQuestion: activity.market?.question || 'Unknown Market',
          assetId: activity.asset_id,
          outcome: activity.outcome || 'Unknown',
          amount: amount,
          price: price,
          value: value,
          txHash: activity.tx_hash,
          blockNumber: activity.block_number,
          gasUsed: activity.gas_used,
          gasFee: Number(activity.gas_fee || 0)
        };
      });

      const summary = `Found ${activities.length} activities for user ${args.user_address.slice(0, 6)}...${args.user_address.slice(-4)}`;
      
      let resultText = `# User Activity History\n\n${summary}\n\n`;
      
      // Activity statistics
      resultText += `## Activity Summary\n\n`;
      resultText += `- **Total Activities**: ${stats.totalActivities}\n`;
      resultText += `- **Trades**: ${stats.trades} (${stats.buys} buys, ${stats.sells} sells)\n`;
      if (stats.splits > 0) resultText += `- **Splits**: ${stats.splits}\n`;
      if (stats.merges > 0) resultText += `- **Merges**: ${stats.merges}\n`;
      if (stats.redeems > 0) resultText += `- **Redeems**: ${stats.redeems}\n`;
      if (stats.rewards > 0) resultText += `- **Rewards**: ${stats.rewards}\n`;
      if (stats.conversions > 0) resultText += `- **Conversions**: ${stats.conversions}\n`;
      if (stats.totalVolume > 0) {
        resultText += `- **Total Trade Volume**: $${stats.totalVolume.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n`;
      }
      resultText += `\n`;
      
      if (formattedActivities.length === 0) {
        resultText += "No activities found matching the specified criteria.";
      } else {
        resultText += `## Activity Details\n\n`;
        
        formattedActivities.forEach((activity: any, index: number) => {
          const typeIcon = ({
            'TRADE': activity.side === 'BUY' ? '🟢 📈' : '🔴 📉',
            'SPLIT': '✂️',
            'MERGE': '🔗',
            'REDEEM': '💰',
            'REWARD': '🎁',
            'CONVERSION': '🔄'
          } as any)[activity.type] || '📊';

          resultText += `### ${index + 1}. ${typeIcon} ${activity.type}${activity.side ? ` (${activity.side})` : ''}\n\n`;
          resultText += `- **Time**: ${activity.timestamp.toLocaleString()}\n`;
          resultText += `- **Market**: ${activity.marketQuestion}\n`;
          if (activity.outcome !== 'Unknown') resultText += `- **Outcome**: ${activity.outcome}\n`;
          
          if (activity.type === 'TRADE') {
            resultText += `- **Amount**: ${activity.amount.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})} shares\n`;
            resultText += `- **Price**: $${activity.price.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}\n`;
            resultText += `- **Total Value**: $${activity.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n`;
          } else if (activity.amount > 0) {
            resultText += `- **Amount**: ${activity.amount.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}\n`;
          }
          
          resultText += `- **Transaction**: [${activity.txHash?.slice(0, 10)}...](https://polygonscan.com/tx/${activity.txHash})\n`;
          if (activity.blockNumber) resultText += `- **Block**: ${activity.blockNumber}\n`;
          if (activity.gasFee > 0) {
            resultText += `- **Gas Fee**: $${activity.gasFee.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4})}\n`;
          }
          resultText += `- **Market ID**: ${activity.marketId}\n`;
          resultText += `- **Asset ID**: ${activity.assetId}\n`;
          resultText += `\n---\n\n`;
        });

        // Add pagination info
        if (activities.length === limit) {
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
          text: `❌ Failed to fetch user activity: ${error.message}`
        }],
        isError: true
      };
    }
  }
};