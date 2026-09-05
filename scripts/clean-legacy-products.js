const { createClient } = require("@supabase/supabase-js");
const url = "https://zhgwvlcgemaqziumcytm.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ3d2bGNnZW1hcXppdW1jeXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODUzNjQ3NSwiZXhwIjoyMTA0MTEyNDc1fQ.pSwGg-D59oDuCUFaOX6GV4_45tR8cjQ70luP1b8nbW4";
const supabase = createClient(url, key);

async function clean() {
  const { data, error } = await supabase
    .from("products")
    .delete()
    .like("sku", "PROD-%")
    .select("sku, name");

  console.log("Deleted legacy demo items:", data?.length, "Error:", error);
}

clean();
