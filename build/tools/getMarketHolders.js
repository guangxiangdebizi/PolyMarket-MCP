import { polymarketClient } from '../lib/polymarketClient.js';
export const getMarketHolders = {
    name: "get_market_holders",
    description: "Retrieve holders and their positions for a specific market. Shows who owns shares and their holding amounts.",
    parameters: {
        type: "object",
        properties: {
            market_id: {
                type: "string",
                description: "Market ID to get holders for"
            },
            token_id: {
                type: "string",
                description: "Specific token/outcome ID within the market"
            },
            limit: {
                type: "number",
                description: "Maximum number of holders to return (default: 50, max: 100)",
                default: 50
            },
            offset: {
                type: "number",
                description: "Number of holders to skip for pagination (default: 0)",
                default: 0
            },
            min_balance: {
                type: "number",
                description: "Minimum balance threshold to include holders"
            },
            order_by: {
                type: "string",
                description: "Field to sort by (balance, percentage)",
                enum: ["balance", "percentage"],
                default: "balance"
            },
            order_direction: {
                type: "string",
                description: "Sort direction (ASC or DESC)",
                enum: ["ASC", "DESC"],
                default: "DESC"
            },
            include_user_info: {
                type: "boolean",
                description: "Include additional user information if available (default: true)",
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
            const limit = Math.min(args.limit || 50, 100);
            const offset = Math.max(args.offset || 0, 0);
            const includeUserInfo = args.include_user_info !== false;
            // Build query parameters
            const params = {
                limit,
                offset,
                order_by: args.order_by || 'balance',
                order_direction: args.order_direction || 'DESC'
            };
            if (args.market_id)
                params.market_id = args.market_id;
            if (args.token_id)
                params.token_id = args.token_id;
            if (args.min_balance)
                params.min_balance = args.min_balance;
            // Fetch market holders data
            const holdersData = await polymarketClient.getMarketHolders(params);
            const holders = holdersData.holders || [];
            const marketInfo = holdersData.market || {};
            // Calculate statistics
            const totalHolders = holders.length;
            const totalShares = holders.reduce((sum, holder) => sum + Number(holder.balance || 0), 0);
            const avgHolding = totalHolders > 0 ? totalShares / totalHolders : 0;
            // Calculate concentration metrics
            const sortedHolders = [...holders].sort((a, b) => Number(b.balance || 0) - Number(a.balance || 0));
            const top10Holdings = sortedHolders.slice(0, 10).reduce((sum, holder) => sum + Number(holder.balance || 0), 0);
            const top10Percentage = totalShares > 0 ? (top10Holdings / totalShares) * 100 : 0;
            const formattedHolders = holders.map((holder, index) => {
                const balance = Number(holder.balance || 0);
                const percentage = totalShares > 0 ? (balance / totalShares) * 100 : 0;
                return {
                    rank: offset + index + 1,
                    address: holder.proxy_wallet || holder.address,
                    balance: balance,
                    percentage: percentage,
                    bio: holder.bio || null,
                    alias: holder.alias || null,
                    avatar: holder.avatar || null,
                    isVerified: holder.verified || false,
                    tokenId: holder.asset_id || holder.token_id
                };
            });
            let resultText = `# Market Holders\n\n`;
            if (args.market_id) {
                resultText += `**Market ID**: ${args.market_id}\n`;
                if (marketInfo.question) {
                    resultText += `**Market Question**: ${marketInfo.question}\n`;
                }
            }
            if (args.token_id) {
                resultText += `**Token ID**: ${args.token_id}\n`;
            }
            resultText += `\n`;
            // Holder statistics
            resultText += `## Holder Statistics\n\n`;
            resultText += `- **Total Holders**: ${totalHolders.toLocaleString()}\n`;
            resultText += `- **Total Shares**: ${totalShares.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
            resultText += `- **Average Holding**: ${avgHolding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} shares\n`;
            resultText += `- **Top 10 Concentration**: ${top10Percentage.toFixed(2)}%\n`;
            if (sortedHolders.length > 0) {
                const largestHolding = Number(sortedHolders[0].balance || 0);
                const largestPercentage = totalShares > 0 ? (largestHolding / totalShares) * 100 : 0;
                resultText += `- **Largest Holder**: ${largestPercentage.toFixed(2)}% (${largestHolding.toLocaleString()} shares)\n`;
            }
            // Concentration assessment
            let concentrationLevel = '';
            if (top10Percentage > 80) {
                concentrationLevel = '🔴 Very High (Concentrated ownership)';
            }
            else if (top10Percentage > 60) {
                concentrationLevel = '🟠 High (Somewhat concentrated)';
            }
            else if (top10Percentage > 40) {
                concentrationLevel = '🟡 Moderate (Balanced distribution)';
            }
            else {
                concentrationLevel = '🟢 Low (Well distributed)';
            }
            resultText += `- **Concentration Level**: ${concentrationLevel}\n\n`;
            if (formattedHolders.length === 0) {
                resultText += "No holders found matching the specified criteria.";
            }
            else {
                resultText += `## Top Holders\n\n`;
                formattedHolders.forEach((holder, index) => {
                    resultText += `### ${holder.rank}. ${holder.alias || `${holder.address.slice(0, 6)}...${holder.address.slice(-4)}`}\n\n`;
                    if (includeUserInfo && holder.alias) {
                        resultText += `- **Address**: ${holder.address.slice(0, 6)}...${holder.address.slice(-4)}\n`;
                        if (holder.bio)
                            resultText += `- **Bio**: ${holder.bio}\n`;
                        if (holder.isVerified)
                            resultText += `- **Status**: ✅ Verified\n`;
                    }
                    else {
                        resultText += `- **Address**: ${holder.address}\n`;
                    }
                    resultText += `- **Holdings**: ${holder.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} shares\n`;
                    resultText += `- **Percentage**: ${holder.percentage.toFixed(4)}%\n`;
                    // Visual representation of holding size
                    const barLength = Math.min(Math.floor(holder.percentage * 2), 20);
                    const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
                    resultText += `- **Share**: \`${bar}\` ${holder.percentage.toFixed(2)}%\n`;
                    if (holder.tokenId) {
                        resultText += `- **Token ID**: ${holder.tokenId}\n`;
                    }
                    resultText += `\n---\n\n`;
                });
                // Distribution analysis
                if (formattedHolders.length >= 5) {
                    resultText += `## Distribution Analysis\n\n`;
                    // Whale analysis (>5% holders)
                    const whales = formattedHolders.filter((h) => h.percentage > 5);
                    const whaleShares = whales.reduce((sum, h) => sum + h.balance, 0);
                    const whalePercentage = totalShares > 0 ? (whaleShares / totalShares) * 100 : 0;
                    resultText += `- **Whales (>5%)**: ${whales.length} holders (${whalePercentage.toFixed(2)}% of supply)\n`;
                    // Large holders analysis (1-5%)
                    const largeHolders = formattedHolders.filter((h) => h.percentage > 1 && h.percentage <= 5);
                    const largeHolderShares = largeHolders.reduce((sum, h) => sum + h.balance, 0);
                    const largeHolderPercentage = totalShares > 0 ? (largeHolderShares / totalShares) * 100 : 0;
                    resultText += `- **Large Holders (1-5%)**: ${largeHolders.length} holders (${largeHolderPercentage.toFixed(2)}% of supply)\n`;
                    // Medium holders analysis (0.1-1%)
                    const mediumHolders = formattedHolders.filter((h) => h.percentage > 0.1 && h.percentage <= 1);
                    const mediumHolderShares = mediumHolders.reduce((sum, h) => sum + h.balance, 0);
                    const mediumHolderPercentage = totalShares > 0 ? (mediumHolderShares / totalShares) * 100 : 0;
                    resultText += `- **Medium Holders (0.1-1%)**: ${mediumHolders.length} holders (${mediumHolderPercentage.toFixed(2)}% of supply)\n`;
                    // Small holders analysis (<0.1%)
                    const smallHolders = formattedHolders.filter((h) => h.percentage <= 0.1);
                    const smallHolderShares = smallHolders.reduce((sum, h) => sum + h.balance, 0);
                    const smallHolderPercentage = totalShares > 0 ? (smallHolderShares / totalShares) * 100 : 0;
                    resultText += `- **Small Holders (<0.1%)**: ${smallHolders.length} holders (${smallHolderPercentage.toFixed(2)}% of supply)\n\n`;
                }
                // Add pagination info
                if (holders.length === limit) {
                    resultText += `\n*Showing ${limit} results. Use offset=${offset + limit} to see more.*\n`;
                }
            }
            // Add data timestamp
            resultText += `\n---\n\n`;
            resultText += `*Holder data as of ${new Date().toLocaleString()}*\n`;
            if (args.min_balance) {
                resultText += `*Filtered by minimum balance: ${args.min_balance} shares*\n`;
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
                        text: `❌ Failed to fetch market holders: ${error.message}`
                    }],
                isError: true
            };
        }
    }
};
//# sourceMappingURL=getMarketHolders.js.map