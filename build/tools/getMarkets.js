import { polymarketClient } from '../lib/polymarketClient.js';
export const getMarkets = {
    name: "get_markets",
    description: "Retrieve Polymarket prediction markets with filtering and pagination options. Get market data including prices, volume, liquidity, and metadata.",
    parameters: {
        type: "object",
        properties: {
            limit: {
                type: "number",
                description: "Maximum number of markets to return (default: 20, max: 100)",
                default: 20
            },
            offset: {
                type: "number",
                description: "Number of markets to skip for pagination (default: 0)",
                default: 0
            },
            active: {
                type: "boolean",
                description: "Filter by active status - true for active markets only"
            },
            closed: {
                type: "boolean",
                description: "Filter by closed status - false to exclude closed markets"
            },
            archived: {
                type: "boolean",
                description: "Filter by archived status - false to exclude archived markets"
            },
            order: {
                type: "string",
                description: "Field to sort by (volume, liquidity, start_date, end_date)",
                enum: ["volume", "liquidity", "start_date", "end_date"]
            },
            ascending: {
                type: "boolean",
                description: "Sort direction - true for ascending, false for descending (default: false)",
                default: false
            },
            search: {
                type: "string",
                description: "Search term to filter markets by title or description"
            },
            tag_id: {
                type: "number",
                description: "Filter markets by specific tag/category ID"
            },
            liquidity_min: {
                type: "number",
                description: "Minimum liquidity threshold in USDC"
            },
            volume_min: {
                type: "number",
                description: "Minimum volume threshold in USDC"
            }
        },
        required: []
    },
    async run(args) {
        try {
            // Parameter validation
            const limit = Math.min(args.limit || 20, 100);
            const offset = Math.max(args.offset || 0, 0);
            // Build query parameters
            const params = {
                limit,
                offset
            };
            if (args.active !== undefined)
                params.active = args.active;
            if (args.closed !== undefined)
                params.closed = args.closed;
            if (args.archived !== undefined)
                params.archived = args.archived;
            if (args.order) {
                params.order = args.order;
                params.ascending = args.ascending !== undefined ? args.ascending : false;
            }
            if (args.search)
                params.search = args.search;
            if (args.tag_id)
                params.tag_id = args.tag_id;
            if (args.liquidity_min)
                params.liquidity_num_min = args.liquidity_min;
            if (args.volume_min)
                params.volume_num_min = args.volume_min;
            // Fetch markets data
            const markets = await polymarketClient.getMarkets(params);
            // Format response
            const formattedMarkets = markets.map((market) => ({
                id: market.id,
                slug: market.slug,
                question: market.question,
                description: market.description,
                image: market.image,
                active: market.active,
                closed: market.closed,
                archived: market.archived,
                volume: market.volume ? `$${Number(market.volume).toLocaleString()}` : 'N/A',
                liquidity: market.liquidity ? `$${Number(market.liquidity).toLocaleString()}` : 'N/A',
                startDate: market.start_date,
                endDate: market.end_date,
                outcomes: market.outcomes || [],
                tags: market.tags || [],
                conditionId: market.condition_id,
                marketMakerAddress: market.market_maker_address,
                enableOrderBook: market.enable_order_book
            }));
            const summary = `Found ${markets.length} markets${args.search ? ` matching "${args.search}"` : ''}${args.active ? ' (active only)' : ''}${args.closed === false ? ' (excluding closed)' : ''}.`;
            let resultText = `# Polymarket Markets\n\n${summary}\n\n`;
            if (formattedMarkets.length === 0) {
                resultText += "No markets found matching the specified criteria.";
            }
            else {
                formattedMarkets.forEach((market, index) => {
                    resultText += `## ${index + 1}. ${market.question}\n\n`;
                    resultText += `- **Market ID**: ${market.id}\n`;
                    resultText += `- **Slug**: ${market.slug}\n`;
                    resultText += `- **Status**: ${market.active ? '🟢 Active' : '🔴 Inactive'}${market.closed ? ' (Closed)' : ''}${market.archived ? ' (Archived)' : ''}\n`;
                    resultText += `- **Volume**: ${market.volume}\n`;
                    resultText += `- **Liquidity**: ${market.liquidity}\n`;
                    if (market.startDate)
                        resultText += `- **Start Date**: ${new Date(market.startDate).toLocaleDateString()}\n`;
                    if (market.endDate)
                        resultText += `- **End Date**: ${new Date(market.endDate).toLocaleDateString()}\n`;
                    if (market.description)
                        resultText += `- **Description**: ${market.description}\n`;
                    if (market.outcomes && market.outcomes.length > 0) {
                        resultText += `- **Outcomes**: ${market.outcomes.map((o) => o.title || o).join(', ')}\n`;
                    }
                    if (market.tags && market.tags.length > 0) {
                        resultText += `- **Tags**: ${market.tags.map((t) => t.label || t).join(', ')}\n`;
                    }
                    if (market.enableOrderBook) {
                        resultText += `- **Trading**: Available via CLOB\n`;
                    }
                    resultText += `\n---\n\n`;
                });
                // Add pagination info
                if (markets.length === limit) {
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
                        text: `❌ Failed to fetch markets: ${error.message}`
                    }],
                isError: true
            };
        }
    }
};
//# sourceMappingURL=getMarkets.js.map