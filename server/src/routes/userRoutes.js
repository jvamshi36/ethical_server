import express from 'express';
import { getUsers, getUserById, getCurrentUser } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { register,login } from '../controllers/authController.js';


const router = express.Router();

// Protected routes
router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticate, getCurrentUser);
router.get('/', authenticate, getUsers);
router.get('/:id', authenticate, getUserById);

export default router;