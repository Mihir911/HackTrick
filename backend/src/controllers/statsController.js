import User from '../models/User.js';
import Video from '../models/Video.js';
import Course from '../models/Course.js';
import Mission from '../models/Mission.js';
import Hackathon from '../models/Hackathon.js';
import logger from '../utils/logger.js';

//get plaftform statistics

export const getStats = async (req, res) => {
    try {
        const [users, videos, courses, missions, hackathons] = await Promise.all([
            User.countDocuments(),
            Video.countDocuments(),
            Course.countDocuments(),
            Mission.countDocuments(),
            Hackathon.countDocuments()
        ]);

        res.json({
            users,
            videos,
            courses,
            missions,
            hackathons
        });
    } catch (error) {
        logger.error(`Stats error: ${error.message}`);
        res.status(500).json({ error: 'Failed to get stats' });
    }
};

export default { getStats };