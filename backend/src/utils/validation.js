import { body, validationResult } from 'express-validator';

//validation rules for user registration
export const validateRegister = [
    body('email')
    .isEmail()
    .withMessage('invalid email format')
    .normalizeEmail()
    .trim(),
    body('password')
    .isLength({ min: 6 })
    .withMessage('password must be at least 6 characters long'),
    body('name')
    .notEmpty()
    .withMessage('name is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('name must be at most 100 characters long'),
    body('role')
    .optional()
    .isIn(['student', 'researcher', 'instructor', 'hr'])
    .withMessage('Invalid role')

];

//validation rules for login
export const validateLogin = [
    body('email')
    .isEmail()
    .withMessage('invalid email format')
    .normalizeEmail()
    .trim(),
    body('password')
    .notEmpty()
    .withMessage('password is required')
];

//validation rules for video upload
export const validateVideoCreate = [
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .trim()
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters'),
    body('description')
        .optional()
        .trim(),
    body('video_type')
        .optional()
        .isIn(['long', 'short'])
        .withMessage('Video type must be long or short'),
    body('external_url')
        .optional()
        .isURL()
        .withMessage('Invalid URL format'),
    body('storage_path')
        .optional(),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array')
];


/**
 * Validation rules for course creation
 */
export const validateCourseCreate = [
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .trim(),
    body('description')
        .notEmpty()
        .withMessage('Description is required')
        .trim(),
    body('is_free')
        .optional()
        .isBoolean()
        .withMessage('is_free must be boolean'),
    body('difficulty')
        .optional()
        .isIn(['beginner', 'intermediate', 'advanced'])
        .withMessage('Invalid difficulty level'),
    body('lessons')
        .optional()
        .isArray()
        .withMessage('Lessons must be an array')
];

//check validation result middleware
export const checkValidation = (req, res,  next) =>{
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};


export default { validateRegister, validateLogin, validateVideoCreate, validateCourseCreate, checkValidation };