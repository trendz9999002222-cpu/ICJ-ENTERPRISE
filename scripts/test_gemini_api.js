/**
 * Gemini API Live Test — ICJ Portal
 * Run: node scripts/test_gemini_api.js YOUR_API_KEY_HERE
 */

const apiKey = process.argv[2];

if (!apiKey) {
  console.log("\n❌ API Key नहीं दी गई!");
  console.log("Usage: node scripts/test_gemini_api.js AIzaSy...\n");
  process.exit(1);
}

console.log("\n🔍 Gemini API Test शुरू हो रहा है...");
console.log("📡 Endpoint: generativelanguage.googleapis.com");
console.log("🤖 Model: gemini-1.5-flash");
console.log("🔑 Key:", apiKey.substring(0, 10) + "..." + apiKey.slice(-4));
console.log("─".repeat(60));

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

const body = JSON.stringify({
  contents: [{
    parts: [{
      text: "Reply with valid JSON only (no markdown): {\"status\": \"ok\", \"message\": \"Gemini API is working for ICJ Legal Portal\", \"model\": \"gemini-1.5-flash\"}"
    }]
  }],
  generationConfig: {
    responseMimeType: "application/json"
  }
});

fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body
})
.then(async res => {
  const data = await res.json();

  if (res.ok) {
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("\n✅ SUCCESS! Gemini API चल रही है!");
    console.log("📊 HTTP Status:", res.status);
    console.log("📝 Response:", text.trim());
    console.log("\n🎉 आपकी API Key 100% सही है। ICJ Portal में use कर सकते हैं।");
    console.log("\n📌 LocalStorage Key: icj_gemini_api_key");
    console.log("📌 Master Key (Admin): icj_master_gemini_key\n");
  } else {
    console.log("\n❌ ERROR! Gemini API से error आया:");
    console.log("📊 HTTP Status:", res.status);
    
    if (data?.error?.message) {
      console.log("🚨 Error Message:", data.error.message);
      
      if (data.error.message.includes("API_KEY_INVALID") || data.error.message.includes("API key not valid")) {
        console.log("\n⚠️  समस्या: API Key गलत है या expire हो गई है।");
        console.log("🔗 नई Key यहाँ से लें: https://aistudio.google.com/apikey\n");
      } else if (data.error.message.includes("RESOURCE_EXHAUSTED") || data.error.message.includes("quota")) {
        console.log("\n⚠️  समस्या: Free quota खत्म हो गया है।");
        console.log("🔗 Billing enable करें: https://console.cloud.google.com/billing\n");
      } else if (data.error.message.includes("billing")) {
        console.log("\n⚠️  समस्या: Billing account से linked नहीं है।");
        console.log("🔗 Billing setup: https://console.cloud.google.com/billing\n");
      }
    }
  }
})
.catch(err => {
  console.log("\n❌ Network Error:", err.message);
  console.log("⚠️  Internet connection check करें।\n");
});
