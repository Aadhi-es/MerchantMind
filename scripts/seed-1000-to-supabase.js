const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const url = "https://zhgwvlcgemaqziumcytm.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoZ3d2bGNnZW1hcXppdW1jeXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODUzNjQ3NSwiZXhwIjoyMTA0MTEyNDc1fQ.pSwGg-D59oDuCUFaOX6GV4_45tR8cjQ70luP1b8nbW4";
const supabase = createClient(url, key);

// Re-use generator logic to get JSON array directly
const generatorScript = require("./generate-1000-products-sql.js");

// We can extract generate1000Products by evaluating or requiring
async function seedAll() {
  console.log("Reading products for direct Supabase upload...");
  // Let's execute the generator function directly
  eval(fs.readFileSync(path.join(__dirname, "generate-1000-products-sql.js"), "utf8"));
  const products = generate1000Products();
  console.log(`Prepared ${products.length} products to upload.`);

  const BATCH_SIZE = 100;
  let uploaded = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from("products")
      .upsert(batch, { onConflict: "sku" })
      .select("sku");

    if (error) {
      console.error(`Error in batch ${i / BATCH_SIZE + 1}:`, error.message);
      break;
    }

    uploaded += data.length;
    console.log(`Uploaded batch ${i / BATCH_SIZE + 1}/${Math.ceil(products.length / BATCH_SIZE)} (${uploaded}/${products.length} products)`);
  }

  const { count } = await supabase.from("products").select("count", { count: "exact", head: true });
  console.log(`\nAll done! Total products in Supabase: ${count}`);
}

seedAll();
