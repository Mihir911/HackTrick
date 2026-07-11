import express from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import {
    listTalent,
    getTalent,
    createEndorsement,
    listEndorsements,
    createOffer,
    myOffers
} from '../controllers/recruitmentController.js';

const router = express.Router();

// All recruitment routes require authentication
router.use(authenticate);

// Talent routes (HR only)
router.get('/', requireRoles('hr'), listTalent);
router.get('/:uid', requireRoles('hr'), getTalent);

// Endorsement routes (Instructor only)
router.post('/endorsements', requireRoles('instructor'), createEndorsement);
router.get('/endorsements', listEndorsements);

// Offer routes
router.post('/offers', requireRoles('hr'), createOffer);
router.get('/offers/me', myOffers);

export default router;