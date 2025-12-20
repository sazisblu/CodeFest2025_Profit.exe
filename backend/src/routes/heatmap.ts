import express, { Request, Response, Router } from "express";
import supabase from "../utils/supabase";
import { calculatePriorityScore } from "../services/priorityService";

// Import the ward detection service
const path = require("path");
const wardServicePath = path.join(
  __dirname,
  "../../scripts/wardDetectionService.js"
);
const { findWardInBhaktapur } = require(wardServicePath);

const router: Router = express.Router();

/**
 * Helper function to generate summary statistics
 */
function generateSummaryStats(issues: any[]) {
  const summary = {
    totalIssues: issues.length,
    byWard: {} as Record<number, any>,
    byCategory: {} as Record<string, any>,
    avgPriority: 0,
    totalPriority: 0,
  };

  issues.forEach((issue) => {
    const ward = issue.ward;
    const category = issue.tag_id;

    // Total priority
    summary.totalPriority += issue.priority;

    // Count by ward
    if (ward) {
      if (!summary.byWard[ward]) {
        summary.byWard[ward] = {
          count: 0,
          totalPriority: 0,
          avgPriority: 0,
        };
      }
      summary.byWard[ward].count++;
      summary.byWard[ward].totalPriority += issue.priority;
    }

    // Count by category
    if (category) {
      if (!summary.byCategory[category]) {
        summary.byCategory[category] = {
          count: 0,
          totalPriority: 0,
          avgPriority: 0,
        };
      }
      summary.byCategory[category].count++;
      summary.byCategory[category].totalPriority += issue.priority;
    }
  });

  // Calculate averages
  summary.avgPriority =
    summary.totalIssues > 0 ? summary.totalPriority / summary.totalIssues : 0;

  Object.values(summary.byWard).forEach((w) => {
    w.avgPriority = w.count > 0 ? w.totalPriority / w.count : 0;
  });

  Object.values(summary.byCategory).forEach((c) => {
    c.avgPriority = c.count > 0 ? c.totalPriority / c.count : 0;
  });

  return summary;
}

/**
 * GET /api/heatmap/all
 * Get ALL issues across ALL wards with optional category filter
 */
router.get("/all", async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    console.log(
      `🗺️ [/api/heatmap/all] Fetching all xsues${
        category ? ` for category: ${category}` : ""
      }`
    );

    // Build the query - NOW INCLUDING latitude, longitude, ward_no columns
    let query = supabase
      .from("posts")
      .select(
        "id, title, description, tag_id, location, latitude, longitude, ward_no, created_at, likes_count, threads_count"
      );

    // Apply category filter if provided
    if (category) {
      query = query.eq("tag_id", category);
    }

    // Only get posts that have coordinates
    query = query.not("latitude", "is", null).not("longitude", "is", null);

    const { data: posts, error } = await query;

    if (error) {
      console.error("❌ Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch posts from database",
        details: error.message,
      });
    }

    console.log(`✓ Fetched ${posts.length} posts with coordinates from database`);

    // Process each post
    const processedPosts = await Promise.all(
      posts.map(async (post) => {
        // Use the latitude and longitude directly from database columns
        const latitude = post.latitude;
        const longitude = post.longitude;

        // Use ward_no if available, otherwise calculate it
        let wardNumber = post.ward_no;
        
        if (!wardNumber && latitude && longitude) {
          // Fallback: calculate ward using ward detection service
          const wardInfo = findWardInBhaktapur(latitude, longitude);
          if (wardInfo.success && wardInfo.inMunicipality) {
            wardNumber = wardInfo.ward.number;
          }
        }

        // Calculate priority using the priority service
        let priority = 0;
        try {
          priority = await calculatePriorityScore(post.id);
        } catch (error) {
          console.error(
            `⚠️ Error calculating priority for post ${post.id}:`,
            error
          );
          // Fallback calculation
          priority =
            (post.likes_count || 0) * 2 + (post.threads_count || 0) * 3 + 1;
        }

        return {
          id: post.id,
          title: post.title,
          description: post.description,
          location: post.location,
          latitude: latitude,
          longitude: longitude,
          ward: wardNumber,
          tag_id: post.tag_id,
          priority: priority,
          likes_count: post.likes_count || 0,
          threads_count: post.threads_count || 0,
          created_at: post.created_at,
        };
      })
    );

    // Filter out posts without valid coordinates or ward
    const validPosts = processedPosts.filter(post => 
      post.latitude && post.longitude && post.ward
    );

    console.log(
      `✓ Processed ${validPosts.length} valid posts with coordinates and ward information`
    );

    res.json({
      success: true,
      count: validPosts.length,
      filter: {
        category: category || "all",
        ward: "all",
      },
      issues: validPosts,
    });

  } catch (error) {
    console.error("❌ Error in heatmap/all API:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/heatmap/ward/:wardNumber
 * Get issues for a SPECIFIC ward with optional category filter
 */
router.get("/ward/:wardNumber", async (req: Request, res: Response) => {
  try {
    const { wardNumber } = req.params;
    const { category } = req.query;

    // Validate ward number
    const wardNum = parseInt(wardNumber);
    if (isNaN(wardNum) || wardNum < 1 || wardNum > 10) {
      return res.status(400).json({
        success: false,
        error: "Invalid ward number. Must be between 1 and 10.",
      });
    }

    console.log(
      `🗺️ [/api/heatmap/ward/${wardNum}] Fetching issues${
        category ? ` for category: ${category}` : ""
      }`
    );

    // Build the query
    let query = supabase
      .from("posts")
      .select(
        "id, title, description, tag_id, location, latitude, longitude, ward_no, created_at, likes_count, threads_count"
      )
      .eq("ward_no", wardNum)  // Filter by ward_no column
      .not("latitude", "is", null)
      .not("longitude", "is", null);

    // Apply category filter if provided
    if (category) {
      query = query.eq("tag_id", category);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error("❌ Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch posts from database",
        details: error.message,
      });
    }

    console.log(`✓ Fetched ${posts.length} posts for ward ${wardNum} from database`);

    // Process posts
    const processedPosts = await Promise.all(
      posts.map(async (post) => {
        // Calculate priority using the priority service
        let priority = 0;
        try {
          priority = await calculatePriorityScore(post.id);
        } catch (error) {
          console.error(
            `⚠️ Error calculating priority for post ${post.id}:`,
            error
          );
          priority =
            (post.likes_count || 0) * 2 + (post.threads_count || 0) * 3 + 1;
        }

        return {
          id: post.id,
          title: post.title,
          description: post.description,
          location: post.location,
          latitude: post.latitude,
          longitude: post.longitude,
          ward: post.ward_no,
          tag_id: post.tag_id,
          priority: priority,
          likes_count: post.likes_count || 0,
          threads_count: post.threads_count || 0,
          created_at: post.created_at,
        };
      })
    );

    console.log(`✓ Processed ${processedPosts.length} posts for ward ${wardNum}`);

    res.json({
      success: true,
      count: processedPosts.length,
      filter: {
        category: category || "all",
        ward: wardNum,
      },
      issues: processedPosts,
    });

  } catch (error) {
    console.error("❌ Error in heatmap/ward API:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/heatmap/summary
 * Get aggregated statistics for all wards and categories
 */
router.get("/summary", async (req: Request, res: Response) => {
  try {
    console.log("🗺️ [/api/heatmap/summary] Fetching aggregated statistics");

    const { data: posts, error } = await supabase
      .from("posts")
      .select("id, tag_id, latitude, longitude, ward_no, likes_count, threads_count")
      .not("latitude", "is", null)
      .not("longitude", "is", null);

    if (error) {
      console.error("❌ Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch posts",
        details: error.message,
      });
    }

    console.log(`✓ Fetched ${posts.length} posts from database`);

    const wardStats: Record<number, any> = {};
    const categoryStats: Record<string, any> = {};

    for (const post of posts) {
      const wardNum = post.ward_no;

      if (wardNum) {
        // Initialize ward stats
        if (!wardStats[wardNum]) {
          wardStats[wardNum] = {
            ward: wardNum,
            issueCount: 0,
            totalPriority: 0,
            avgPriority: 0,
            byCategory: {} as Record<string, any>,
          };
        }

        // Calculate priority
        try {
          const priority = await calculatePriorityScore(post.id);

          // Update ward stats
          wardStats[wardNum].issueCount++;
          wardStats[wardNum].totalPriority += priority;

          // Update category stats within ward
          const category = post.tag_id;
          if (!wardStats[wardNum].byCategory[category]) {
            wardStats[wardNum].byCategory[category] = {
              count: 0,
              totalPriority: 0,
              avgPriority: 0,
            };
          }
          wardStats[wardNum].byCategory[category].count++;
          wardStats[wardNum].byCategory[category].totalPriority += priority;

          // Update overall category stats
          if (!categoryStats[category]) {
            categoryStats[category] = {
              category: category,
              issueCount: 0,
              totalPriority: 0,
              avgPriority: 0,
            };
          }
          categoryStats[category].issueCount++;
          categoryStats[category].totalPriority += priority;
        } catch (error) {
          console.error(
            `⚠️ Error calculating priority for post ${post.id}:`,
            error
          );
        }
      }
    }

    // Calculate averages
    Object.values(wardStats).forEach((stat) => {
      stat.avgPriority =
        stat.issueCount > 0 ? stat.totalPriority / stat.issueCount : 0;
      Object.values(stat.byCategory).forEach((catStat: any) => {
        catStat.avgPriority =
          catStat.count > 0 ? catStat.totalPriority / catStat.count : 0;
      });
    });

    Object.values(categoryStats).forEach((stat) => {
      stat.avgPriority =
        stat.issueCount > 0 ? stat.totalPriority / stat.issueCount : 0;
    });

    console.log(
      `✓ Generated summary for ${Object.keys(wardStats).length} wards`
    );

    res.json({
      success: true,
      byWard: Object.values(wardStats).sort((a, b) => a.ward - b.ward),
      byCategory: Object.values(categoryStats),
    });

  } catch (error) {
    console.error("❌ Error fetching summary stats:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;