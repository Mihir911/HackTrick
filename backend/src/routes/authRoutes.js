import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateRegister, validateLogin, checkValidation } from '../utils/validation.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { register, login, logout, getMe } from '../controllers/authController.js';


const router = express.Router();

// Public routes
router.post('/register', authLimiter, validateRegister, checkValidation, register);
router.post('/login', authLimiter, validateLogin, checkValidation, login);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

// Debug route to check if router is working
router.get('/test', (req, res) => {
    res.json({ message: 'Auth router is working!' });
});

export default router;