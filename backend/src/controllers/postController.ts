import { Request, Response } from 'express';
import supabase from '../utils/supabase';
import { generateEmbedding, cosineSimilarity } from '../services/embeddingService';

const SIMILARITY_THRESHOLD = 0.40; // 40% similarity threshold

/**
 * Create a new post with semantic similarity checking
 * This endpoint:
 * 1. Generates embeddings for the post description using Gemini
 * 2. Checks for similar posts with same tag and ward_no
 * 3. If similarity >= 40%, creates as thread/comment to similar post
 * 4. If similarity < 40%, creates as a regular new post
 */
export const createPost = async (req: Request, res: Response) => {
  try {
    const {
      user_id,
      title,
      description,
      location,
      tag_id,
      image_url,
      latitude,
      longitude,
      ward_no,
    } = req.body;

    // Validate required fields
    if (!user_id || !title || !description || !location || !tag_id) {
      return res.status(400).json({
        error: 'Missing required fields: user_id, title, description, location, tag_id',
      });
    }

    console.log('🔍 Creating post with semantic similarity check...');
    console.log('Post details:', { title, tag_id, ward_no });

    // Step 1: Generate embedding for the post description
    console.log('📊 Generating embedding for description...');
    const embedding = await generateEmbedding(description);
    console.log(`✅ Embedding generated (dimension: ${embedding.length})`);

    // Step 2: Find similar posts with same tag and ward_no
    console.log(`🔎 Searching for similar posts (tag: ${tag_id}, ward: ${ward_no})...`);
    
    // First, get post IDs that have embeddings
    const { data: postEmbeddings, error: embError } = await supabase
      .from('post_embeddings')
      .select('post_id, embedding');
    
    if (embError) {
      console.error('Error fetching embeddings:', embError);
      throw embError;
    }
    
    const postIdsWithEmbeddings = postEmbeddings?.map(e => e.post_id) || [];
    console.log(`📦 Found ${postIdsWithEmbeddings.length} posts with embeddings in database`);
    
    if (postIdsWithEmbeddings.length === 0) {
      console.log('⚠️ No posts with embeddings found. Will create new post.');
    }
    
    // Now get posts with the same tag and ward that have embeddings
    const { data: existingPosts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, description, user_id, image_url')
      .eq('tag_id', tag_id)
      .eq('ward_no', ward_no)
      .in('id', postIdsWithEmbeddings.length > 0 ? postIdsWithEmbeddings : ['00000000-0000-0000-0000-000000000000']); // Dummy UUID if empty

    if (fetchError) {
      console.error('Error fetching existing posts:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${existingPosts?.length || 0} existing posts to compare`);

    // Step 3: Calculate similarity with existing posts
    let mostSimilarPost: any = null;
    let highestSimilarity = 0;

    if (existingPosts && existingPosts.length > 0) {
      for (const post of existingPosts) {
        // Get the embedding for this post
        const postEmbedding = postEmbeddings?.find(e => e.post_id === post.id);
        
        if (!postEmbedding || !postEmbedding.embedding) {
          console.log(`  ⚠️ No embedding found for post "${post.title}"`);
          continue;
        }
        
        let existingEmbedding = postEmbedding.embedding;
        
        // Debug: Check embedding format
        console.log(`  🔍 Checking post "${post.title}"`);
        console.log(`  📦 Embedding type: ${typeof existingEmbedding}`);
        console.log(`  📦 Is array: ${Array.isArray(existingEmbedding)}`);
        
        // Handle different embedding formats from database
        if (typeof existingEmbedding === 'string') {
          console.log('  🔄 Converting string embedding to array');
          existingEmbedding = JSON.parse(existingEmbedding);
        }
        
        // Check if it's a valid array
        if (!Array.isArray(existingEmbedding) || existingEmbedding.length === 0) {
          console.log(`  ⚠️ Invalid embedding format for post "${post.title}", skipping`);
          continue;
        }
        
        console.log(`  📊 Embedding dimensions: new=${embedding.length}, existing=${existingEmbedding.length}`);
        
        try {
          const similarity = cosineSimilarity(embedding, existingEmbedding);
          console.log(`  📏 Similarity with post "${post.title}": ${(similarity * 100).toFixed(2)}%`);
          
          if (similarity > highestSimilarity) {
            highestSimilarity = similarity;
            mostSimilarPost = post;
          }
        } catch (error) {
          console.error(`  ❌ Error calculating similarity for post "${post.title}":`, error);
        }
      }
    }

    console.log(`🎯 Highest similarity: ${(highestSimilarity * 100).toFixed(2)}%`);

    // Step 4: Decide whether to create a thread or a new post
    if (highestSimilarity >= SIMILARITY_THRESHOLD && mostSimilarPost) {
      // Create as a thread/comment to the similar post
      console.log(`✨ Creating as thread to post: ${mostSimilarPost.title}`);
      
      const { data: thread, error: threadError } = await supabase
        .from('post_threads')
        .insert({
          post_id: mostSimilarPost.id,
          user_id: user_id,
          content: `${title}\n\n${description}`,
          image_url: image_url,
          likes_count: 0,
          replies_count: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (threadError) {
        console.error('Error creating thread:', threadError);
        throw threadError;
      }

      // Update thread count on the main post
      // First get current count
      const { data: currentPost } = await supabase
        .from('posts')
        .select('threads_count')
        .eq('id', mostSimilarPost.id)
        .single();

      const newCount = (currentPost?.threads_count || 0) + 1;

      const { error: updateError } = await supabase
        .from('posts')
        .update({ threads_count: newCount })
        .eq('id', mostSimilarPost.id);

      if (updateError) {
        console.error('Error updating thread count:', updateError);
      }

      console.log('✅ Thread created successfully');

      return res.status(201).json({
        success: true,
        type: 'thread',
        message: 'Similar post found. Created as thread/comment.',
        data: {
          thread_id: thread.id,
          parent_post_id: mostSimilarPost.id,
          parent_post_title: mostSimilarPost.title,
          similarity: highestSimilarity,
        },
      });
    } else {
      // Create as a new regular post
      console.log('📝 Creating as new regular post');
      
      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id,
          title,
          description,
          location,
          tag_id,
          image_url,
          latitude,
          longitude,
          ward_no,
          likes_count: 0,
          threads_count: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (postError) {
        console.error('Error creating post:', postError);
        throw postError;
      }

      // Store the embedding in post_embeddings table
      const { error: embeddingError } = await supabase
        .from('post_embeddings')
        .insert({
          post_id: newPost.id,
          embedding: embedding,
        });

      if (embeddingError) {
        console.error('Error storing embedding:', embeddingError);
        // Don't fail the post creation if embedding storage fails
      }

      console.log('✅ New post created successfully');

      return res.status(201).json({
        success: true,
        type: 'post',
        message: 'New post created successfully.',
        data: {
          post_id: newPost.id,
          post: newPost,
          similarity: highestSimilarity,
        },
      });
    }
  } catch (error) {
    console.error('❌ Error in createPost:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get post by ID with embeddings
 */
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        users (display_name, photo_url),
        tags (*),
        post_embeddings (embedding)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get posts created by user or posts they've interacted with (commented on)
 */
export const getUserActivityPosts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log(`🔍 Fetching posts for user activity: ${userId}`);

    // Get posts created by the user
    const { data: userPosts, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        users (display_name, photo_url),
        tags (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching user posts:', postsError);
      throw postsError;
    }

    // Get posts where user has commented (threads) with the comment details
    const { data: userThreads, error: threadsError } = await supabase
      .from('post_threads')
      .select('post_id, content, image_url, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (threadsError) {
      console.error('Error fetching user threads:', threadsError);
      throw threadsError;
    }

    // Create a map of post_id to user's latest comment
    const userCommentMap = new Map();
    userThreads?.forEach(thread => {
      if (!userCommentMap.has(thread.post_id)) {
        userCommentMap.set(thread.post_id, {
          content: thread.content,
          image_url: thread.image_url,
          created_at: thread.created_at,
        });
      }
    });

    // Get unique post IDs from threads
    const threadedPostIds = [...new Set(userThreads?.map(t => t.post_id) || [])];

    // Fetch the posts user has commented on
    let commentedPosts: any[] = [];
    if (threadedPostIds.length > 0) {
      const { data: postsFromThreads, error: threadPostsError } = await supabase
        .from('posts')
        .select(`
          *,
          users (display_name, photo_url),
          tags (*)
        `)
        .in('id', threadedPostIds)
        .order('created_at', { ascending: false });

      if (threadPostsError) {
        console.error('Error fetching threaded posts:', threadPostsError);
        throw threadPostsError;
      }

      commentedPosts = postsFromThreads || [];
    }

    // Combine and deduplicate posts, adding user's comment where applicable
    const allPostsMap = new Map();
    
    // Add user's own posts
    userPosts?.forEach(post => {
      allPostsMap.set(post.id, { ...post, user_comment: null });
    });

    // Add posts user commented on (if not already added), include their comment
    commentedPosts.forEach(post => {
      const userComment = userCommentMap.get(post.id);
      if (!allPostsMap.has(post.id)) {
        allPostsMap.set(post.id, { ...post, user_comment: userComment });
      } else {
        // If post was created by user but also has comments, add the comment
        const existingPost = allPostsMap.get(post.id);
        allPostsMap.set(post.id, { ...existingPost, user_comment: userComment });
      }
    });

    // Convert to array and sort by created_at
    const allPosts = Array.from(allPostsMap.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    console.log(`✅ Found ${allPosts.length} posts for user activity`);

    res.json({
      success: true,
      data: allPosts,
    });
  } catch (error) {
    console.error('❌ Error fetching user activity posts:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
