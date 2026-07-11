import User from '../models/User.js';
import Endorsement from '../models/Endorsement.js';
import Video from '../models/Video.js';
import MissionSubmission from '../models/MissionSubmission.js';
import logger from '../utils/logger.js';


//get user profile

export const getUserProfile = async (req, res) => {
    try {
        const { uid } = req.params;

        const user = await User.findOne({ id: uid }, { password_hash: 0, _id: 0 });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get endorsements
        const endorsements = await Endorsement.find({ student_id: uid });

        // Get videos
        const videos = await Video.find({ owner_id: uid }).sort({ created_at: -1 });

        // Get solved missions count
        const solvedMissions = await MissionSubmission.countDocuments({
            user_id: uid,
            solved: true
        });

        res.json({
            ...user.toJSON(),
            endorsements,
            videos,
            solved_missions: solvedMissions
        });
    } catch (error) {
        logger.error(`Get user profile error: ${error.message}`);
        res.status(500).json({ error: 'Failed to get user profile' });
    }
};


//update current user profile
export const updateMe = async (req, res) => {
    try {
        const { name, bio, skills, avatar_url } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (skills !== undefined) updateData.skills = skills;
        if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

        // Don't allow role change
        if (req.body.role) {
            logger.warn(`User ${req.user.id} attempted to change role to ${req.body.role}`);
        }

        const user = await User.findOneAndUpdate(
            { id: req.user.id },
            { $set: updateData },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        logger.info(`User ${req.user.id} updated profile`);
        res.json(user);
    } catch (error) {
        logger.error(`Update profile error: ${error.message}`);
        res.status(500).json({ error: 'Failed to update profile' });
    }

};

export default { getUserProfile, updateMe};