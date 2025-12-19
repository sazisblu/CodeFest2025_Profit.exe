const topojson = require('topojson-client');
const fs = require('fs');
const path = require('path');

// Path to TopoJSON file
const TOPOJSON_PATH = path.join(__dirname, "scripts/nepal-wards.topojson");
const TARGET_MUNICIPALITY = "Bhaktapur";

function testBoundaries() {
  try {
    console.log('Testing TopoJSON loading...');
    console.log('File path:', TOPOJSON_PATH);
    
    // Check if file exists
    if (!fs.existsSync(TOPOJSON_PATH)) {
      console.error(`TopoJSON file not found at path: ${TOPOJSON_PATH}`);
      return;
    }
    console.log('✅ File exists');
    
    // Read and parse file
    const topoData = JSON.parse(fs.readFileSync(TOPOJSON_PATH, "utf8"));
    console.log('✅ File parsed successfully');
    
    // Check structure
    if (!topoData || !topoData.objects) {
      console.error('❌ Invalid TopoJSON structure: missing objects property');
      return;
    }
    console.log('✅ TopoJSON structure valid');
    
    console.log('Available object keys:', Object.keys(topoData.objects));
    
    // Get the first object key
    const objectKey = Object.keys(topoData.objects)[0];
    if (!objectKey) {
      console.error('❌ No objects found in TopoJSON');
      return;
    }
    console.log('Using object key:', objectKey);
    
    // Convert TopoJSON to GeoJSON
    console.log('Converting TopoJSON to GeoJSON...');
    const geoData = topojson.feature(topoData, topoData.objects[objectKey]);
    
    if (!geoData || !geoData.features) {
      console.error('❌ Failed to convert TopoJSON to GeoJSON');
      return;
    }
    console.log('✅ Conversion successful');
    console.log('Total features:', geoData.features.length);
    
    // Filter for Bhaktapur
    const bhaktapurWards = geoData.features.filter((feature) => {
      const props = feature.properties;
      const palika = props.PALIKA || props.palika || '';
      return palika.toLowerCase() === TARGET_MUNICIPALITY.toLowerCase();
    });
    
    console.log('Bhaktapur wards found:', bhaktapurWards.length);
    
    if (bhaktapurWards.length > 0) {
      console.log('Sample ward properties:', bhaktapurWards[0].properties);
    } else {
      console.log('Available PALIKA values (first 10):');
      geoData.features.slice(0, 10).forEach((feature, idx) => {
        const props = feature.properties;
        console.log(`  ${idx + 1}: ${props.PALIKA || props.palika || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testBoundaries();