declare global {
    namespace Express {
        interface Request {
            user?: {
                uid: number;
                name?: string;
                email: string;
            };
        }
    }
}

export {};
