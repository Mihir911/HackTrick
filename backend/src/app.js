import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import  { fileURLToPath } from 'url';

//load env vars
dotenv.config();

//import modules 
import connectDB from './config/database.js';
import { initStorage } from './config/storage.js';
import logger from './utils/logger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { callbackify } from 'util';
import { timeStamp } from 'console';
import { uptime } from 'process';
import { defaultMaxListeners } from 'events';

//improt routes



//__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//init app
const app = express();
const PORT = process.env.PORT || 5000;

// ---------- middleware -------

//security
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false //disable for development
}));

//compression
app.use(compression());

//cors
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',')
        : ['http://localhost:3000', 'http://localhost:5173'];

        //allow reqs with no origin (like mobile app, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 //24 hours
};

app.use(cors(corsOptions));

//body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

//cookie parsing
app.use(cookieParser());

//rate limiting (apply to all routes)
app.use('/api', generalLimiter);

//logging middleware
app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.path} - ${req.ip}`);
    next();
});


//---------- Routes ---------
//api routes



//health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timeStamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});


//root route
app.get('/', (req, res)=>{
    res.json({
        name: 'HackTrick API',
        version: '1.0.0',
        status: 'Running',
        docs: '/api/docs'
    });
});


//--------- Error handling ----------

//404 handler
app.use(notFound);

//global error handler
app.use(errorHandler);



//-------------- Start Server ---------
const startServer = async () => {
    try {
        //connectDB
        await connectDB();
        logger.info('Database connected');

        //init storage
        await initStorage();
        logger.info('Storage initialized');

        //start server
        const server = app.listen(PORT, () => {
            logger.info(`Server running on PORT: ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV}`);
        });


        //setup websocket server



        //shutdown
        const shutdown = async () => {
            logger.info('shutting down gracefully...');
            server.close(() => {
                logger.info('Server closed');
                process.exit(0);
            });


            //Force close after 10 secs
            setTimeout(() => {
               logger.error('Force shutdown');
               process.exit(1); 
            }, 10000);
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);

        return server;
    } catch (error) {
        logger.error(`Server startup failed: ${error.message}`);
        process.exit(1);
    }
};

//start the server
startServer();

export default app;