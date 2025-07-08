import { Request, Response } from 'express';
import client from "../../../services/database/prisma.service";
import logger from "../../../services/common/logger.service";
import bcrypt from "bcrypt";

export default class UserController {

    public async initialEnable(req: Request, res: Response): Promise<any> {
        try {
            const userId = req.user!.uid;
            const {walletAddress, initialTransactionHash} = req.body;

            if (!walletAddress || !initialTransactionHash) {
                return res.status(400).json({
                    error: 'Missing required fields: name, type, document (file), transactionHash, createdBy'
                });
            }

            const user = await client.prisma.user.update({
                where: { id: userId },
                data: {
                    walletAddress,
                    initialTransactionHash,
                    enabled: true,
                }
            });

            const { password: _, ...userWithoutPassword } = user;
            return res.status(200).json({
                message: "succuss",
                user: userWithoutPassword,
            });
        } catch (error) {
            logger.error('Error enabling user', { error });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public async updateUser(req: Request, res: Response): Promise<any> {
        try {
            const userId = req.user!.uid;
            const { name, email, walletAddress, password } = req.body;

            if (!name && !email && !walletAddress && !password) {
                return res.status(400).json({
                    error: 'At least one field (name, email, walletAddress) must be provided for update'
                });
            }

            const updateData: any = {};
            if (name) updateData.name = name;
            if (email) updateData.email = email;
            if (walletAddress) updateData.walletAddress = walletAddress;
            if (password) updateData.password = await bcrypt.hash(password, 10);

            if (email) {
                const existingUser = await client.prisma.user.findUnique({
                    where: { email }
                });

                if (existingUser && existingUser.id !== userId) {
                    return res.status(409).json({
                        error: 'Email already exists'
                    });
                }
            }

            const updatedUser = await client.prisma.user.update({
                where: { id: userId },
                data: updateData
            });

            const { password: _, ...userWithoutPassword } = updatedUser;
            return res.status(200).json({
                message: "User updated successfully",
                user: userWithoutPassword,
            });
        } catch (error) {
            logger.error('Error updating user', { error });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    public async getAll(req: Request, res: Response): Promise<any> {
        try {
            const users = await client.prisma.user.findMany({
                where: {
                    enabled: true
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    walletAddress: true,
                    enabled: true,
                    createdAt: true,
                }
            });

            return res.status(200).json(users);
        } catch (error) {
            logger.error('Error fetching users', { error });
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

}
