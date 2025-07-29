export declare const getUserPositions: {
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
            asset_type: {
                type: string;
                description: string;
                enum: string[];
            };
            market_id: {
                type: string;
                description: string;
            };
            min_size: {
                type: string;
                description: string;
            };
            show_zero_positions: {
                type: string;
                description: string;
                default: boolean;
            };
        };
        required: string[];
    };
    run(args: {
        user_address: string;
        limit?: number;
        offset?: number;
        asset_type?: string;
        market_id?: string;
        min_size?: number;
        show_zero_positions?: boolean;
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
//# sourceMappingURL=getUserPositions.d.ts.map