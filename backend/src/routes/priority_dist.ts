import { Router } from "express";
import { supabase } from "../config/supabase";
import { calculatePriorityScore } from "../services/priorityService";

const router = Router();

// Priority ranges for categorization
const PRIORITY_RANGES = {
  critical: { min: 4.0, max: 5.0, label: "Critical" },
  high: { min: 3.0, max: 4.0, label: "High" },
  medium: { min: 2.0, max: 3.0, label: "Medium" },
  low: { min: 0.0, max: 2.0, label: "Low" }
};

interface PriorityCount {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface PriorityDistributionResponse {
  success: boolean;
  message?: string;
  data?: {
    total: number;
    distribution: {
      critical: { count: number; percentage: number; label: string };
      high: { count: number; percentage: number; label: string };
      medium: { count: number; percentage: number; label: string };
      low: { count: number; percentage: number; label: string };
    };
  };
}

function categorizePriority(priority: number): keyof PriorityCount {
  if (priority >= PRIORITY_RANGES.critical.min) return 'critical';
  if (priority >= PRIORITY_RANGES.high.min) return 'high';
  if (priority >= PRIORITY_RANGES.medium.min) return 'medium';
  return 'low';
}

// GET /api/priority_dist/all - Get priority distribution for all wards
router.get("/all", async (req, res) => {
  try {
    console.log("📊 Fetching priority distribution for all wards...");
    
    const { data: posts, error } = await supabase
      .from("posts")
      .select("id, likes_count, threads_count, tag_id");

    if (error) {
      console.error("❌ Error fetching posts:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch posts",
        error: error.message,
      } as PriorityDistributionResponse);
    }

    if (!posts || posts.length === 0) {
      console.log("⚠️ No posts found");
      return res.json({
        success: true,
        data: {
          total: 0,
          distribution: {
            critical: { count: 0, percentage: 0, label: PRIORITY_RANGES.critical.label },
            high: { count: 0, percentage: 0, label: PRIORITY_RANGES.high.label },
            medium: { count: 0, percentage: 0, label: PRIORITY_RANGES.medium.label },
            low: { count: 0, percentage: 0, label: PRIORITY_RANGES.low.label },
          }
        }
      } as PriorityDistributionResponse);
    }

    // Calculate priority for each post and categorize
    const counts: PriorityCount = { critical: 0, high: 0, medium: 0, low: 0 };
    
    console.log(`🔢 Calculating priorities for ${posts.length} posts...`);
    
    for (const post of posts) {
      try {
        const priorityScore = await calculatePriorityScore(post.id);
        const category = categorizePriority(priorityScore);
        counts[category]++;
      } catch (error) {
        console.error(`⚠️ Failed to calculate priority for post ${post.id}:`, error);
        // Default to low priority if calculation fails
        counts.low++;
      }
    }

    const total = posts.length;

    console.log(`✅ Successfully processed ${total} posts for priority distribution`);
    console.log("📊 Distribution:", counts);

    return res.json({
      success: true,
      data: {
        total,
        distribution: {
          critical: { 
            count: counts.critical, 
            percentage: Math.round((counts.critical / total) * 100),
            label: PRIORITY_RANGES.critical.label 
          },
          high: { 
            count: counts.high, 
            percentage: Math.round((counts.high / total) * 100),
            label: PRIORITY_RANGES.high.label 
          },
          medium: { 
            count: counts.medium, 
            percentage: Math.round((counts.medium / total) * 100),
            label: PRIORITY_RANGES.medium.label 
          },
          low: { 
            count: counts.low, 
            percentage: Math.round((counts.low / total) * 100),
            label: PRIORITY_RANGES.low.label 
          },
        }
      }
    } as PriorityDistributionResponse);

  } catch (error) {
    console.error("❌ Unexpected error in GET /priority_dist/all:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    } as PriorityDistributionResponse);
  }
});

// GET /api/priority_dist/ward/:wardNumber - Get priority distribution for specific ward
router.get("/ward/:wardNumber", async (req, res) => {
  try {
    const wardNumber = parseInt(req.params.wardNumber);
    
    if (isNaN(wardNumber) || wardNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid ward number. Must be a positive integer.",
      } as PriorityDistributionResponse);
    }

    console.log(`📊 Fetching priority distribution for ward ${wardNumber}...`);
    
    const { data: posts, error } = await supabase
      .from("posts")
      .select("id, likes_count, threads_count, tag_id, ward_no")
      .eq("ward_no", wardNumber);

    if (error) {
      console.error("❌ Error fetching posts for ward:", error);
      return res.status(500).json({
        success: false,
        message: `Failed to fetch posts for ward ${wardNumber}`,
        error: error.message,
      } as PriorityDistributionResponse);
    }

    if (!posts || posts.length === 0) {
      console.log(`⚠️ No posts found for ward ${wardNumber}`);
      return res.json({
        success: true,
        data: {
          total: 0,
          distribution: {
            critical: { count: 0, percentage: 0, label: PRIORITY_RANGES.critical.label },
            high: { count: 0, percentage: 0, label: PRIORITY_RANGES.high.label },
            medium: { count: 0, percentage: 0, label: PRIORITY_RANGES.medium.label },
            low: { count: 0, percentage: 0, label: PRIORITY_RANGES.low.label },
          }
        }
      } as PriorityDistributionResponse);
    }

    // Calculate priority for each post and categorize
    const counts: PriorityCount = { critical: 0, high: 0, medium: 0, low: 0 };
    
    console.log(`🔢 Calculating priorities for ${posts.length} posts in ward ${wardNumber}...`);
    
    for (const post of posts) {
      try {
        const priorityScore = await calculatePriorityScore(post.id);
        const category = categorizePriority(priorityScore);
        counts[category]++;
      } catch (error) {
        console.error(`⚠️ Failed to calculate priority for post ${post.id}:`, error);
        // Default to low priority if calculation fails
        counts.low++;
      }
    }

    const total = posts.length;

    console.log(`✅ Successfully processed ${total} posts for ward ${wardNumber} priority distribution`);
    console.log("📊 Distribution:", counts);

    return res.json({
      success: true,
      data: {
        total,
        distribution: {
          critical: { 
            count: counts.critical, 
            percentage: Math.round((counts.critical / total) * 100),
            label: PRIORITY_RANGES.critical.label 
          },
          high: { 
            count: counts.high, 
            percentage: Math.round((counts.high / total) * 100),
            label: PRIORITY_RANGES.high.label 
          },
          medium: { 
            count: counts.medium, 
            percentage: Math.round((counts.medium / total) * 100),
            label: PRIORITY_RANGES.medium.label 
          },
          low: { 
            count: counts.low, 
            percentage: Math.round((counts.low / total) * 100),
            label: PRIORITY_RANGES.low.label 
          },
        }
      }
    } as PriorityDistributionResponse);

  } catch (error) {
    console.error(`❌ Unexpected error in GET /priority_dist/ward/:wardNumber:`, error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    } as PriorityDistributionResponse);
  }
});

export default router;