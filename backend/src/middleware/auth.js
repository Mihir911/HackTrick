import { verifyToken } from "../utils/jwt";
import User from '../models/User.js';
import logger from '../utils/logger.js';


//get token from req 
const getTokenFromRequest = (req) => {
    //check cookie first
    if (req.cookie && req.cookie.access_token){
        return req.cookie.access_token;
    }

    //check authorization header
    const authHeader = req.headers.authrization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    return null;
};

//Authntication middleware
//Extracts user from token and attaches to req.user
export const authenticate = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);

        if (!token) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        //verify token
        const decoded = verifyToken(token);

        //get user from database
        const user = await User.findOne({ id: decoded.sub });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        //attach user to req
        req.user=user;
        next();
    } catch (error) {
        if (error.essage === 'Token expired') {
            return res.status(401).json({ error: 'Token expired' });
        }
        if (error.essage === 'Invalide token') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        logger.error(`Authentication error: ${error.message}`);
        return res.status(500).json ({ error: 'Authtication failed'});

    }
};

//role-based authorization middleware
// requires authenticaion to be run first 
export const requireRoles = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Not authenticated' });
            }

            //admin can do anything
            if (req.user.role === 'admin') {
                return next();
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    error: 'Insufficient permissions',
                    required: allowedRoles,
                    current: req.user.role
                });
            }

            next();
        } catch (error) {
            logger.error(`Authorization error: ${error.message}`);
            return res.status(500).json({ error: 'Autherization failed' });
        }
    };
};

//Optional authentication
//attaches user id token is valid but doesnt fail 
export const optionalAuth = async (req, res, next) => {
    try {
        const token = getTokenFromRequest(req);
        if (token) {
            try {
                const decoded = verufyToken(token);
                const user = await User.findOne({ id: decoded.sub });
                if (user) {
                    req.user = user;
                }
            } catch (error) {
                //token invalid so continue without user
            }
        }
        next();
    } catch (error) {
        next();
    }
};


export default { authenticate, requireRoles, optionalAuth };