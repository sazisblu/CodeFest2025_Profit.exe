/**
 * Backfill embeddings for existing posts that don't have embeddings
 * Run this script once to generate embeddings for all old posts
 */

import dotenv from 'dotenv';
import supabase from '../utils/supabase';
import { generateEmbedding } from '../services/embeddingService';

dotenv.config();

async function backfillEmbeddings() {
  console.log('🚀 Starting embeddings backfill process...\n');

  try {
    // Get all posts that don't have embeddings
    console.log('📊 Fetching posts without embeddings...');
    const { data: postsWithoutEmbeddings, error: fetchError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        description,
        post_embeddings (id)
      `);

    if (fetchError) {
      throw fetchError;
    }

    // Filter posts that don't have embeddings
    const postsToProcess = postsWithoutEmbeddings?.filter(
      (post: any) => !post.post_embeddings || post.post_embeddings.length === 0
    ) || [];

    console.log(`✅ Found ${postsToProcess.length} posts without embeddings\n`);

    if (postsToProcess.length === 0) {
      console.log('✨ All posts already have embeddings!');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    // Process each post
    for (let i = 0; i < postsToProcess.length; i++) {
      const post = postsToProcess[i];
      console.log(`\n[${i + 1}/${postsToProcess.length}] Processing: "${post.title}"`);
      console.log(`Post ID: ${post.id}`);

      try {
        // Generate embedding for the description
        console.log('  📊 Generating embedding...');
        const embedding = await generateEmbedding(post.description);
        console.log(`  ✅ Embedding generated (dimension: ${embedding.length})`);

        // Store the embedding
        console.log('  💾 Storing embedding in database...');
        const { error: insertError } = await supabase
          .from('post_embeddings')
          .insert({
            post_id: post.id,
            embedding: embedding,
          });

        if (insertError) {
          throw insertError;
        }

        console.log('  ✅ Embedding stored successfully');
        successCount++;

        // Add a small delay to avoid rate limiting
        if (i < postsToProcess.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`  ❌ Error processing post "${post.title}":`, error);
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Backfill Summary:');
    console.log(`  ✅ Successfully processed: ${successCount}`);
    console.log(`  ❌ Failed: ${failCount}`);
    console.log(`  📝 Total: ${postsToProcess.length}`);
    console.log('='.repeat(50));

    if (successCount > 0) {
      console.log('\n✨ Embeddings backfill completed successfully!');
      console.log('🎯 You can now create posts and they will be compared for similarity.');
    }

  } catch (error) {
    console.error('❌ Fatal error during backfill:', error);
    process.exit(1);
  }
}

// Run the backfill
backfillEmbeddings()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
