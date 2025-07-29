# PolyMarket API Interface Report

## Overview

Polymarket is the world's largest prediction market platform built on Ethereum blockchain with Polygon Layer-2 scaling solution. <mcreference link="https://docs.polymarket.com/developers/gamma-markets-api/overview" index="1">1</mcreference> The platform provides multiple API endpoints for developers to interact with markets, orders, trades, and user data.

## API Architecture

Polymarket offers three main API services:

### 1. Gamma Markets API
- **Base URL**: `https://gamma-api.polymarket.com`
- **Purpose**: Market discovery and metadata
- **Access**: Read-only for public users
- **Use Cases**: Research projects, alternative trading interfaces, automated trading systems

### 2. CLOB (Central Limit Order Book) API
- **Base URL**: `https://clob.polymarket.com`
- **Purpose**: Order management and trading
- **Access**: Requires authentication for trading operations
- **Features**: Hybrid-decentralized order book with off-chain matching and on-chain settlement

### 3. Data API
- **Base URL**: `https://data-api.polymarket.com`
- **Purpose**: User data, holdings, and on-chain activities
- **Access**: Public read access for most endpoints

### 4. WebSocket API
- **Base URL**: `wss://ws-subscriptions-clob.polymarket.com/ws/`
- **Purpose**: Real-time market and user updates
- **Channels**: USER and MARKET channels available

## Detailed API Endpoints

### Gamma Markets API Endpoints

#### Get Markets
- **Endpoint**: `GET /markets`
- **Description**: Retrieve market information with filtering and pagination
- **Parameters**:
  - `limit` (integer): Limit query results
  - `offset` (integer): Pagination offset
  - `order` (string): Key to sort by
  - `ascending` (boolean): Sort direction
  - `id` (integer): Specific market ID
  - `slug` (string): Market slug
  - `archived` (boolean): Filter by archived status
  - `active` (boolean): Filter by active status
  - `closed` (boolean): Filter by closed status
  - `clob_token_ids` (string): Filter by CLOB token ID
  - `condition_ids` (string): Filter by condition ID
  - `liquidity_num_min/max` (number): Liquidity filters
  - `volume_num_min/max` (number): Volume filters
  - `start_date_min/max` (datetime): Date filters
  - `end_date_min/max` (datetime): End date filters
  - `tag_id` (integer): Filter by tag ID

- **Response Fields**:
  - `id`: Market unique identifier
  - `slug`: Market slug
  - `archived`: Archive status
  - `active`: Active status
  - `closed`: Closed status
  - `liquidity`: Market liquidity
  - `volume`: Trading volume
  - `start_date`: Market start date
  - `end_date`: Market end date

#### Get Events
- **Endpoint**: `GET /events`
- **Description**: Retrieve event information containing multiple markets
- **Parameters**: Similar to markets with event-specific filters
- **Response Fields**:
  - `id`: Event ID
  - `slug`: Event slug
  - `liquidity`: Event liquidity
  - `volume`: Event volume
  - `start_date`: Event start date
  - `end_date`: Event end date
  - `tags`: Associated tags

### CLOB API Endpoints

#### Authentication
- **Endpoint**: `POST /auth/api-key`
- **Description**: Create API key credentials
- **Requirements**: L1 Header required

#### Order Management

##### Place Single Order
- **Endpoint**: `POST /order`
- **Description**: Create and place limit/market orders
- **Requirements**: L2 Header required
- **Parameters**:
  - `order`: Signed order object
  - `owner`: API key of order owner
  - `orderType`: Order type ("FOK", "GTC", "GTD")

- **Order Object Structure**:
  - `salt`: Random salt for unique order
  - `maker`: Maker address (funder)
  - `signer`: Signing address
  - `taker`: Taker address (operator)
  - `tokenId`: ERC1155 token ID
  - `makerAmount`: Maximum maker spend amount
  - `takerAmount`: Minimum taker payment
  - `expiration`: Unix expiration timestamp
  - `nonce`: Maker's exchange nonce
  - `feeRateBps`: Fee rate in basis points
  - `side`: Buy or sell enum
  - `signatureType`: Signature type enum
  - `signature`: Hex encoded signature

- **Order Types**:
  - **FOK** (Fill-Or-Kill): Execute immediately or cancel
  - **FAK** (Fill-And-Kill): Execute available portion, cancel rest
  - **GTC** (Good-Til-Cancelled): Active until fulfilled or cancelled
  - **GTD** (Good-Til-Date): Active until specified date

- **Response**:
  - `success`: Boolean indicating success
  - `errorMsg`: Error message if unsuccessful
  - `orderId`: Order ID
  - `orderHashes`: Settlement transaction hashes

#### Order Book Data
- **Endpoint**: `GET /book`
- **Description**: Get order book for specific market
- **Parameters**: Market/token identifiers

#### Trade History
- **Endpoint**: `GET /trades`
- **Description**: Retrieve historical trades
- **Parameters**: Market filters, pagination, time ranges

### Data API Endpoints

#### Get User Positions
- **Endpoint**: `GET /positions`
- **Description**: Retrieve user's current positions
- **Parameters**:
  - `user`: User address
  - `market`: Market filter
  - `asset`: Asset filter

- **Response Fields**:
  - `proxyWallet`: User's proxy wallet address
  - `asset`: Asset identifier
  - `conditionId`: Market condition ID
  - `size`: Position size
  - `avgPrice`: Average purchase price
  - `initialValue`: Initial position value
  - `currentValue`: Current position value
  - `cashPnl`: Cash profit/loss
  - `percentPnl`: Percentage profit/loss
  - `totalBought`: Total amount bought
  - `realizedPnl`: Realized profit/loss
  - `curPrice`: Current market price
  - `redeemable`: Whether position is redeemable
  - `title`: Market title
  - `outcome`: Position outcome (Yes/No)
  - `endDate`: Market end date

#### Get User On-Chain Activity
- **Endpoint**: `GET /activity`
- **Description**: Retrieve user's trading and other activities
- **Parameters**:
  - `user`: User address
  - `activity_types`: Activity types (TRADE, SPLIT, MERGE, REDEEM, REWARD, CONVERSION)
  - `side`: Trade side (BUY/SELL)
  - `sort_by`: Sort field (TIMESTAMP, TOKENS, CASH)
  - `sort_order`: Sort direction (ASC/DESC)
  - `limit`: Result limit
  - `offset`: Pagination offset

- **Response Fields**:
  - `proxyWallet`: User's proxy wallet
  - `timestamp`: Activity timestamp
  - `conditionId`: Market condition ID
  - `type`: Activity type
  - `size`: Transaction size
  - `usdcSize`: USDC amount
  - `transactionHash`: Blockchain transaction hash
  - `price`: Transaction price
  - `asset`: Asset identifier
  - `side`: Trade side
  - `outcome`: Market outcome
  - `title`: Market title

#### Get Market Holders
- **Endpoint**: `GET /holders`
- **Description**: Get holders of specific market tokens
- **Parameters**:
  - `token`: Token identifier
  - `limit`: Maximum holders to return (default: 100)

- **Response Fields**:
  - `token`: Token identifier
  - `holders`: Array of holder objects
    - `proxyWallet`: Holder's wallet address
    - `amount`: Holdings amount
    - `outcomeIndex`: Outcome index
    - `name`: User name
    - `pseudonym`: User pseudonym
    - `profileImage`: Profile image URL

#### Get Holdings Value
- **Endpoint**: `GET /holdings-value`
- **Description**: Get total value of user holdings
- **Parameters**: User address

#### Get Trades (Data API)
- **Endpoint**: `GET /trades`
- **Description**: Simple trade data access without L2 headers
- **Parameters**: Market filters, user filters, pagination

### WebSocket API

#### Connection
- **URL**: `wss://ws-subscriptions-clob.polymarket.com/ws/`
- **Channels**: USER, MARKET

#### Subscription Message
```json
{
  "auth": {
    // Authentication object
  },
  "markets": ["condition_id_1", "condition_id_2"],
  "assets_ids": ["token_id_1", "token_id_2"],
  "type": "USER" // or "MARKET"
}
```

#### Available Channels
- **USER Channel**: Real-time updates for user orders and trades
- **MARKET Channel**: Real-time market data updates

## Authentication

### L1 Header
Required for creating API credentials and certain administrative functions.

### L2 Header
Required for trading operations and order management. Uses EIP712 signature-based authentication.

### API Key Authentication
Generated through the `/auth/api-key` endpoint for ongoing API access.

## Rate Limits

Polymarket implements rate limiting on API endpoints. Specific limits are not publicly documented but should be respected to avoid service interruption.

## Error Handling

### Common Error Types
- `INVALID_ORDER_MIN_TICK_SIZE`: Price breaks minimum tick size rules
- `INVALID_ORDER_MIN_SIZE`: Order size below minimum threshold
- `INVALID_ORDER_DUPLICATED`: Duplicate order submission
- `INVALID_ORDER_NOT_ENOUGH_BALANCE`: Insufficient balance or allowance
- `INVALID_ORDER_EXPIRATION`: Invalid expiration time
- `FOK_ORDER_NOT_FILLED_ERROR`: FOK order couldn't be fully filled
- `MARKET_NOT_READY`: Market not accepting new orders

## Trading Mechanics

### Order Types
1. **Limit Orders**: Specify exact price and quantity
2. **Market Orders**: Execute at best available price (implemented as marketable limit orders)

### Fee Structure
- **Maker Fees**: 0 bps (0%)
- **Taker Fees**: 0 bps (0%)
- Fees calculated symmetrically on output assets

### Settlement
- **On-chain**: Final settlement via Ethereum smart contracts
- **Off-chain Matching**: Order matching handled by operator
- **Non-custodial**: Users maintain control of funds

## Market Structure

### Binary Markets
- Each market has YES/NO outcomes
- Shares priced between $0.01 and $1.00
- YES + NO shares always sum to $1.00
- Winning shares redeem for $1.00 each

### Market Resolution
- Automated resolution via smart contracts
- Manual resolution by Market Integrity Committee (MIC) when needed
- Resolution data available on-chain

## Use Cases for MCP Integration

### Market Data Access
- Real-time market prices and probabilities
- Historical trading data
- Market metadata and categorization

### Trading Operations
- Automated trading strategies
- Order management
- Portfolio tracking

### Analytics and Research
- Market analysis
- User behavior studies
- Prediction accuracy research

### Portfolio Management
- Position tracking
- P&L calculation
- Risk management

## Technical Considerations

### Blockchain Integration
- **Network**: Polygon (Layer 2)
- **Tokens**: ERC1155 (Outcome tokens), ERC20 (USDC collateral)
- **Smart Contracts**: Audited by Chainsecurity

### Data Consistency
- On-chain data is authoritative
- API data indexed from blockchain
- Real-time updates via WebSocket

### Security
- EIP712 signature-based authentication
- Non-custodial architecture
- Audited smart contracts
- Rate limiting and abuse prevention

## Conclusion

Polymarket provides a comprehensive API ecosystem suitable for building sophisticated prediction market applications. The combination of Gamma (market data), CLOB (trading), Data API (analytics), and WebSocket (real-time) services offers complete coverage for most use cases. <mcreference link="https://docs.polymarket.com/developers/CLOB/introduction" index="4">4</mcreference>

For MCP development, the APIs provide excellent foundation for:
- Market discovery and analysis tools
- Automated trading systems
- Portfolio management applications
- Research and analytics platforms
- Real-time monitoring dashboards

The read-only nature of most endpoints makes them ideal for information retrieval and analysis, while the trading APIs enable full market participation for authorized users.