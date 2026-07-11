import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


//load config
dotenv.config();

// Import modules
import connectDB from './config/database.js';
import { initStorage } from './config/storage.js';
import logger from './utils/logger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimit.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import statsRoute from './src/routes/statsRoutes.js';


//__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Init app
const app = express();
const PORT = process.env.PORT || 5000;


//---------middleware--------------

// Security
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // Disable for development
}));

// Compression
app.use(compression());

// CORS
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = process.env.CORS_ORIGINS
            ? process.env.CORS_ORIGINS.split(',')
            : ['http://localhost:3000', 'http://localhost:5173'];

        // Allow requests with no origin (like mobile apps, curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cookie parsing
app.use(cookieParser());

// Rate limiting (apply to all routes)
app.use('/api', generalLimiter);

// Logging middleware
app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.path} - ${req.ip}`);
    next();
});

//-------Routes---------

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', statsRoute);



// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        name: 'HackTrick API',
        version: '1.0.0',
        status: 'Running',
        docs: '/api/docs'
    });
});



//---------Error handlilng

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);



//---------------start sever---------------------



const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        logger.info('Database connected');

        // Initialize storage
        await initStorage();
        logger.info('Storage initialized');

        // Start server
        const server = app.listen(PORT, () => {
            logger.info(`Server running on PORT: ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV}`);
        });

        // Setup WebSocket server
        const { setupWebSocket } = await import('./websocket/websocket.js');
        setupWebSocket(server);

        // Graceful shutdown
        const shutdown = async () => {
            logger.info('Shutting down gracefully...');
            server.close(() => {
                logger.info('Server closed');
                process.exit(0);
            });

            // Force close after 10 seconds
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

// Start the server
startServer();

export default app;

