export declare const getUserActivity: {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            user_address: {
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
            activity_type: {
                type: string;
                description: string;
                enum: string[];
            };
            side: {
                type: string;
                description: string;
                enum: string[];
            };
            market_id: {
                type: string;
                description: string;
            };
            asset_id: {
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
            start_date: {
                type: string;
                description: string;
            };
            end_date: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    run(args: {
        user_address: string;
        limit?: number;
        offset?: number;
        activity_type?: string;
        side?: string;
        market_id?: string;
        asset_id?: string;
        order_by?: string;
        order_direction?: string;
        start_date?: string;
        end_date?: string;
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
//# sourceMappingURL=getUserActivity.d.ts.map