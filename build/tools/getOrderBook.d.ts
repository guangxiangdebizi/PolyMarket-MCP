export declare const getOrderBook: {
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
            depth: {
                type: string;
                description: string;
                default: number;
            };
            include_spread_analysis: {
                type: string;
                description: string;
                default: boolean;
            };
            include_liquidity_analysis: {
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
        depth?: number;
        include_spread_analysis?: boolean;
        include_liquidity_analysis?: boolean;
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
//# sourceMappingURL=getOrderBook.d.ts.map