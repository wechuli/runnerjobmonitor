const baseUrl = "http://localhost:8080/api/metrics";
const sampleData = require("./src/data/sample.json");

async function testAPI() {
  console.log("🧪 Testing Job Metrics API\n");
  console.log("=====================================\n");

  try {
    // Test 1: POST - Store metrics
    console.log("1️⃣  POST /api/metrics - Storing job metrics...");
    const postResponse = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sampleData),
    });

    const postResult = await postResponse.json();
    console.log("✅ Response:", JSON.stringify(postResult, null, 2));
    console.log("\n");

    // Test 2: GET - Retrieve by job_uuid
    const jobUuid = sampleData.job_uuid;
    console.log(`2️⃣  GET /api/metrics/${jobUuid} - Retrieving metrics...`);
    const getResponse = await fetch(`${baseUrl}/${jobUuid}`);
    const getResult = await getResponse.json();
    console.log("✅ Response:", JSON.stringify(getResult, null, 2));
    console.log("\n");

    // Test 3: GET - All metrics with pagination
    console.log(
      "3️⃣  GET /api/metrics?page=1&limit=5 - Retrieving all metrics..."
    );
    const allResponse = await fetch(`${baseUrl}?page=1&limit=5`);
    const allResult = await allResponse.json();
    console.log("✅ Response:", JSON.stringify(allResult, null, 2));
    console.log("\n");

    console.log("=====================================");
    console.log("✨ All tests completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testAPI();
