import { polymarketClient } from '../lib/polymarketClient.js';
export const getOrderBook = {
    name: "get_order_book",
    description: "Retrieve current order book data showing bids and asks for a specific market or token. Shows market depth and liquidity.",
    parameters: {
        type: "object",
        properties: {
            market_id: {
                type: "string",
                description: "Market ID to get order book for"
            },
            token_id: {
                type: "string",
                description: "Token/asset ID to get order book for"
            },
            depth: {
                type: "number",
                description: "Number of price levels to show for bids and asks (default: 10, max: 50)",
                default: 10
            },
            include_spread_analysis: {
                type: "boolean",
                description: "Include bid-ask spread analysis (default: true)",
                default: true
            },
            include_liquidity_analysis: {
                type: "boolean",
                description: "Include liquidity depth analysis (default: true)",
                default: true
            }
        },
        required: []
    },
    async run(args) {
        try {
            // Parameter validation
            if (!args.market_id && !args.token_id) {
                throw new Error("Either market_id or token_id must be provided");
            }
            const depth = Math.min(args.depth || 10, 50);
            const includeSpreadAnalysis = args.include_spread_analysis !== false;
            const includeLiquidityAnalysis = args.include_liquidity_analysis !== false;
            // Build query parameters
            const params = {};
            if (args.market_id)
                params.market = args.market_id;
            if (args.token_id)
                params.token_id = args.token_id;
            // Fetch order book data
            const orderBook = await polymarketClient.getOrderBook(params);
            const bids = (orderBook.bids || []).slice(0, depth);
            const asks = (orderBook.asks || []).slice(0, depth);
            let resultText = `# Order Book\n\n`;
            if (args.market_id) {
                resultText += `**Market ID**: ${args.market_id}\n\n`;
            }
            if (args.token_id) {
                resultText += `**Token ID**: ${args.token_id}\n\n`;
            }
            // Market status and spread analysis
            if (includeSpreadAnalysis && bids.length > 0 && asks.length > 0) {
                const bestBid = Number(bids[0].price);
                const bestAsk = Number(asks[0].price);
                const spread = bestAsk - bestBid;
                const spreadPercent = (spread / bestBid) * 100;
                const midPrice = (bestBid + bestAsk) / 2;
                resultText += `## Market Status\n\n`;
                resultText += `- **Best Bid**: $${bestBid.toFixed(4)}\n`;
                resultText += `- **Best Ask**: $${bestAsk.toFixed(4)}\n`;
                resultText += `- **Spread**: $${spread.toFixed(4)} (${spreadPercent.toFixed(2)}%)\n`;
                resultText += `- **Mid Price**: $${midPrice.toFixed(4)}\n`;
                // Spread quality assessment
                let spreadQuality = '';
                if (spreadPercent < 0.5) {
                    spreadQuality = '🟢 Excellent (Very tight spread)';
                }
                else if (spreadPercent < 1.0) {
                    spreadQuality = '🟡 Good (Reasonable spread)';
                }
                else if (spreadPercent < 2.0) {
                    spreadQuality = '🟠 Fair (Wide spread)';
                }
                else {
                    spreadQuality = '🔴 Poor (Very wide spread)';
                }
                resultText += `- **Spread Quality**: ${spreadQuality}\n\n`;
            }
            // Liquidity analysis
            if (includeLiquidityAnalysis) {
                const bidLiquidity = bids.reduce((sum, bid) => sum + Number(bid.size || 0), 0);
                const askLiquidity = asks.reduce((sum, ask) => sum + Number(ask.size || 0), 0);
                const totalLiquidity = bidLiquidity + askLiquidity;
                const bidValue = bids.reduce((sum, bid) => sum + (Number(bid.size || 0) * Number(bid.price || 0)), 0);
                const askValue = asks.reduce((sum, ask) => sum + (Number(ask.size || 0) * Number(ask.price || 0)), 0);
                const totalValue = bidValue + askValue;
                resultText += `## Liquidity Analysis\n\n`;
                resultText += `- **Total Liquidity**: ${totalLiquidity.toLocaleString()} shares\n`;
                resultText += `- **Bid Liquidity**: ${bidLiquidity.toLocaleString()} shares (${((bidLiquidity / totalLiquidity) * 100).toFixed(1)}%)\n`;
                resultText += `- **Ask Liquidity**: ${askLiquidity.toLocaleString()} shares (${((askLiquidity / totalLiquidity) * 100).toFixed(1)}%)\n`;
                resultText += `- **Total Value**: $${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
                // Liquidity balance assessment
                const liquidityRatio = bidLiquidity / askLiquidity;
                let liquidityBalance = '';
                if (liquidityRatio > 0.8 && liquidityRatio < 1.2) {
                    liquidityBalance = '🟢 Well balanced';
                }
                else if (liquidityRatio > 0.6 && liquidityRatio < 1.4) {
                    liquidityBalance = '🟡 Moderately balanced';
                }
                else {
                    liquidityBalance = liquidityRatio > 1 ? '🟠 Bid heavy' : '🟠 Ask heavy';
                }
                resultText += `- **Liquidity Balance**: ${liquidityBalance}\n\n`;
            }
            // Order book display
            resultText += `## Order Book (Top ${depth} levels)\n\n`;
            // Asks (sell orders) - display in reverse order (highest price first)
            if (asks.length > 0) {
                resultText += `### 🔴 Asks (Sell Orders)\n\n`;
                resultText += `| Price | Size | Total Value |\n`;
                resultText += `|-------|------|-------------|\n`;
                asks.slice().reverse().forEach((ask) => {
                    const price = Number(ask.price);
                    const size = Number(ask.size);
                    const value = price * size;
                    resultText += `| $${price.toFixed(4)} | ${size.toLocaleString()} | $${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} |\n`;
                });
                resultText += `\n`;
            }
            else {
                resultText += `### 🔴 Asks (Sell Orders)\n\nNo ask orders available.\n\n`;
            }
            // Spread indicator
            if (bids.length > 0 && asks.length > 0) {
                const spread = Number(asks[0].price) - Number(bids[0].price);
                resultText += `**--- SPREAD: $${spread.toFixed(4)} ---**\n\n`;
            }
            // Bids (buy orders)
            if (bids.length > 0) {
                resultText += `### 🟢 Bids (Buy Orders)\n\n`;
                resultText += `| Price | Size | Total Value |\n`;
                resultText += `|-------|------|-------------|\n`;
                bids.forEach((bid) => {
                    const price = Number(bid.price);
                    const size = Number(bid.size);
                    const value = price * size;
                    resultText += `| $${price.toFixed(4)} | ${size.toLocaleString()} | $${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} |\n`;
                });
                resultText += `\n`;
            }
            else {
                resultText += `### 🟢 Bids (Buy Orders)\n\nNo bid orders available.\n\n`;
            }
            // Cumulative depth analysis
            if (includeLiquidityAnalysis && (bids.length > 0 || asks.length > 0)) {
                resultText += `## Cumulative Depth\n\n`;
                if (bids.length > 0) {
                    resultText += `### Bid Depth\n\n`;
                    let cumulativeSize = 0;
                    let cumulativeValue = 0;
                    bids.slice(0, 5).forEach((bid, index) => {
                        const price = Number(bid.price);
                        const size = Number(bid.size);
                        cumulativeSize += size;
                        cumulativeValue += price * size;
                        resultText += `**Level ${index + 1}**: Up to $${price.toFixed(4)} → ${cumulativeSize.toLocaleString()} shares ($${cumulativeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})\n`;
                    });
                    resultText += `\n`;
                }
                if (asks.length > 0) {
                    resultText += `### Ask Depth\n\n`;
                    let cumulativeSize = 0;
                    let cumulativeValue = 0;
                    asks.slice(0, 5).forEach((ask, index) => {
                        const price = Number(ask.price);
                        const size = Number(ask.size);
                        cumulativeSize += size;
                        cumulativeValue += price * size;
                        resultText += `**Level ${index + 1}**: From $${price.toFixed(4)} → ${cumulativeSize.toLocaleString()} shares ($${cumulativeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})\n`;
                    });
                    resultText += `\n`;
                }
            }
            // Add timestamp and data info
            resultText += `---\n\n`;
            resultText += `*Order book data as of ${new Date().toLocaleString()}*\n`;
            resultText += `*Showing top ${depth} price levels*\n`;
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
                        text: `❌ Failed to fetch order book: ${error.message}`
                    }],
                isError: true
            };
        }
    }
};
//# sourceMappingURL=getOrderBook.js.map