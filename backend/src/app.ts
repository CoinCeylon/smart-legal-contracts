import express, {Request, Response} from "express";

import auth from "./api/v1/middlewares/auth";
import appRouter from "./api/v1/routes/app.route";
import prismaService from "./services/database/prisma.service";
import cors from "cors";
import authRoute from "./api/v1/routes/auth.route";

class App {
    public express: express.Application;

    constructor() {
        this.express = express();
        this.express.use(cors());
        this.express.use(express.json());

        this.express.get("/healthz", async (req: Request, res: Response) => {
            const dbHealthy = await prismaService.healthCheck();
            res.status(dbHealthy ? 200 : 503).json({
                status: dbHealthy ? 'healthy' : 'unhealthy',
                database: dbHealthy ? 'connected' : 'disconnected',
                timestamp: new Date().toISOString()
            });
        });

        this.setGuestRoutes();
        this.setMiddlewares();
        this.setAppRoutes();
        this.catchErrors();
    }

    private setGuestRoutes(): void {
        this.express.use("/api/v1/auth", authRoute);
    }

    private setMiddlewares(): void {
        this.express.use(auth);
    }

    private setAppRoutes(): void {
        this.express.use("/api/v1", appRouter);
    }

    private catchErrors(): void {
    }
}

export default new App().express;
