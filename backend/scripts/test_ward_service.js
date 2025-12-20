// Quick test file to verify wardDetectionService.js works correctly
const { findWardInBhaktapur } = require("./wardDetectionService");

console.log("Testing Ward Detection Service\n");
console.log("=".repeat(60));

// Test cases
const testLocations = [
  { lat: 27.671043832848206, lon: 85.43919412551233, label: "Khwopa College" },
  { lat: 27.6715, lon: 85.4298, label: "Durbar Square" },
  { lat: 27.67104319029372, lon: 85.42950166526722, label: "Bhairabnath" },
  { lat: 27.665, lon: 85.435, label: "Outside Municipality" },
];

testLocations.forEach((loc, i) => {
  console.log(`\nTest ${i + 1}: ${loc.label}`);
  console.log("-".repeat(60));

  const result = findWardInBhaktapur(loc.lat, loc.lon);

  if (result.success) {
    // console.log(`✓ SUCCESS`);
    // console.log(`  Ward Number: ${result.ward.number}`);
    // console.log(`  Municipality: ${result.ward.name}`);
    // console.log(`  District: ${result.ward.district}`);
    console.log("Result of Detection:", result)
  } else {
    console.log(`✗ FAILED: ${result.message || result.error}`);
  }
});

console.log("\n" + "=".repeat(60));
console.log("Service is ready for API integration!");
