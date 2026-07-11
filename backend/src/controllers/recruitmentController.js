import User from '../models/User.js';
import Endorsement from '../models/Endorsement.js';
import Offer from '../models/Offer.js';
import Video from '../models/Video.js';
import MissionSubmission from '../models/MissionSubmission.js';
import { generateId } from '../utils/helpers.js';
import logger from '../utils/logger.js';

//list talent (HR only)
export const listTalent = async (req, res) => {
    try {
        const { skill, min_xp } = req.query;
        const query = {
            role: { $in: ['student', 'researcher'] }
        };

        if (skill) {
            query.skills = skill;
        }
        if (min_xp !== undefined) {
            query.xp = { $gte: parseInt(min_xp) };
        }

        const users = await User.find(query, { password_hash: 0, _id: 0 })
            .sort({ xp: -1 })
            .limit(200);

        // Add endorsement counts
        const usersWithEndorsements = await Promise.all(users.map(async (u) => {
            const count = await Endorsement.countDocuments({ student_id: u.id });
            return {
                ...u.toJSON(),
                endorsement_count: count
            };
        }));

        res.json(usersWithEndorsements);
    } catch (error) {
        logger.error(`List talent error: ${error.message}`);
        res.status(500).json({ error: 'Failed to list talent' });
    }
};



//get talent detail (hr only)
export const getTalent = async (req, res) => {
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
        logger.error(`Get talent error: ${error.message}`);
        res.status(500).json({ error: 'Failed to get talent' });
    }
};



//create endorsement (instructor only)
export const createEndorsement = async (req, res) => {
    try {
        const { student_id, note, course_id } = req.body;

        const student = await User.findOne({ id: student_id });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const endorsement = new Endorsement({
            instructor_id: req.user.id,
            instructor_name: req.user.name,
            student_id,
            student_name: student.name,
            course_id: course_id || null,
            note
        });

        await endorsement.save();

        logger.info(`Endorsement created for ${student_id} by ${req.user.id}`);
        res.status(201).json(endorsement);
    } catch (error) {
        logger.error(`Create endorsement error: ${error.message}`);
        res.status(500).json({ error: 'Failed to create endorsement' });
    }
};

//list endorsments
export const listEndorsements = async (req, res) => {
    try {
        const { student_id, instructor_id } = req.query;
        const query = {};

        if (student_id) query.student_id = student_id;
        if (instructor_id) query.instructor_id = instructor_id;

        const endorsements = await Endorsement.find(query)
            .sort({ created_at: -1 })
            .limit(200);

        res.json(endorsements);
    } catch (error) {
        logger.error(`List endorsements error: ${error.message}`);
        res.status(500).json({ error: 'Failed to list endorsements' });
    }
};


//create offer (hr only)
export const createOffer = async (req, res) => {
    try {
        const { candidate_id, type, title, message, compensation } = req.body;

        const candidate = await User.findOne({ id: candidate_id });
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        const offer = new Offer({
            hr_id: req.user.id,
            hr_name: req.user.name,
            candidate_id,
            type: type || 'full_time',
            title,
            message: message || '',
            compensation: compensation || '',
            status: 'sent'
        });

        await offer.save();

        logger.info(`Offer created for ${candidate_id} by ${req.user.id}`);
        res.status(201).json(offer);
    } catch (error) {
        logger.error(`Create offer error: ${error.message}`);
        res.status(500).json({ error: 'Failed to create offer' });
    }
};

//get user;s offers
export const myOffers = async (req, res) => {
    try {
        const query = req.user.role === 'hr'
            ? { hr_id: req.user.id }
            : { candidate_id: req.user.id };

        const offers = await Offer.find(query)
            .sort({ created_at: -1 })
            .limit(200);

        res.json(offers);
    } catch (error) {
        logger.error(`My offers error: ${error.message}`);
        res.status(500).json({ error: 'Failed to get offers' });
    }
};


export default { listEndorsements, listTalent, getTalent, createEndorsement, createOffer };