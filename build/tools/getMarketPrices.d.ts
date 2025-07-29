export declare const getMarketPrices: {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            market_id: {
                type: string;
                description: string;
            };
            token_id: {
                type: string;
                description: string;
            };
            interval: {
                type: string;
                description: string;
                enum: string[];
                default: string;
            };
            fidelity: {
                type: string;
                description: string;
                default: number;
            };
            start_ts: {
                type: string;
                description: string;
            };
            end_ts: {
                type: string;
                description: string;
            };
            include_orderbook: {
                type: string;
                description: string;
                default: boolean;
            };
        };
        required: never[];
    };
    run(args: {
        market_id?: string;
        token_id?: string;
        interval?: string;
        fidelity?: number;
        start_ts?: number;
        end_ts?: number;
        include_orderbook?: boolean;
    }): Promise<{
        content: {
            type: string;
            text: string;
        }[];
        isError?: undefined;
    } | {
        content: {
            type: string;
            text: string;
        }[];
        isError: boolean;
    }>;
};
//# sourceMappingURL=getMarketPrices.d.ts.map