import express from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { validateCourseCreate, checkValidation } from '../utils/validation.js';
import {
    createCourse,
    listCourses,
    getCourse,
    enrollCourse,
    myEnrollments
} from '../controllers/courseController.js';

const router = express.Router();

// Public routes
router.get('/', listCourses);
router.get('/:cid', getCourse);

// Protected routes
router.post('/', authenticate, requireRoles('instructor'), validateCourseCreate, checkValidation, createCourse);
router.post('/:cid/enroll', authenticate, enrollCourse);
router.get('/enrollments/me', authenticate, myEnrollments);

export default router;