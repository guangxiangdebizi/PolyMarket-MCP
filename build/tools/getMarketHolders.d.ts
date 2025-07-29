export declare const getMarketHolders: {
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
            limit: {
                type: string;
                description: string;
                default: number;
            };
            offset: {
                type: string;
                description: string;
                default: number;
            };
            min_balance: {
                type: string;
                description: string;
            };
            order_by: {
                type: string;
                description: string;
                enum: string[];
                default: string;
            };
            order_direction: {
                type: string;
                description: string;
                enum: string[];
                default: string;
            };
            include_user_info: {
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
        limit?: number;
        offset?: number;
        min_balance?: number;
        order_by?: string;
        order_direction?: string;
        include_user_info?: boolean;
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
//# sourceMappingURL=getMarketHolders.d.ts.map