import { Router } from 'express';
import {
  signUp,
  signIn,
  signOut,
  getProfile,
  refreshToken
} from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';

export const router = Router();

// Public routes
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/refresh', refreshToken);

// Protected routes
router.post('/signout', authenticateToken, signOut);
router.get('/profile', authenticateToken, getProfile);