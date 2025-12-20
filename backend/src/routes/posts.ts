import { Router } from 'express';
import { createPost, getPostById, getUserActivityPosts } from '../controllers/postController';

const router = Router();

// POST /api/posts - Create a new post with semantic similarity check
router.post('/posts', createPost);

// GET /api/posts/:id - Get post by ID
router.get('/posts/:id', getPostById);

// GET /api/posts/user/:userId/activity - Get user's posts and posts they've interacted with
router.get('/posts/user/:userId/activity', getUserActivityPosts);

export default router;
