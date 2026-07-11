import User from '../models/User.js';
import { createAccessToken, setAuthCookie, clearAuthCookie } from '../utils/jwt.js';
import { cleanDocument } from '../utils/helpers.js';
import logger from '../utils/logger.js';



//register a new user
export const register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        const normalizedEmail = email.toLowerCase();

        // Check if user exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create user
        const hashedPassword = await User.hashPassword(password);
        const user = new User({
            email: normalizedEmail,
            name,
            role: role || 'student',
            password_hash: hashedPassword,
            xp: 0,
            rank: 'Rookie',
            bio: '',
            avatar_url: null,
            skills: [],
            hr_verified: false
        });

        await user.save();

        // Generate token
        const token = createAccessToken(user.id, user.email, user.role);
        setAuthCookie(res, token);

        // Return user without sensitive data
        const userData = user.toJSON();

        res.status(201).json({
            ...userData,
            token
        });
    } catch (error) {
        logger.error(`Registration error: ${error.message}`);
        res.status(500).json({ error: 'Registration failed' });
    }
};


//login user'
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();

        // Find user with password
        const user = await User.findOne({ email: normalizedEmail })
            .select('+password_hash');

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = createAccessToken(user.id, user.email, user.role);
        setAuthCookie(res, token);

        // Return user without sensitive data
        const userData = user.toJSON();

        res.json({
            ...userData,
            token
        });
    } catch (error) {
        logger.error(`Login error: ${error.message}`);
        res.status(500).json({ error: 'Login failed' });
    }
};


//logout

export const logout = async (req, res) => {
    clearAuthCookie(res);
    res.json({ ok: true });
};


//get the current user
export const getMe = async (req, res) => {
    try {
        const user = await User.findOne({ id: req.user.id });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        logger.error(`Get me error: ${error.message}`);
        res.status(500).json({ error: 'Failed to get user' });
    }
};


export default { register, login, logout, getMe };