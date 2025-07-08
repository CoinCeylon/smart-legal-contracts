import {Request, Response} from "express";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import client from "../../../services/database/prisma.service";
import logger from "../../../services/common/logger.service";
import {jwtSecret} from "../../../config/constant";

export default class AuthController {

    public async login(req: Request, res: Response): Promise<any> {
        try {
            const {email, password} = req.body;

            if (!email || !password) {
                return res.status(400).json({error: 'Email and password are required'});
            }

            const user = await client.prisma.user.findUnique({
                where: { email: email }
            });

            if (!user) {
                return res.status(401).json({error: 'Invalid email or password'});
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({error: 'Invalid email or password'});
            }

            const token = jwt.sign(
                { uid: user.id, email: user.email },
                jwtSecret,
                { expiresIn: '1d' }
            );

            const { password: _, ...userWithoutPassword } = user;
            return res.status(200).json({
                message: "login successful",
                user: userWithoutPassword,
                token
            });
        } catch (error) {
            logger.error('login error:', error);
            return res.status(500).json({error: 'internal server error'});
        }
    }

    public async register(req: Request, res: Response): Promise<any> {
        try {
            const {email, name, password} = req.body;

            if (!email || !password) {
                return res.status(400).json({error: 'Email and password are required'});
            }

            const existingUser = await client.prisma.user.findUnique({
                where: { email: email }
            });

            if (existingUser) {
                return res.status(409).json({error: 'User already exists'});
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await client.prisma.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword
                }
            });

            const token = jwt.sign(
                { uid: newUser.id, email: newUser.email },
                jwtSecret,
                { expiresIn: '1d' }
            );

            const { password: _, ...userWithoutPassword } = newUser;
            return res.status(201).json({
                message: "registration successful",
                user: userWithoutPassword,
                token
            });
        } catch (error) {
            logger.error('registration error:', error);
            return res.status(500).json({error: 'internal server error'});
        }
    }
}
