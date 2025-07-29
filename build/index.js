import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
// Import business tools
import { getMarkets } from "./tools/getMarkets.js";
import { getEvents } from "./tools/getEvents.js";
import { getUserPositions } from "./tools/getUserPositions.js";
import { getUserActivity } from "./tools/getUserActivity.js";
import { getMarketPrices } from "./tools/getMarketPrices.js";
import { getTrades } from "./tools/getTrades.js";
import { getOrderBook } from "./tools/getOrderBook.js";
import { getMarketHolders } from "./tools/getMarketHolders.js";
// Create MCP server
const server = new Server({
    name: "polymarket-mcp",
    version: "1.0.0",
}, {
    capabilities: { tools: {} }
});
// Tool registration
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: getMarkets.name,
                description: getMarkets.description,
                inputSchema: getMarkets.parameters
            },
            {
                name: getEvents.name,
                description: getEvents.description,
                inputSchema: getEvents.parameters
            },
            {
                name: getUserPositions.name,
                description: getUserPositions.description,
                inputSchema: getUserPositions.parameters
            },
            {
                name: getUserActivity.name,
                description: getUserActivity.description,
                inputSchema: getUserActivity.parameters
            },
            {
                name: getMarketPrices.name,
                description: getMarketPrices.description,
                inputSchema: getMarketPrices.parameters
            },
            {
                name: getTrades.name,
                description: getTrades.description,
                inputSchema: getTrades.parameters
            },
            {
                name: getOrderBook.name,
                description: getOrderBook.description,
                inputSchema: getOrderBook.parameters
            },
            {
                name: getMarketHolders.name,
                description: getMarketHolders.description,
                inputSchema: getMarketHolders.parameters
            }
        ]
    };
});
// 🔸 工具调用处理
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const args = request.params.arguments || {};
    switch (request.params.name) {
        case "get_markets":
            return await getMarkets.run(args);
        case "get_events":
            return await getEvents.run(args);
        case "get_user_positions":
            return await getUserPositions.run(args);
        case "get_user_activity":
            return await getUserActivity.run(args);
        case "get_market_prices":
            return await getMarketPrices.run(args);
        case "get_trades":
            return await getTrades.run(args);
        case "get_order_book":
            return await getOrderBook.run(args);
        case "get_market_holders":
            return await getMarketHolders.run(args);
        default:
            throw new Error(`Unknown tool: ${request.params.name}`);
    }
});
// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Polymarket MCP server running on stdio");
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map