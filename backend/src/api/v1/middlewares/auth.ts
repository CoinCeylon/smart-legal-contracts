import {NextFunction, Request, Response} from "express";
import jwt from 'jsonwebtoken';
import {jwtSecret} from "../../../config/constant";

export default function (req: Request, res: Response, next: NextFunction): any {
    try {
        const auth = req.header('Authorization');

        if (!auth) {
            return res.status(401).json({error: 'Access denied. No token provided.'});
        }

        const token = auth!.split(" ")[1];

        if (!token) {
            return res.status(401).json({error: 'Access denied. Invalid token format.'});
        }

        req.user = jwt.verify(token, jwtSecret) as { uid: number; email: string };

        next();
    } catch (ex) {
        if (ex instanceof jwt.JsonWebTokenError) {
            res.status(401).json({error: 'Invalid token.'});
        } else if (ex instanceof jwt.TokenExpiredError) {
            res.status(401).json({error: 'Token expired.'});
        } else {
            res.status(400).json({error: 'Token verification failed.'});
        }
    }
}
