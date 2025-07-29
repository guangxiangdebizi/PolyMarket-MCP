export declare const getEvents: {
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
            active: {
                type: string;
                description: string;
            };
            closed: {
                type: string;
                description: string;
            };
            archived: {
                type: string;
                description: string;
            };
            order: {
                type: string;
                description: string;
                enum: string[];
            };
            ascending: {
                type: string;
                description: string;
                default: boolean;
            };
            search: {
                type: string;
                description: string;
            };
            tag_id: {
                type: string;
                description: string;
            };
            liquidity_min: {
                type: string;
                description: string;
            };
            volume_min: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
    run(args: {
        limit?: number;
        offset?: number;
        active?: boolean;
        closed?: boolean;
        archived?: boolean;
        order?: string;
        ascending?: boolean;
        search?: string;
        tag_id?: number;
        liquidity_min?: number;
        volume_min?: number;
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
//# sourceMappingURL=getEvents.d.ts.map