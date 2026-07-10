import rateLimit from 'express-rate-limit';

//general rate limiter - 100 req per 15 mint
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mint
    max: 100,
    message: {
        error: 'Too many requests, please try again later',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        //skip for admin users? uncomment line below
        //return req.user?.role === 'admin';
        return false;  //comment this to and unccoment upper line to make admin user limitless
    }
});

//auth limiter, it's for login, dont allow too many login reqs 5 attempts pe r15 mint
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mint
    max: 5,
    message: {
        error: 'Too many login attempts, please try again later.',
        retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true //dont count successful logins
});

//ratelimiter for API 200 req per 15 mint
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 mint
    max: 200, 
    message: {
        error: 'API rate limit exceeded, please try again later.'
    },

    standardHeaders: true,
    legacyHeaders: false
});

export default { generalLimiter, authLimiter, apiLimiter };