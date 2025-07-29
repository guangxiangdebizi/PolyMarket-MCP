import { polymarketClient } from '../lib/polymarketClient.js';
export const getEvents = {
    name: "get_events",
    description: "Retrieve Polymarket events which contain multiple related markets. Events group markets around a common theme or topic.",
    parameters: {
        type: "object",
        properties: {
            limit: {
                type: "number",
                description: "Maximum number of events to return (default: 20, max: 100)",
                default: 20
            },
            offset: {
                type: "number",
                description: "Number of events to skip for pagination (default: 0)",
                default: 0
            },
            active: {
                type: "boolean",
                description: "Filter by active status - true for active events only"
            },
            closed: {
                type: "boolean",
                description: "Filter by closed status - false to exclude closed events"
            },
            archived: {
                type: "boolean",
                description: "Filter by archived status - false to exclude archived events"
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
                description: "Search term to filter events by title or description"
            },
            tag_id: {
                type: "number",
                description: "Filter events by specific tag/category ID"
            },
            liquidity_min: {
                type: "number",
                description: "Minimum total liquidity threshold in USDC"
            },
            volume_min: {
                type: "number",
                description: "Minimum total volume threshold in USDC"
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
                params.liquidity_min = args.liquidity_min;
            if (args.volume_min)
                params.volume_min = args.volume_min;
            // Fetch events data
            const events = await polymarketClient.getEvents(params);
            // Format response
            const formattedEvents = events.map((event) => ({
                id: event.id,
                slug: event.slug,
                title: event.title,
                description: event.description,
                image: event.image,
                active: event.active,
                closed: event.closed,
                archived: event.archived,
                volume: event.volume ? `$${Number(event.volume).toLocaleString()}` : 'N/A',
                liquidity: event.liquidity ? `$${Number(event.liquidity).toLocaleString()}` : 'N/A',
                startDate: event.start_date,
                endDate: event.end_date,
                tags: event.tags || [],
                marketCount: event.markets ? event.markets.length : 0,
                markets: event.markets || []
            }));
            const summary = `Found ${events.length} events${args.search ? ` matching "${args.search}"` : ''}${args.active ? ' (active only)' : ''}${args.closed === false ? ' (excluding closed)' : ''}.`;
            let resultText = `# Polymarket Events\n\n${summary}\n\n`;
            if (formattedEvents.length === 0) {
                resultText += "No events found matching the specified criteria.";
            }
            else {
                formattedEvents.forEach((event, index) => {
                    resultText += `## ${index + 1}. ${event.title}\n\n`;
                    resultText += `- **Event ID**: ${event.id}\n`;
                    resultText += `- **Slug**: ${event.slug}\n`;
                    resultText += `- **Status**: ${event.active ? '🟢 Active' : '🔴 Inactive'}${event.closed ? ' (Closed)' : ''}${event.archived ? ' (Archived)' : ''}\n`;
                    resultText += `- **Total Volume**: ${event.volume}\n`;
                    resultText += `- **Total Liquidity**: ${event.liquidity}\n`;
                    resultText += `- **Markets Count**: ${event.marketCount}\n`;
                    if (event.startDate)
                        resultText += `- **Start Date**: ${new Date(event.startDate).toLocaleDateString()}\n`;
                    if (event.endDate)
                        resultText += `- **End Date**: ${new Date(event.endDate).toLocaleDateString()}\n`;
                    if (event.description)
                        resultText += `- **Description**: ${event.description}\n`;
                    if (event.tags && event.tags.length > 0) {
                        resultText += `- **Tags**: ${event.tags.map((t) => t.label || t).join(', ')}\n`;
                    }
                    // Show markets within the event
                    if (event.markets && event.markets.length > 0) {
                        resultText += `\n### Markets in this Event:\n`;
                        event.markets.slice(0, 5).forEach((market, marketIndex) => {
                            resultText += `${marketIndex + 1}. **${market.question || market.title}**\n`;
                            if (market.volume)
                                resultText += `   - Volume: $${Number(market.volume).toLocaleString()}\n`;
                            if (market.outcomes)
                                resultText += `   - Outcomes: ${market.outcomes.map((o) => o.title || o).join(', ')}\n`;
                        });
                        if (event.markets.length > 5) {
                            resultText += `   ... and ${event.markets.length - 5} more markets\n`;
                        }
                    }
                    resultText += `\n---\n\n`;
                });
                // Add pagination info
                if (events.length === limit) {
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
                        text: `❌ Failed to fetch events: ${error.message}`
                    }],
                isError: true
            };
        }
    }
};
//# sourceMappingURL=getEvents.js.map