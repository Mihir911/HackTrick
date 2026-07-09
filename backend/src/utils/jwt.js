import jwt from 'jsonwebtoken';
import logger from './logger.js';
import { http } from 'winston';
import path from 'node:path';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ALGORITHM = 'HS256';

//create a access token
export const createAccessToken = (userId, email, role) => {
    const payload = {
        sub: userId,
        email: email,
        role: role,
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, JWT_SECRET, {
        algorithm: JWT_ALGORITHM,
        expiresIn: '7d',
    });
};

//verify token and decode
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET, {
            algorithms: [JWT_ALGORITHM]
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expired');
        }
        if (error.name === 'jsonwebTokenError') {
            throw new Error('Invalid token');
        }
        throw error;
    }
};

//set auth coookie
export const setAuthCookie = (res, token) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('access_token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
    });
};

//clear auth cookie
export const clearAuthCookie = (res) => {
    res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
    });
};

export default { createAccessToken, verifyToken, setAuthCookie, clearAuthCookie };
