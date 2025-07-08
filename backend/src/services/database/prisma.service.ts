import { PrismaClient } from '@prisma/client';
import logger from '../common/logger.service';

class PrismaService {
    private static instance: PrismaService;
    public prisma: PrismaClient;

    private constructor() {
        this.prisma = new PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
        });
    }

    public static getInstance(): PrismaService {
        if (!PrismaService.instance) {
            PrismaService.instance = new PrismaService();
        }
        return PrismaService.instance;
    }

    public async connect(): Promise<void> {
        try {
            await this.prisma.$connect();
            logger.info('database connected successfully');
        } catch (error) {
            logger.error('database connection failed:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await this.prisma.$disconnect();
            logger.info('database disconnected successfully');
        } catch (error) {
            logger.error('database disconnection failed:', error);
            throw error;
        }
    }

    public async healthCheck(): Promise<boolean> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return true;
        } catch (error) {
            logger.error('Database health check failed:', error);
            return false;
        }
    }
}

export default PrismaService.getInstance();
export { PrismaService };
