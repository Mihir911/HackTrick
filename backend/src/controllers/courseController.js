import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { generateId, nowIso } from '../utils/helpers.js';
import logger from '../utils/logger.js';

//create a new course (instructor only')

export const createCourse = async (req, res) => {
    try {
        const {
            title,
            description,
            is_free,
            price,
            difficulty,
            tags,
            thumbnail_url,
            lessons
        } = req.body;

        const course = new Course({
            instructor_id: req.user.id,
            instructor_name: req.user.name,
            title,
            description,
            is_free: is_free !== undefined ? is_free : true,
            price: price || 0,
            difficulty: difficulty || 'beginner',
            tags: tags || [],
            thumbnail_url: thumbnail_url || null,
            lessons: lessons ? lessons.map(l => ({
                ...l,
                id: generateId()
            })) : [],
            enrollment_count: 0,
            rating: 0
        });

        await course.save();

        logger.info(`Course created: ${course.id} by ${req.user.id}`);
        res.status(201).json(course);
    } catch (error) {
        logger.error(`Create course error: ${error.message}`);
        res.status(500).json({ error: 'Failed to create course' });
    }
};


//list course with filters
export const listCourses = async (req, res) => {
    try {
        const { is_free, difficulty, tag, instructor_id } = req.query;
        const query = {};

        if (is_free !== undefined) query.is_free = is_free === 'true';
        if (difficulty) query.difficulty = difficulty;
        if (tag) query.tags = tag;
        if (instructor_id) query.instructor_id = instructor_id;

        const courses = await Course.find(query)
            .sort({ created_at: -1 })
            .limit(200);

        res.json(courses);
    } catch (error) {
        logger.error(`List courses error: ${error.message}`);
        res.status(500).json({ error: 'Failed to list courses' });
    }
};

//get asingle course with lessons
export const getCourse = async (req, res) => {
    try {
        const { cid } = req.params;

        const course = await Course.findOne({ id: cid });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json(course);
    } catch (error) {
        logger.error(`Get course error: ${error.message}`);
        res.status(500).json({ error: 'Failed to get course' });
    }
};



//enroll in a course
export const enrollCourse = async (req, res) => {
    try {
        const { cid } = req.params;
        const userId = req.user.id;

        const course = await Course.findOne({ id: cid });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Check if already enrolled
        const existing = await Enrollment.findOne({
            course_id: cid,
            user_id: userId
        });

        if (existing) {
            return res.json({ enrolled: true });
        }

        // Create enrollment
        const enrollment = new Enrollment({
            course_id: cid,
            user_id: userId,
            progress: 0,
            completed_lessons: []
        });
        await enrollment.save();

        // Increment enrollment count
        await Course.findOneAndUpdate(
            { id: cid },
            { $inc: { enrollment_count: 1 } }
        );

        logger.info(`User ${userId} enrolled in course ${cid}`);
        res.json({ enrolled: true });
    } catch (error) {
        logger.error(`Enroll course error: ${error.message}`);
        res.status(500).json({ error: 'Failed to enroll in course' });
    }
};


//get use's enrollments
export const myEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            user_id: req.user.id
        });

        // Enrich with course data
        const enriched = await Promise.all(enrollments.map(async (e) => {
            const course = await Course.findOne({ id: e.course_id });
            return {
                ...e.toJSON(),
                course
            };
        }));

        res.json(enriched);
    } catch (error) {
        logger.error(`My enrollments error: ${error.message}`);
        res.status(500).json({ error: 'Failed to get enrollments' });
    }
};

export default { createCourse, listCourses, getCourse, enrollCourse, myEnrollments };