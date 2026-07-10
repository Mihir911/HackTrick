import logger from '../utils/logger.js';

//global error handler middleware
export const errorHandler = (err, req, res, next) => {
    //log error
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    //Mongoose duplicate key error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }


    //Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            error: `Duplicate value for ${field}`,
            details: err.keyValue
        });
    }

    //JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
    }
    if (err.name === 'tokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
    }


    //default error
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';


    res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });

};

//404 not found hanler
export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
};

export default { errorHandler, notFound };