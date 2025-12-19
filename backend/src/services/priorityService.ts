import supabase from "../utils/supabase";

export async function calculatePriorityScore(postId: string): Promise<number> {
  try {
    console.log(`  🔢 Calculating priority score for post: ${postId}`);

    // Fetch post details with likes_count and comments_count
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, likes_count, comments_count, tag_id")
      .eq("id", postId)
      .single();

    if (postError) {
      console.error(`  ❌ Error fetching post ${postId}:`, postError);
      throw postError;
    }

    console.log(
      `  ✓ Post data fetched: likes=${post.likes_count}, comments=${post.comments_count}`
    );

    // Fetch category weight
    const { data: tag, error: tagError } = await supabase
      .from("tags")
      .select("weight")
      .eq("id", post.tag_id)
      .single();

    if (tagError) {
      console.error(`  ⚠️ Error fetching tag:`, tagError);
    }

    const categoryWeight = tag?.weight || 1.0;
    console.log(`  ✓ Category weight: ${categoryWeight}`);

    const likesCount = post.likes_count || 0;
    const commentsCount = post.comments_count || 0;

    // Priority Score = (Likes × 2) + (Comments × 3) + Category Weight
    const priorityScore = likesCount * 2 + commentsCount * 3 + categoryWeight;

    console.log(
      `  ✓ Formula: (${likesCount} × 2) + (${commentsCount} × 3) + ${categoryWeight} = ${priorityScore}`
    );

    return priorityScore;
  } catch (error) {
    console.error(
      "Error calculating priority score:",
      error instanceof Error ? error.message : error
    );
    throw error;
  }
}
