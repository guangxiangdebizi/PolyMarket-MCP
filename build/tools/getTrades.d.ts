export declare const getTrades: {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
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
            market_id: {
                type: string;
                description: string;
            };
            asset_id: {
                type: string;
                description: string;
            };
            user_address: {
                type: string;
                description: string;
            };
            side: {
                type: string;
                description: string;
                enum: string[];
            };
            min_size: {
                type: string;
                description: string;
            };
            max_size: {
                type: string;
                description: string;
            };
            min_price: {
                type: string;
                description: string;
            };
            max_price: {
                type: string;
                description: string;
            };
            start_date: {
                type: string;
                description: string;
            };
            end_date: {
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
        };
        required: never[];
    };
    run(args: {
        limit?: number;
        offset?: number;
        market_id?: string;
        asset_id?: string;
        user_address?: string;
        side?: string;
        min_size?: number;
        max_size?: number;
        min_price?: number;
        max_price?: number;
        start_date?: string;
        end_date?: string;
        order_by?: string;
        order_direction?: string;
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
//# sourceMappingURL=getTrades.d.ts.map