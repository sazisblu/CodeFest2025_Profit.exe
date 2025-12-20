import { Router } from 'express';
import { createPost, getPostById } from '../controllers/postController';

const router = Router();

// POST /api/posts - Create a new post with semantic similarity check
router.post('/posts', createPost);

// GET /api/posts/:id - Get post by ID
router.get('/posts/:id', getPostById);

export default router;
