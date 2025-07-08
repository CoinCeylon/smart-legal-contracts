import dotenv from 'dotenv';
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import logger from  './src/services/common/logger.service'
import app from './src/app';
import prismaService from "./src/services/database/prisma.service";

const port = process.env.PORT || 3100;

prismaService.connect().then(() => {
    logger.info('database connected successfully');
}).catch((error) => {
    logger.error('failed to connect to the database:', error);
    process.exit(1);
});

const server = app.listen(port, () => {
    logger.info(`Server is listening on ${port}`);
});

process.on('SIGTERM', async () => {
    logger.debug('SIGTERM signal received: Closing Server');
    await prismaService.disconnect();
    server.close(() => {
        logger.debug('Server Closed');
    });
});
