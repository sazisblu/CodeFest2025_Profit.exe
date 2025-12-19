import express from 'express';
const topojson = require('topojson-client'); // Use require for better compatibility
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Path to TopoJSON file
const TOPOJSON_PATH = path.join(__dirname, "../../scripts/nepal-wards.topojson");
const TARGET_MUNICIPALITY = "Bhaktapur";

// Cache for ward boundaries to avoid repeated file reads
let cachedBhaktapurBoundaries: any = null;

/**
 * Load and process Bhaktapur ward boundaries
 */
function getBhaktapurWardBoundaries() {
  // Return cached data if available
  if (cachedBhaktapurBoundaries) {
    return cachedBhaktapurBoundaries;
  }
  
  try {
    // Check if file exists
    if (!fs.existsSync(TOPOJSON_PATH)) {
      throw new Error(`TopoJSON file not found at path: ${TOPOJSON_PATH}`);
    }
    
    console.log('Loading TopoJSON from:', TOPOJSON_PATH);
    const topoData = JSON.parse(fs.readFileSync(TOPOJSON_PATH, "utf8"));
    
    // Validate TopoJSON structure
    if (!topoData || !topoData.objects) {
      throw new Error('Invalid TopoJSON structure: missing objects property');
    }
    
    console.log('TopoJSON objects keys:', Object.keys(topoData.objects));
    
    // Get the first object key from TopoJSON
    const objectKey = Object.keys(topoData.objects)[0];
    if (!objectKey) {
      throw new Error('No objects found in TopoJSON');
    }
    
    console.log('Using TopoJSON object key:', objectKey);
    
    // Convert TopoJSON to GeoJSON
    const geoData = topojson.feature(topoData, topoData.objects[objectKey]);
    
    if (!geoData || !geoData.features) {
      throw new Error('Failed to convert TopoJSON to GeoJSON or no features found');
    }
    
    console.log('Total features found:', geoData.features.length);
    
    // Filter for Bhaktapur Municipality wards only
    const bhaktapurWards = geoData.features.filter((feature: any) => {
      const props = feature.properties;
      const palika = props.PALIKA || props.palika || '';
      
      // Match specifically "Bhaktapur" municipality
      return palika.toLowerCase() === TARGET_MUNICIPALITY.toLowerCase();
    });
    
    console.log('Bhaktapur wards found:', bhaktapurWards.length);
    
    // Process ward boundaries for frontend consumption
    const wardBoundaries: any = {};
    
    bhaktapurWards.forEach((ward: any) => {
      const props = ward.properties;
      const wardNumber = props.WARD || props.ward;
      
      if (wardNumber && ward.geometry) {
        // Extract coordinates for the ward
        let coordinates: number[][] = [];
        
        if (ward.geometry.type === 'Polygon') {
          coordinates = ward.geometry.coordinates[0]; // Take outer ring
        } else if (ward.geometry.type === 'MultiPolygon') {
          // For multipolygon, take the largest polygon
          let largestPolygon = ward.geometry.coordinates[0];
          let maxArea = 0;
          
          ward.geometry.coordinates.forEach((polygon: number[][][]) => {
            const area = polygon[0].length;
            if (area > maxArea) {
              maxArea = area;
              largestPolygon = polygon;
            }
          });
          
          coordinates = largestPolygon[0]; // Take outer ring of largest polygon
        }
        
        // Convert from [lon, lat] to [lat, lon] for Leaflet
        const leafletCoordinates = coordinates.map(coord => [coord[1], coord[0]]);
        
        wardBoundaries[wardNumber] = {
          coordinates: leafletCoordinates,
          properties: {
            wardNumber: wardNumber,
            name: props.PALIKA || props.palika || TARGET_MUNICIPALITY,
            district: props.DISTRICT || props.district || "Bhaktapur",
            province: props.PROVINCE || props.province || 3,
            type: props.TYPE || props.type || "Nagarpalika"
          }
        };
      }
    });
    
    // Cache the result
    cachedBhaktapurBoundaries = wardBoundaries;
    
    return wardBoundaries;
  } catch (error: any) {
    console.error("Error loading ward boundaries:", error.message);
    throw new Error(`Failed to load ward boundaries: ${error.message}`);
  }
}

/**
 * GET /api/wards/boundaries
 * Get Bhaktapur Municipality ward boundaries
 */
router.get('/boundaries', (req, res) => {
  try {
    const wardBoundaries = getBhaktapurWardBoundaries();
    
    res.json({
      success: true,
      municipality: TARGET_MUNICIPALITY,
      district: "Bhaktapur",
      totalWards: Object.keys(wardBoundaries).length,
      boundaries: wardBoundaries
    });
  } catch (error: any) {
    console.error('Error fetching ward boundaries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ward boundaries',
      message: error.message
    });
  }
});

/**
 * GET /api/wards/boundaries/:wardNumber
 * Get specific ward boundary
 */
router.get('/boundaries/:wardNumber', (req, res) => {
  try {
    const wardNumber = parseInt(req.params.wardNumber);
    
    if (isNaN(wardNumber) || wardNumber < 1 || wardNumber > 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ward number. Must be between 1 and 10.'
      });
    }
    
    const wardBoundaries = getBhaktapurWardBoundaries();
    const wardBoundary = wardBoundaries[wardNumber];
    
    if (!wardBoundary) {
      return res.status(404).json({
        success: false,
        error: `Ward ${wardNumber} not found in Bhaktapur Municipality`
      });
    }
    
    res.json({
      success: true,
      wardNumber: wardNumber,
      municipality: TARGET_MUNICIPALITY,
      boundary: wardBoundary
    });
  } catch (error: any) {
    console.error('Error fetching ward boundary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ward boundary',
      message: error.message
    });
  }
});

export default router;