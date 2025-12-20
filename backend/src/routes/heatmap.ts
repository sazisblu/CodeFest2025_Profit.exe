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
 * Helper function to extract latitude and longitude from location field
 */
function extractCoordinates(location: any): {
  latitude: number;
  longitude: number;
} {
  let latitude: number = 27.6715; // Default Bhaktapur coordinates
  let longitude: number = 85.4298;

  if (typeof location === "string") {
    try {
      const parsed = JSON.parse(location);
      latitude = parsed.latitude || parsed.lat || latitude;
      longitude = parsed.longitude || parsed.lon || parsed.lng || longitude;
    } catch {
      const parts = location.split(",");
      if (parts.length === 2) {
        const lat = parseFloat(parts[0].trim());
        const lon = parseFloat(parts[1].trim());
        if (!isNaN(lat) && !isNaN(lon)) {
          latitude = lat;
          longitude = lon;
        }
      }
    }
  } else if (typeof location === "object" && location !== null) {
    latitude = location.latitude || location.lat || latitude;
    longitude = location.longitude || location.lon || location.lng || longitude;
  }

  // Validate and use default Bhaktapur coordinates if location is invalid
  if (isNaN(latitude) || isNaN(longitude)) {
    latitude = 27.6715;
    longitude = 85.4298;
  }

  console.log("🗺️ latitude and logitude:", latitude, longitude);
  return { latitude, longitude };
}

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
    const ward = issue.ward?.number;
    const category = issue.tagId;

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
      `🗺️  [/api/heatmap/all] Fetching all issues${
        category ? ` for category: ${category}` : ""
      }`
    );

    // Build the query
    let query = supabase
      .from("posts")
      .select(
        "id, title, description, tag_id, location, created_at, likes_count, comments_count"
      );

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
      });
    }

    console.log(`✓ Fetched ${posts.length} posts from database`);

    // Process each post to add ward information and calculate priority
    const processedPosts = await Promise.all(
      posts.map(async (post) => {
        // Extract coordinates
        const { latitude, longitude } = extractCoordinates(post.location);

        // Find ward for this post's location
        const wardInfo = findWardInBhaktapur(latitude, longitude);

        // Calculate priority using the priority service
        let priority = 0;
        try {
          priority = await calculatePriorityScore(post.id);
        } catch (error) {
          console.error(
            `⚠️  Error calculating priority for post ${post.id}:`,
            error
          );
          // Fallback calculation
          priority =
            (post.likes_count || 0) * 2 + (post.comments_count || 0) * 3 + 1;
        }

        return {
          id: post.id,
          title: post.title,
          description: post.description,
          tagId: post.tag_id,
          location: {
            latitude: latitude,
            longitude: longitude,
          },
          ward:
            wardInfo.success && wardInfo.inMunicipality
              ? {
                  number: wardInfo.ward.number,
                  name: wardInfo.ward.name,
                  district: wardInfo.ward.district,
                }
              : null,
          priority: priority,
          likesCount: post.likes_count || 0,
          commentsCount: post.comments_count || 0,
          createdAt: post.created_at,
        };
      })
    );

    // Generate summary statistics
    const summary = generateSummaryStats(processedPosts);

    console.log(
      `✓ Processed ${processedPosts.length} posts with ward information`
    );

    res.json({
      success: true,
      count: processedPosts.length,
      filter: {
        category: category || "all",
        ward: "all",
      },
      issues: processedPosts,
      summary: summary,
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
      `🗺️  [/api/heatmap/ward/${wardNum}] Fetching issues${
        category ? ` for category: ${category}` : ""
      }`
    );

    // Build the query
    let query = supabase
      .from("posts")
      .select(
        "id, title, description, tag_id, location, created_at, likes_count, comments_count"
      );

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
      });
    }

    console.log(`✓ Fetched ${posts.length} posts from database`);

    // Process and filter posts by ward
    const processedPosts = await Promise.all(
      posts.map(async (post) => {
        // Extract coordinates
        const { latitude, longitude } = extractCoordinates(post.location);

        // Find ward for this post's location
        const wardInfo = findWardInBhaktapur(latitude, longitude);

        // Skip posts not in the requested ward
        if (
          !wardInfo.success ||
          !wardInfo.inMunicipality ||
          wardInfo.ward.number !== wardNum
        ) {
          return null;
        }

        // Calculate priority using the priority service
        let priority = 0;
        try {
          priority = await calculatePriorityScore(post.id);
        } catch (error) {
          console.error(
            `⚠️  Error calculating priority for post ${post.id}:`,
            error
          );
          priority =
            (post.likes_count || 0) * 2 + (post.comments_count || 0) * 3 + 1;
        }

        return {
          id: post.id,
          title: post.title,
          description: post.description,
          tagId: post.tag_id,
          location: {
            latitude: latitude,
            longitude: longitude,
          },
          ward: {
            number: wardInfo.ward.number,
            name: wardInfo.ward.name,
            district: wardInfo.ward.district,
          },
          priority: priority,
          likesCount: post.likes_count || 0,
          commentsCount: post.comments_count || 0,
          createdAt: post.created_at,
        };
      })
    );

    // Filter out nulls (posts not in requested ward)
    const wardPosts = processedPosts.filter((post) => post !== null);

    // Generate summary statistics
    const summary = generateSummaryStats(wardPosts);

    console.log(`✓ Found ${wardPosts.length} posts in ward ${wardNum}`);

    res.json({
      success: true,
      count: wardPosts.length,
      filter: {
        category: category || "all",
        ward: wardNum,
      },
      issues: wardPosts,
      summary: summary,
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
    console.log("🗺️  [/api/heatmap/summary] Fetching aggregated statistics");

    const { data: posts, error } = await supabase
      .from("posts")
      .select("id, tag_id, location, likes_count, comments_count");

    if (error) {
      console.error("❌ Database error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch posts",
      });
    }

    console.log(`✓ Fetched ${posts.length} posts from database`);

    const wardStats: Record<number, any> = {};
    const categoryStats: Record<string, any> = {};

    for (const post of posts) {
      // Extract coordinates
      const { latitude, longitude } = extractCoordinates(post.location);

      const wardInfo = findWardInBhaktapur(latitude, longitude);

      if (wardInfo.success && wardInfo.inMunicipality) {
        const wardNum = wardInfo.ward.number;

        // Initialize ward stats
        if (!wardStats[wardNum]) {
          wardStats[wardNum] = {
            ward: wardNum,
            name: wardInfo.ward.name,
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
            `⚠️  Error calculating priority for post ${post.id}:`,
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
