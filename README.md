# Polymarket MCP Server

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-0.6.0-green.svg)](https://modelcontextprotocol.io/)

A comprehensive Model Context Protocol (MCP) server for interacting with Polymarket, the world's largest prediction market platform. This server provides seamless access to Polymarket's APIs, enabling AI assistants to retrieve market data, user positions, trading history, and more.

## 🚀 Features

### Market Data
- **Get Markets**: Retrieve prediction markets with filtering and pagination
- **Get Events**: Access event data containing multiple related markets
- **Market Prices**: Real-time and historical price data with technical analysis
- **Order Book**: Live bid/ask data with market depth analysis

### Trading & Activity
- **Trade History**: Comprehensive trading data with statistics
- **User Positions**: Portfolio tracking with P&L calculations
- **User Activity**: On-chain activity including trades, splits, merges, and rewards
- **Market Holders**: Ownership distribution and concentration analysis

### Advanced Analytics
- Liquidity analysis and market depth
- Price trend analysis and volatility metrics
- Portfolio performance tracking
- Market concentration and distribution insights

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- TypeScript 5.3+
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd polymarket-mcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Start the server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Claude Desktop Integration

#### Method 1: Stdio Mode (Recommended for Development)

Add to your Claude Desktop configuration file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "polymarket-mcp": {
      "command": "node",
      "args": ["path/to/polymarket-mcp/build/index.js"]
    }
  }
}
```

#### Method 2: SSE Mode (Recommended for Production)

1. **Install Supergateway**
   ```bash
   npm install -g supergateway
   ```

2. **Start SSE server**
   ```bash
   npm run sse
   ```

3. **Configure Claude Desktop**
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

## 🛠️ Available Tools

### 1. Get Markets
```typescript
get_markets({
  limit?: number,           // Max results (default: 20, max: 100)
  offset?: number,          // Pagination offset
  active?: boolean,         // Filter by active status
  search?: string,          // Search by title/description
  order?: string,           // Sort by: volume, liquidity, start_date, end_date
  liquidity_min?: number,   // Minimum liquidity threshold
  volume_min?: number       // Minimum volume threshold
})
```

### 2. Get Events
```typescript
get_events({
  limit?: number,           // Max results (default: 20, max: 100)
  offset?: number,          // Pagination offset
  active?: boolean,         // Filter by active status
  search?: string,          // Search by title/description
  order?: string            // Sort by: volume, liquidity, start_date, end_date
})
```

### 3. Get User Positions
```typescript
get_user_positions({
  user_address: string,     // Required: User's wallet address
  limit?: number,           // Max results (default: 50, max: 100)
  market_id?: string,       // Filter by specific market
  min_size?: number,        // Minimum position size
  show_zero_positions?: boolean // Include zero positions
})
```

### 4. Get User Activity
```typescript
get_user_activity({
  user_address: string,     // Required: User's wallet address
  limit?: number,           // Max results (default: 50, max: 100)
  activity_type?: string,   // TRADE, SPLIT, MERGE, REDEEM, REWARD, CONVERSION
  side?: string,            // BUY or SELL (for trades)
  start_date?: string,      // ISO 8601 date format
  end_date?: string         // ISO 8601 date format
})
```

### 5. Get Market Prices
```typescript
get_market_prices({
  market_id?: string,       // Market ID (required if no token_id)
  token_id?: string,        // Token ID (required if no market_id)
  interval?: string,        // 1m, 5m, 1h, 1d (default: 1h)
  fidelity?: number,        // Number of price points (default: 100, max: 1000)
  include_orderbook?: boolean // Include current order book
})
```

### 6. Get Trades
```typescript
get_trades({
  limit?: number,           // Max results (default: 50, max: 100)
  market_id?: string,       // Filter by market
  user_address?: string,    // Filter by user
  side?: string,            // BUY or SELL
  min_size?: number,        // Minimum trade size
  start_date?: string,      // ISO 8601 date format
  end_date?: string         // ISO 8601 date format
})
```

### 7. Get Order Book
```typescript
get_order_book({
  market_id?: string,       // Market ID (required if no token_id)
  token_id?: string,        // Token ID (required if no market_id)
  depth?: number,           // Price levels to show (default: 10, max: 50)
  include_spread_analysis?: boolean,   // Include spread analysis
  include_liquidity_analysis?: boolean // Include liquidity analysis
})
```

### 8. Get Market Holders
```typescript
get_market_holders({
  market_id?: string,       // Market ID (required if no token_id)
  token_id?: string,        // Token ID (required if no market_id)
  limit?: number,           // Max results (default: 50, max: 100)
  min_balance?: number,     // Minimum balance threshold
  include_user_info?: boolean // Include user profiles
})
```

## 📊 Example Usage

### Get Active Markets
```
Show me the top 10 most liquid active prediction markets
```

### Analyze User Portfolio
```
Get positions for wallet address 0x1234... and show P&L analysis
```

### Market Analysis
```
Get order book for market ID abc123 with liquidity analysis
```

### Trading History
```
Show recent trades for market xyz789 with volume over 1000 shares
```

## 🏗️ Architecture

```
src/
├── index.ts              # MCP server entry point
├── lib/
│   └── polymarketClient.ts # Polymarket API client
└── tools/                # Business logic tools
    ├── getMarkets.ts
    ├── getEvents.ts
    ├── getUserPositions.ts
    ├── getUserActivity.ts
    ├── getMarketPrices.ts
    ├── getTrades.ts
    ├── getOrderBook.ts
    └── getMarketHolders.ts
```

## 🔗 API Coverage

This MCP server integrates with multiple Polymarket APIs:

- **Gamma Markets API**: Market data and metadata
- **CLOB API**: Order book and trading data
- **Data API**: User positions, activity, and analytics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Xingyu Chen**
- LinkedIn: [Xingyu Chen](https://www.linkedin.com/in/xingyu-chen-b5b3b0313/)
- Email: guangxiangdebizi@gmail.com
- GitHub: [@guangxiangdebizi](https://github.com/guangxiangdebizi/)
- NPM: [@xingyuchen](https://www.npmjs.com/~xingyuchen)

## 🙏 Acknowledgments

- [Polymarket](https://polymarket.com/) for providing comprehensive APIs
- [Model Context Protocol](https://modelcontextprotocol.io/) for the MCP framework
- The open-source community for inspiration and tools

---

*Built with ❤️ for the prediction markets ecosystem*