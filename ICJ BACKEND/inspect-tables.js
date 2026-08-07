import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jztgterwkhvoygnhdjgs.supabase.co";
const supabaseKey = "sb_publishable_S-mPy5HWQApSbyeEFUvKYQ_qlZDxC9s";

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectAllTables() {
  console.log("Inspecting all Supabase tables...\n");

  try {
    // Try to fetch from potentially existing transaction tables
    const potentialTables = [
      "wallet_transactions",
      "token_transactions",
      "transactions",
      "wallet_history",
      "token_history"
    ];

    console.log("=== CHECKING FOR TRANSACTION TABLES ===");
    for (const tableName of potentialTables) {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .limit(1);
      
      if (!error) {
        console.log(`✓ ${tableName} - EXISTS`);
        if (data && data.length > 0) {
          console.log(`  Columns: ${Object.keys(data[0]).join(", ")}`);
        }
      } else {
        if (error.code === "PGRST116") {
          console.log(`✗ ${tableName} - does not exist`);
        }
      }
    }

    // Get members table sample
    console.log("\n=== MEMBERS TABLE SAMPLE ===");
    const { data: memberSample, error: memberError } = await supabase
      .from("members")
      .select("*")
      .limit(1);

    if (memberError) {
      console.log("Error fetching member sample:", memberError.message);
    } else if (memberSample && memberSample.length > 0) {
      console.log("Columns:", Object.keys(memberSample[0]).join(", "));
      console.log("\nSample member balance fields:");
      console.log(`  - wallet_balance: ${memberSample[0].wallet_balance}`);
      console.log(`  - token_balance: ${memberSample[0].token_balance}`);
    }

  } catch (error) {
    console.error("Error:", error.message);
  }
}

inspectAllTables();
