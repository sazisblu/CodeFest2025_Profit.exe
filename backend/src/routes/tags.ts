import { Router } from "express";
import { supabase } from "../config/supabase";

const router = Router();

// GET /api/tags - Get all tags
router.get("/", async (req, res) => {
  try {
    console.log("📋 Fetching all tags...");
    
    const { data: tags, error } = await supabase
      .from("tags")
      .select("id, name, weight")
      .order("name", { ascending: true });

    if (error) {
      console.error("❌ Error fetching tags:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch tags",
        error: error.message,
      });
    }

    console.log(`✅ Successfully fetched ${tags?.length || 0} tags`);

    return res.json({
      success: true,
      count: tags?.length || 0,
      tags: tags || [],
    });
  } catch (error) {
    console.error("❌ Unexpected error in GET /tags:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/tags/:id - Get a specific tag by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📋 Fetching tag with ID: ${id}`);
    
    const { data: tag, error } = await supabase
      .from("tags")
      .select("id, name, weight")
      .eq("id", id)
      .single();

    if (error) {
      console.error("❌ Error fetching tag:", error);
      return res.status(404).json({
        success: false,
        message: "Tag not found",
        error: error.message,
      });
    }

    console.log(`✅ Successfully fetched tag: ${tag.name}`);

    return res.json({
      success: true,
      tag,
    });
  } catch (error) {
    console.error("❌ Unexpected error in GET /tags/:id:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;