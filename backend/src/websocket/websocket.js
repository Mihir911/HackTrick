import { WebSocketServer } from 'ws';
import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import Hackathon from '../models/Hackathon.js';
import HackathonSubmission from '../models/HackathonSubmission.js';
import { nowIso, generateId } from '../utils/helpers.js';
import logger from '../utils/logger.js';

//connection manager
class ConnectionManager {
    constructor() {
        this.rooms = new Map(); //set of websocket connections
        this.userConnections = new Map(); //userId => websocket
    }

    connect(roomId, ws, userId) {
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new set());
        }
        this.rooms.get(roomId).add(ws);
        if (userId) {
            this.userConnections.set(userId, ws);
        }
    }

    disconnect(roomId, ws, userId) {
        if (this.rooms.has(roomId)) {
            this.rooms.get(roomId).delete(ws);
            if (this.rooms.get(roomId).size === 0) {
                this.rooms.delete(roomId);
            }
        }

        if (userId && this.userConnections.get(userId) === ws) {
            this.userConnections.delete(userId);
        }
    }

    getConnections(roomId) {
        return this.rooms.get(roomId) || new Set();
    }


    async broadcast(roomId, message, excludeWs = null){
        const connetions = this.getConnections(roomId);
        const data = JSON.stringify(message);

        for (const ws of connetions ) {
            if (ws === excludeWs) continue;
            try {
                if (ws.readyState === 1) {
                    ws.send(data);
                }
            } catch (error) {
                logger.error(`Broadcast error: ${error.message}`);
            }
        }
    }
}

const manager = new ConnectionManager();

//get hackathon leaderBoard
const getLeaderboard = async (hackathonId) => {
    try {
        const results = await HackathonSubmission.aggregate([
            { $match: { hackathon_id: hackathonId, solved: true } },
            {
                $group: {
                    _id: { user_id: '$user_id', challenge_id: '$challenge_id' },
                    user_name: { $first: '$user_name' },
                    points: { $max: '$points' }
                }
            },
            {
                $group: {
                    _id: '$_id.user_id',
                    user_name: { $first: '$user_name' },
                    total_points: { $sum: '$points' },
                    solves: { $sum: 1 }
                }
            },
            { $sort: { total_points: -1, solves: -1 } },
            { $limit: 100 }
        ]);

        // Get user ranks and modes
        const hackathon = await Hackathon.findOne({ id: hackathonId });
        const participants = hackathon?.participants || [];

        const leaderboard = await Promise.all(results.map(async (r) => {
            const user = await User.findOne({ id: r._id });
            const participant = participants.find(p => p.user_id === r._id);

            return {
                user_id: r._id,
                user_name: r.user_name,
                total_points: r.total_points,
                solves: r.solves,
                mode: participant?.mode || 'online',
                rank_badge: user?.rank || 'Rookie'
            };
        }));

        return leaderboard;
    } catch (error) {
        logger.error(`Leaderboard error: ${error.message}`);
        return [];
    }
};

// setup websocket server
export const setupWebSocket = (server) => {
    const wss = new WebSocketServer({
        server,
        path: '/api/ws/hackathon'
    });

    wss.on('connection', (ws, req) => {
        // Extract hackathon ID from URL
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathParts = url.pathname.split('/');
        const hackathonId = pathParts[pathParts.length - 1];

        if (!hackathonId || hackathonId === 'hackathon') {
            ws.close(1008, 'Invalid hackathon ID');
            return;
        }

        let userId = null;

        logger.info(`WebSocket connected to hackathon: ${hackathonId}`);

        // Send initial leaderboard
        getLeaderboard(hackathonId).then(leaderboard => {
            if (ws.readyState === 1) {
                ws.send(JSON.stringify({
                    type: 'leaderboard',
                    hackathon_id: hackathonId,
                    leaderboard
                }));
            }
        });

        ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data.toString());
                const { token, text } = message;

                if (!token) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Token required'
                    }));
                    return;
                }

                // Verify token
                let user;
                try {
                    const decoded = verifyToken(token);
                    user = await User.findOne({ id: decoded.sub });
                    if (!user) {
                        throw new Error('User not found');
                    }
                    userId = user.id;
                } catch (error) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Invalid token'
                    }));
                    return;
                }

                // Connect user to room
                manager.connect(hackathonId, ws, userId);

                // Handle chat message
                if (text) {
                    const chatMessage = {
                        type: 'chat',
                        id: generateId(),
                        hackathon_id: hackathonId,
                        user_id: user.id,
                        user_name: user.name,
                        text: text.trim(),
                        created_at: nowIso()
                    };

                    // Broadcast to all in room
                    await manager.broadcast(hackathonId, chatMessage, ws);
                }
            } catch (error) {
                logger.error(`WebSocket message error: ${error.message}`);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Failed to process message'
                }));
            }
        });

        ws.on('close', () => {
            logger.info(` WebSocket disconnected from hackathon: ${hackathonId}`);
            manager.disconnect(hackathonId, ws, userId);
        });

        ws.on('error', (error) => {
            logger.error(`WebSocket error: ${error.message}`);
        });
    });

    logger.info('WebSocket server initialized');

    return wss;
};

//Broadcast leaderboard update to hackathon room
export const broadcastLeaderboard = async (hackathonId, solveData = null) => {
    try {
        const leaderboard = await getLeaderboard(hackathonId);

        const message = {
            type: 'leaderboard',
            hackathon_id: hackathonId,
            leaderboard,
            created_at: nowIso()
        };

        if (solveData) {
            message.solve = solveData;
        }

        await manager.broadcast(hackathonId, message);
    } catch (error) {
        logger.error(`Broadcast leaderboard error: ${error.message}`);
    }
};

export default { setupWebSocket, broadcastLeaderboard, manager };