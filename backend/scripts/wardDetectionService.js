const turf = require("@turf/turf");
const topojson = require("topojson-client");
const fs = require("fs");
const path = require("path");

// File paths
const GEOJSON_PATH = path.join(__dirname, "nepal-wards.geojson");
const TOPOJSON_PATH = path.join(__dirname, "nepal-wards.topojson");

// Municipality name
const TARGET_MUNICIPALITY = "Bhaktapur";

// Cache for TopoJSON data to avoid repeated file reads
let cachedBhaktapurWards = null;

/**
 * Load TopoJSON and extract Bhaktapur Municipality wards
 */
function loadBhaktapurWardsFromTopojson() {
  // Return cached data if available
  if (cachedBhaktapurWards) {
    return cachedBhaktapurWards;
  }
  
  try {
    const topoData = JSON.parse(fs.readFileSync(TOPOJSON_PATH, "utf8"));
    
    // Get the first object key from TopoJSON
    const objectKey = Object.keys(topoData.objects)[0];
    
    // Convert TopoJSON to GeoJSON
    const geoData = topojson.feature(topoData, topoData.objects[objectKey]);
    
    // Filter for Bhaktapur Municipality wards only
    const bhaktapurWards = geoData.features.filter(feature => {
      const props = feature.properties;
      const palika = props.PALIKA || props.palika || '';
      
      // Match specifically "Bhaktapur" municipality (not other municipalities in district)
      return palika.toLowerCase() === TARGET_MUNICIPALITY.toLowerCase();
    });
    
    // Cache the result
    cachedBhaktapurWards = bhaktapurWards;
    
    return bhaktapurWards;
  } catch (error) {
    console.error("Error loading TopoJSON:", error.message);
    return null;
  }
}

/**
 * Check if point is in Bhaktapur Municipality using GeoJSON
 */
function isInBhaktapurMunicipality(lat, lon) {
  try {
    const geoData = JSON.parse(fs.readFileSync(GEOJSON_PATH, "utf8"));
    const point = turf.point([lon, lat]);
    
    // Find BhaktapurN.P. polygon
    const bhaktapurNP = geoData.features.find(f => 
      f.properties.VDC_NAME === "BhaktapurN.P."
    );
    
    if (!bhaktapurNP) {
      return false;
    }
    
    return turf.booleanPointInPolygon(point, bhaktapurNP);
  } catch (error) {
    throw new Error(`Error checking municipality: ${error.message}`);
  }
}

/**
 * Find specific ward within Bhaktapur Municipality
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Object} Ward information or error details
 */
function findWardInBhaktapur(lat, lon) {
  try {
    // Validate inputs
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return {
        success: false,
        error: "Invalid coordinates: latitude and longitude must be numbers"
      };
    }
    
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return {
        success: false,
        error: "Invalid coordinates: out of valid range"
      };
    }
    
    // Step 1: Check if in Bhaktapur Municipality
    const inBhaktapur = isInBhaktapurMunicipality(lat, lon);
    
    if (!inBhaktapur) {
      return {
        success: false,
        inMunicipality: false,
        message: "Location is not within Bhaktapur Municipality"
      };
    }
    
    // Step 2: Find specific ward from TopoJSON
    const bhaktapurWards = loadBhaktapurWardsFromTopojson();
    
    if (!bhaktapurWards || bhaktapurWards.length === 0) {
      return {
        success: false,
        inMunicipality: true,
        error: "Ward data not available"
      };
    }
    
    const point = turf.point([lon, lat]);
    
    // Check each ward
    for (const ward of bhaktapurWards) {
      if (turf.booleanPointInPolygon(point, ward)) {
        const props = ward.properties;
        
        return {
          success: true,
          inMunicipality: true,
          ward: {
            number: props.WARD || props.ward || null,
            name: props.PALIKA || props.palika || TARGET_MUNICIPALITY,
            district: props.DISTRICT || props.district || "Bhaktapur",
            province: props.PROVINCE || props.province || 3,
            type: props.TYPE || props.type || "Nagarpalika"
          },
          coordinates: {
            latitude: lat,
            longitude: lon
          }
        };
      }
    }
    
    // In municipality but no specific ward found (might be on border)
    return {
      success: false,
      inMunicipality: true,
      message: "Location is in Bhaktapur Municipality but specific ward not determined"
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { 
  findWardInBhaktapur
};
