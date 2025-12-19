import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase credentials in .env file");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test connection
(async () => {
  try {
    const { data, error } = await supabase.from("tags").select("count");
    if (error) throw error;
    console.log("✅ Successfully connected to Supabase");
  } catch (error) {
    console.error(
      "❌ Failed to connect to Supabase:",
      error instanceof Error ? error.message : error
    );
  }
})();

export default supabase;
