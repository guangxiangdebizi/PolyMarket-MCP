# 🚀 Polymarket MCP Server Deployment Guide

## Quick Start

### 1. Build the Project
```bash
npm install
npm run build
```

### 2. Test the Server
```bash
# Test individual tools
node test.js

# Test MCP server (stdio mode)
node build/index.js
```

### 3. Claude Desktop Integration

#### Option A: Stdio Mode (Recommended for Development)

Add to your Claude Desktop configuration file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "polymarket-mcp": {
      "command": "node",
      "args": ["C:\\path\\to\\PolyMarket-MCP\\build\\index.js"]
    }
  }
}
```

#### Option B: SSE Mode (Recommended for Production)

1. Install Supergateway:
```bash
npm install -g supergateway
```

2. Start SSE server:
```bash
npm run sse
# or manually:
npx supergateway --stdio "node build/index.js" --port 3100
```

3. Configure Claude Desktop:
```json
{
  "mcpServers": {
    "polymarket-mcp": {
      "type": "sse",
      "url": "http://localhost:3100/sse",
      "timeout": 600
    }
  }
}
```

## 🛠️ Development Scripts

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode for development
npm run dev

# Start MCP server
npm start

# Start SSE server
npm run sse

# Test tools
node test.js
```

## 🔧 Configuration

### Environment Variables

The server uses default Polymarket API endpoints. You can customize them by modifying `src/lib/polymarketClient.ts`:

- **Gamma API**: `https://gamma-api.polymarket.com`
- **Data API**: `https://data-api.polymarket.com`
- **CLOB API**: `https://clob.polymarket.com`

### Rate Limiting

The client includes built-in rate limiting and error handling:
- Request timeout: 30 seconds
- Automatic retry on network errors
- Graceful error handling for API failures

## 📊 Available Tools

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `get_markets` | Fetch prediction markets | `limit`, `active`, `search`, `tag_id` |
| `get_events` | Fetch market events | `limit`, `active`, `search`, `order` |
| `get_user_positions` | Get user holdings | `user_address`, `market_id` |
| `get_user_activity` | Get user activity history | `user_address`, `activity_type` |
| `get_market_prices` | Get market pricing data | `market_id`, `token_id`, `interval` |
| `get_trades` | Get trade history | `market_id`, `user_address`, `side` |
| `get_order_book` | Get order book data | `market_id`, `token_id`, `depth` |
| `get_market_holders` | Get market holder analysis | `market_id`, `token_id`, `min_balance` |

## 🐛 Troubleshooting

### Common Issues

1. **TypeScript compilation errors**:
   ```bash
   npm run build
   ```

2. **Module import errors**:
   - Ensure you're using Node.js 18+ with ES module support
   - Check that all imports use `.js` extensions

3. **API connection issues**:
   - Verify internet connection
   - Check if Polymarket APIs are accessible
   - Review rate limiting in console logs

4. **Claude Desktop integration**:
   - Restart Claude Desktop after configuration changes
   - Verify file paths in configuration
   - Check Claude Desktop logs for errors

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG=polymarket-mcp node build/index.js
```

## 📈 Performance Tips

1. **Use appropriate limits**: Start with small `limit` values (10-50) for faster responses
2. **Filter results**: Use `active`, `search`, and other filters to reduce data transfer
3. **Cache responses**: Consider implementing caching for frequently accessed data
4. **Monitor rate limits**: Be mindful of API rate limits when making frequent requests

## 🔒 Security Considerations

- The server makes read-only API calls to Polymarket
- No authentication tokens or private keys are required
- All data is publicly available market information
- Consider network security when deploying in production environments

## 📝 Logs and Monitoring

The server logs important events to console:
- Tool execution start/end
- API request/response status
- Error conditions and stack traces
- Performance metrics

For production deployment, consider redirecting logs to a file:
```bash
node build/index.js > polymarket-mcp.log 2>&1
```