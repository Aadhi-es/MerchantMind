const { createClient } = require("@supabase/supabase-js");
const url = "https://zhgwvlcgemaqziumcytm.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ3d2bGNnZW1hcXppdW1jeXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODUzNjQ3NSwiZXhwIjoyMTA0MTEyNDc1fQ.pSwGg-D59oDuCUFaOX6GV4_45tR8cjQ70luP1b8nbW4";
const supabase = createClient(url, key);

async function check() {
  const { count, error } = await supabase.from("products").select("*", { count: "exact", head: true });
  console.log("Supabase exact products count:", count, "Error:", error);

  // Let's also check distinct categories
  const { data: rows } = await supabase.from("products").select("sku, name, category, price").limit(10);
  console.log("Sample 10 rows:", rows);
}

check();
