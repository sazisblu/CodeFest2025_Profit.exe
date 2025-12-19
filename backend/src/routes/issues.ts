import express, { Request, Response, Router } from "express";
import supabase from "../utils/supabase";
import { calculatePriorityScore } from "../services/priorityService";

const router: Router = express.Router();

// Helper function to format time
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
}

// Get all issues with calculated priority scores
router.get("/issues", async (req: Request, res: Response) => {
  try {
    console.log("🔍 [/api/issues] Request received");

    // Fetch all posts with related data
    console.log("📡 Fetching posts from Supabase...");
    const { data: posts, error } = await supabase
      .from("posts")
      .select(
        `
        id,
        title,
        location,
        description,
        likes_count,
        comments_count,
        created_at,
        user_id,
        tag_id,
        image_url
      `
      )
      .order("created_at", { ascending: false });

    console.log("📊 Supabase Response:", {
      hasError: !!error,
      dataLength: posts?.length || 0,
    });

    if (error) {
      console.error("❌ Supabase fetch error:", error);
      throw error;
    }

    console.log(`✅ Fetched ${posts?.length || 0} posts from Supabase`);

    if (!posts || posts.length === 0) {
      console.log("⚠️ No posts found in database");
      return res.json([]);
    }

    // Fetch all unique tags
    const tagIds = [...new Set(posts.map((p: any) => p.tag_id).filter(Boolean))];
    let tagsMap: { [key: string]: string } = {};
    
    if (tagIds.length > 0) {
      const { data: tags, error: tagsError } = await supabase
        .from("tags")
        .select("id, name")
        .in("id", tagIds);

      if (!tagsError && tags) {
        tagsMap = tags.reduce((acc: any, tag: any) => {
          acc[tag.id] = tag.name;
          return acc;
        }, {});
        console.log("✅ Fetched tags:", tagsMap);
      }
    }

    console.log("🔄 Calculating priority scores for each post...");

    // Calculate priority score for each post
    const issuesWithScores = await Promise.all(
      posts.map(async (post: any) => {
        try {
          console.log(`  → Processing post: ${post.id} (${post.title})`);

          const priorityScore = await calculatePriorityScore(post.id);
          console.log(`    ✓ Priority score: ${priorityScore}`);

          const commentCount = post.comments_count || 0;
          const likesCount = post.likes_count || 0;
          const tagName = post.tag_id ? tagsMap[post.tag_id] || "Other" : "Other";

          const mappedPost = {
            id: post.id,
            image:
              post.image_url || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=80&h=80&fit=crop",
            title: post.title,
            location: post.location,
            category: tagName,
            categoryColor: "text-blue-700",
            priority: Math.round(priorityScore),
            status: "Pending",
            statusColor: "text-yellow-700",
            submitted: getTimeAgo(post.created_at),
            description: post.description,
            likes: likesCount,
            commentCount: commentCount,
            reportsCount: commentCount,
            engagement:
              commentCount > 10 ? "High Engagement" : "Medium Engagement",
            timeAgo: getTimeAgo(post.created_at),
            recentReports: [],
          };

          return mappedPost;
        } catch (postError) {
          console.error(`  ❌ Error processing post ${post.id}:`, postError);
          throw postError;
        }
      })
    );

    console.log(`📊 Mapped ${issuesWithScores.length} issues successfully`);

    // Sort by priority score (highest first)
    issuesWithScores.sort((a, b) => b.priority - a.priority);

    console.log("✨ Issues sorted by priority");
    console.log("📤 Sending response...");

    res.json(issuesWithScores);
    console.log("✅ [/api/issues] Response sent successfully");
  } catch (error) {
    console.error(
      "🔴 [/api/issues] Error:",
      error instanceof Error ? error.message : error
    );
    console.error("📋 Full error details:", error);

    res.status(500).json({
      error: "Failed to fetch issues",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get single issue with details and comments
router.get("/issues/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select(
        `
        id,
        title,
        location,
        description,
        likes_count,
        comments_count,
        created_at,
        user_id,
        tag_id,
        image_url,
        post_comments(
          id,
          content,
          user_id,
          created_at,
          users(display_name, photo_url)
        )
      `
      )
      .eq("id", id)
      .single();

    if (postError) throw postError;

    // Fetch tag name using tag_id
    let tagName = "Other";
    if (post.tag_id) {
      const { data: tag, error: tagError } = await supabase
        .from("tags")
        .select("name")
        .eq("id", post.tag_id)
        .single();

      if (!tagError && tag) {
        tagName = tag.name;
      }
    }

    const priorityScore = await calculatePriorityScore(id);
    const commentCount = post.comments_count || 0;
    const likesCount = post.likes_count || 0;

    res.json({
      id: post.id,
      image:
        post.image_url ||
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=80&h=80&fit=crop",
      title: post.title,
      location: post.location,
      category: tagName,
      categoryColor: "text-blue-700",
      priority: Math.round(priorityScore),
      status: "Pending",
      statusColor: "text-yellow-700",
      submitted: getTimeAgo(post.created_at),
      description: post.description,
      likes: likesCount,
      commentCount: commentCount,
      reportsCount: commentCount,
      engagement: commentCount > 10 ? "High Engagement" : "Medium Engagement",
      timeAgo: getTimeAgo(post.created_at),
      recentReports: post.post_comments.map((comment: any) => ({
        name: comment.users?.display_name || "Anonymous",
        report: comment.content,
        timeAgo: getTimeAgo(comment.created_at),
        avatar: (comment.users?.display_name?.[0] || "U").toUpperCase(),
        image: comment.users?.photo_url || null,
      })),
    });
  } catch (error) {
    console.error(
      "Error fetching issue:",
      error instanceof Error ? error.message : error
    );
    res.status(500).json({
      error: "Failed to fetch issue",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
