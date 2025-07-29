import { polymarketClient } from '../lib/polymarketClient.js';
export const getTrades = {
    name: "get_trades",
    description: "Retrieve recent trades and trading history from Polymarket. Shows executed trades with prices, volumes, and market information.",
    parameters: {
        type: "object",
        properties: {
            limit: {
                type: "number",
                description: "Maximum number of trades to return (default: 50, max: 100)",
                default: 50
            },
            offset: {
                type: "number",
                description: "Number of trades to skip for pagination (default: 0)",
                default: 0
            },
            market_id: {
                type: "string",
                description: "Filter trades by specific market ID"
            },
            asset_id: {
                type: "string",
                description: "Filter trades by specific asset/token ID"
            },
            user_address: {
                type: "string",
                description: "Filter trades by specific user address"
            },
            side: {
                type: "string",
                description: "Filter trades by side (BUY or SELL)",
                enum: ["BUY", "SELL"]
            },
            min_size: {
                type: "number",
                description: "Minimum trade size threshold"
            },
            max_size: {
                type: "number",
                description: "Maximum trade size threshold"
            },
            min_price: {
                type: "number",
                description: "Minimum price threshold"
            },
            max_price: {
                type: "number",
                description: "Maximum price threshold"
            },
            start_date: {
                type: "string",
                description: "Start date filter (ISO 8601 format: YYYY-MM-DD)"
            },
            end_date: {
                type: "string",
                description: "End date filter (ISO 8601 format: YYYY-MM-DD)"
            },
            order_by: {
                type: "string",
                description: "Field to sort by (timestamp, size, price)",
                enum: ["timestamp", "size", "price"],
                default: "timestamp"
            },
            order_direction: {
                type: "string",
                description: "Sort direction (ASC or DESC)",
                enum: ["ASC", "DESC"],
                default: "DESC"
            }
        },
        required: []
    },
    async run(args) {
        try {
            const limit = Math.min(args.limit || 50, 100);
            const offset = Math.max(args.offset || 0, 0);
            // Build query parameters
            const params = {
                limit,
                offset,
                order_by: args.order_by || 'timestamp',
                order_direction: args.order_direction || 'DESC'
            };
            if (args.market_id)
                params.market_id = args.market_id;
            if (args.asset_id)
                params.asset_id = args.asset_id;
            if (args.user_address)
                params.user_address = args.user_address;
            if (args.side)
                params.side = args.side;
            if (args.min_size)
                params.min_size = args.min_size;
            if (args.max_size)
                params.max_size = args.max_size;
            if (args.min_price)
                params.min_price = args.min_price;
            if (args.max_price)
                params.max_price = args.max_price;
            if (args.start_date)
                params.start_date = args.start_date;
            if (args.end_date)
                params.end_date = args.end_date;
            // Fetch trades data
            const trades = await polymarketClient.getTrades(params);
            // Calculate trading statistics
            const stats = {
                totalTrades: trades.length,
                buyTrades: trades.filter((t) => t.side === 'BUY').length,
                sellTrades: trades.filter((t) => t.side === 'SELL').length,
                totalVolume: trades.reduce((sum, t) => sum + Number(t.size || 0), 0),
                totalValue: trades.reduce((sum, t) => sum + (Number(t.size || 0) * Number(t.price || 0)), 0),
                avgPrice: 0,
                avgSize: 0,
                uniqueMarkets: new Set(trades.map((t) => t.market_id)).size,
                uniqueUsers: new Set(trades.map((t) => t.user_address)).size
            };
            if (trades.length > 0) {
                stats.avgPrice = trades.reduce((sum, t) => sum + Number(t.price || 0), 0) / trades.length;
                stats.avgSize = stats.totalVolume / trades.length;
            }
            const formattedTrades = trades.map((trade) => {
                const timestamp = new Date(trade.timestamp);
                const size = Number(trade.size || 0);
                const price = Number(trade.price || 0);
                const value = size * price;
                return {
                    id: trade.id,
                    timestamp: timestamp,
                    side: trade.side,
                    marketId: trade.market_id,
                    marketQuestion: trade.market?.question || 'Unknown Market',
                    assetId: trade.asset_id,
                    outcome: trade.outcome || 'Unknown',
                    size: size,
                    price: price,
                    value: value,
                    userAddress: trade.user_address,
                    txHash: trade.tx_hash,
                    blockNumber: trade.block_number,
                    makerAddress: trade.maker_address,
                    takerAddress: trade.taker_address,
                    feeRateBps: trade.fee_rate_bps,
                    makerFee: Number(trade.maker_fee || 0),
                    takerFee: Number(trade.taker_fee || 0)
                };
            });
            let filterDescription = '';
            if (args.market_id)
                filterDescription += ` for market ${args.market_id}`;
            if (args.user_address)
                filterDescription += ` by user ${args.user_address.slice(0, 6)}...${args.user_address.slice(-4)}`;
            if (args.side)
                filterDescription += ` (${args.side} only)`;
            if (args.start_date || args.end_date) {
                filterDescription += ` from ${args.start_date || 'earliest'} to ${args.end_date || 'latest'}`;
            }
            const summary = `Found ${trades.length} trades${filterDescription}.`;
            let resultText = `# Trading History\n\n${summary}\n\n`;
            // Trading statistics
            if (stats.totalTrades > 0) {
                resultText += `## Trading Statistics\n\n`;
                resultText += `- **Total Trades**: ${stats.totalTrades}\n`;
                resultText += `- **Buy Trades**: 🟢 ${stats.buyTrades} (${((stats.buyTrades / stats.totalTrades) * 100).toFixed(1)}%)\n`;
                resultText += `- **Sell Trades**: 🔴 ${stats.sellTrades} (${((stats.sellTrades / stats.totalTrades) * 100).toFixed(1)}%)\n`;
                resultText += `- **Total Volume**: ${stats.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} shares\n`;
                resultText += `- **Total Value**: $${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
                resultText += `- **Average Price**: $${stats.avgPrice.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}\n`;
                resultText += `- **Average Size**: ${stats.avgSize.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} shares\n`;
                resultText += `- **Unique Markets**: ${stats.uniqueMarkets}\n`;
                if (!args.user_address) {
                    resultText += `- **Unique Traders**: ${stats.uniqueUsers}\n`;
                }
                resultText += `\n`;
            }
            if (formattedTrades.length === 0) {
                resultText += "No trades found matching the specified criteria.";
            }
            else {
                resultText += `## Trade Details\n\n`;
                formattedTrades.forEach((trade, index) => {
                    const sideIcon = trade.side === 'BUY' ? '🟢 📈' : '🔴 📉';
                    resultText += `### ${index + 1}. ${sideIcon} ${trade.side} Trade\n\n`;
                    resultText += `- **Time**: ${trade.timestamp.toLocaleString()}\n`;
                    resultText += `- **Market**: ${trade.marketQuestion}\n`;
                    resultText += `- **Outcome**: ${trade.outcome}\n`;
                    resultText += `- **Size**: ${trade.size.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} shares\n`;
                    resultText += `- **Price**: $${trade.price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}\n`;
                    resultText += `- **Total Value**: $${trade.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
                    if (!args.user_address) {
                        resultText += `- **Trader**: ${trade.userAddress?.slice(0, 6)}...${trade.userAddress?.slice(-4)}\n`;
                    }
                    if (trade.makerAddress && trade.takerAddress) {
                        resultText += `- **Maker**: ${trade.makerAddress.slice(0, 6)}...${trade.makerAddress.slice(-4)}\n`;
                        resultText += `- **Taker**: ${trade.takerAddress.slice(0, 6)}...${trade.takerAddress.slice(-4)}\n`;
                    }
                    // Show fees if available
                    if (trade.makerFee > 0 || trade.takerFee > 0) {
                        const totalFees = trade.makerFee + trade.takerFee;
                        resultText += `- **Fees**: $${totalFees.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}\n`;
                        if (trade.feeRateBps) {
                            resultText += `- **Fee Rate**: ${(trade.feeRateBps / 100).toFixed(2)}%\n`;
                        }
                    }
                    resultText += `- **Transaction**: [${trade.txHash?.slice(0, 10)}...](https://polygonscan.com/tx/${trade.txHash})\n`;
                    if (trade.blockNumber)
                        resultText += `- **Block**: ${trade.blockNumber}\n`;
                    resultText += `- **Market ID**: ${trade.marketId}\n`;
                    resultText += `- **Asset ID**: ${trade.assetId}\n`;
                    resultText += `\n---\n\n`;
                });
                // Add pagination info
                if (trades.length === limit) {
                    resultText += `\n*Showing ${limit} results. Use offset=${offset + limit} to see more.*\n`;
                }
            }
            return {
                content: [{
                        type: "text",
                        text: resultText
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: `❌ Failed to fetch trades: ${error.message}`
                    }],
                isError: true
            };
        }
    }
};
//# sourceMappingURL=getTrades.js.map