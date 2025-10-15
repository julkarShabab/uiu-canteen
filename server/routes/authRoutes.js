import express from 'express';
import { register, login, getMe, updateLocation, updateAvailability } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/location', protect, updateLocation);
router.put('/availability', protect, updateAvailability);

export default router;