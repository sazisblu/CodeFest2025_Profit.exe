'use client';
import { useEffect, useRef, useState, Fragment } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Circle, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HeatmapIssue } from '@/types/issue';

// Fix for default markers in React Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface HeatmapVisualizationProps {
  data: HeatmapIssue[];
  selectedWard: number | null;
}

interface WardBoundary {
  coordinates: [number, number][];
  properties: {
    wardNumber: number;
    name: string;
    district: string;
    province: number;
    type: string;
  };
}

// Priority classification system with vibrant colors
interface PriorityLevel {
  level: 'critical' | 'high' | 'moderate' | 'low';
  color: string;
  intensity: number;
  baseRadius: number;
}

const getPriorityLevel = (priority: number): PriorityLevel => {
  if (priority >= 15) {
    return { level: 'critical', color: '#ff0000', intensity: 1.0, baseRadius: 100 }; // Bright red
  } else if (priority >= 10) {
    return { level: 'high', color: '#ff6600', intensity: 0.9, baseRadius: 80 }; // Bright orange
  } else if (priority >= 5) {
    return { level: 'moderate', color: '#ffcc00', intensity: 0.7, baseRadius: 60 }; // Bright yellow
  } else {
    return { level: 'low', color: '#00ff88', intensity: 0.5, baseRadius: 40 }; // Bright green
  }
};

// Vibrant category-based color mapping for gradient cores
const getCategoryColor = (tagId: string): string => {
  const categoryColors: Record<string, string> = {
    '19344d1e-059e-43c5-9cfd-1b75b0c7881f': '#0066ff', // Education - Electric Blue
    '233f9adf-5c19-4d39-8452-904f3a33c77f': '#ffdd00', // Street Lighting - Bright Yellow
    '29b499a4-864c-4804-a1fb-c8bbaa8c4aaa': '#00cc44', // Waste Management - Lime Green
    '32a8cb09-a8b3-48cb-a99b-4ed1c0317d1b': '#ff0099', // Public Safety - Hot Pink
    '7690ef81-96ef-4575-9e3e-cf49d4f2bf83': '#00cccc', // Sanitation - Cyan
    '7f61ac8e-34c8-4554-a052-67039207a572': '#ff3333', // Water Supply - Bright Red
    '87a5dd77-8e4e-40f0-9221-bff6912bca1d': '#ff7700', // Roads & Transportation - Vivid Orange
    'a076cd97-63b0-4005-99f8-03f5e5fe2fcd': '#9933ff', // Drainage - Electric Purple
    'a65ae199-1384-40fc-ab1c-386baef41781': '#666666', // Infrastructure - Dark Gray
    'a6a07259-77e0-4947-91b8-d1961c978c67': '#4444ff', // Electricity - Electric Blue
    'c39db7a6-a2a0-4f8d-8fba-cbeb1f792661': '#00ff66', // Parks & Recreation - Spring Green
    'ed514dad-6c40-4e22-aa3e-29a2e94244a4': '#ff1166', // Healthcare - Deep Pink
  };
  return categoryColors[tagId] || '#888888'; // Default gray
};

// Generate irregular shape points around a center
const generateIrregularShape = (center: [number, number], baseRadius: number, points: number = 8): [number, number][] => {
  const shape: [number, number][] = [];
  const radiusInMeters = baseRadius;
  
  // Convert meters to approximate lat/lng offset (rough approximation)
  const latOffset = radiusInMeters / 111000; // 1 degree lat ≈ 111km
  const lngOffset = radiusInMeters / (111000 * Math.cos(center[0] * Math.PI / 180));
  
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    
    // Add randomness to create irregular shape (20-80% of base radius)
    const radiusVariation = 0.6 + Math.random() * 0.4;
    const currentLatOffset = latOffset * radiusVariation;
    const currentLngOffset = lngOffset * radiusVariation;
    
    const lat = center[0] + Math.sin(angle) * currentLatOffset;
    const lng = center[1] + Math.cos(angle) * currentLngOffset;
    shape.push([lat, lng]);
  }
  
  // Close the shape
  shape.push(shape[0]);
  return shape;
};

export default function HeatmapVisualization({ data, selectedWard }: HeatmapVisualizationProps) {
  // Bhaktapur center coordinates
  const bhaktapurCenter: [number, number] = [27.6710, 85.4298];
  
  // State for ward boundaries - RESTORED
  const [wardBoundaries, setWardBoundaries] = useState<{ [key: number]: WardBoundary }>({});
  const [boundariesLoading, setBoundariesLoading] = useState(true);

  // Load ward boundaries from API - RESTORED
  useEffect(() => {
    const fetchWardBoundaries = async () => {
      try {
        setBoundariesLoading(true);
        const response = await fetch('http://localhost:5000/api/wards/boundaries');
        
        if (!response.ok) {
          throw new Error('Failed to fetch ward boundaries');
        }
        
        const result = await response.json();
        
        if (result.success && result.boundaries) {
          setWardBoundaries(result.boundaries);
          console.log('Ward boundaries loaded successfully:', Object.keys(result.boundaries).length, 'wards');
        } else {
          throw new Error('Invalid ward boundaries response');
        }
      } catch (error) {
        console.error('Error loading ward boundaries:', error);
        
        // Fallback to basic boundaries if API fails
        console.log('Using fallback ward boundaries');
        const fallbackBoundaries = {
          1: { 
            coordinates: [[27.6650, 85.4200], [27.6700, 85.4200], [27.6700, 85.4280], [27.6650, 85.4280]] as [number, number][],
            properties: { wardNumber: 1, name: "Bhaktapur", district: "Bhaktapur", province: 3, type: "Nagarpalika" }
          },
          2: { 
            coordinates: [[27.6700, 85.4200], [27.6750, 85.4200], [27.6750, 85.4280], [27.6700, 85.4280]] as [number, number][],
            properties: { wardNumber: 2, name: "Bhaktapur", district: "Bhaktapur", province: 3, type: "Nagarpalika" }
          },
          // Add more fallback wards as needed...
        };
        setWardBoundaries(fallbackBoundaries);
      } finally {
        setBoundariesLoading(false);
      }
    };

    fetchWardBoundaries();
  }, []);

  // Filter data based on selected ward
  const filteredData = selectedWard 
    ? data.filter(issue => issue.ward === selectedWard)
    : data;

  // Calculate ward statistics for boundary styling
  const getWardStats = (wardNumber: number) => {
    const wardIssues = data.filter(issue => issue.ward === wardNumber);
    
    if (wardIssues.length === 0) return { count: 0, avgPriority: 0, intensity: 0 };
    
    const totalPriority = wardIssues.reduce((sum, issue) => sum + (issue.priority || 0), 0);
    const avgPriority = totalPriority / wardIssues.length;
    
    return {
      count: wardIssues.length,
      avgPriority,
      intensity: Math.min(avgPriority + (wardIssues.length * 0.5), 20)
    };
  };

  const getWardColor = (wardNumber: number) => {
    const stats = getWardStats(wardNumber);
    
    if (stats.intensity >= 15) return '#ff4444';  // Bright red for high intensity
    if (stats.intensity >= 10) return '#ff8800';  // Bright orange for medium-high
    if (stats.intensity >= 5) return '#ffcc00';   // Bright yellow for medium
    if (stats.intensity >= 2) return '#88cc00';   // Light green for low
    if (stats.intensity > 0) return '#00cc88';    // Green for very low
    return '#e2e8f0'; // Light gray for no issues
  };

  const getWardOpacity = (wardNumber: number) => {
    const stats = getWardStats(wardNumber);
    if (stats.intensity === 0) return 0.2;
    return Math.min(0.3 + (stats.intensity * 0.03), 0.6); // Subtle background
  };

  // Create enhanced irregular gradient shapes for issues
  const createIssueShapes = (issue: HeatmapIssue) => {
    const priorityLevel = getPriorityLevel(issue.priority || 0);
    const categoryColor = getCategoryColor(issue.tag_id || '');
    
    const shapes = [];
    const layers = 5; // More layers for smoother gradient
    
    for (let i = 0; i < layers; i++) {
      const layerRadius = priorityLevel.baseRadius * (1 - i * 0.18); // Gradual decrease
      const layerOpacity = (priorityLevel.intensity * 0.9) * (1 - i * 0.15); // Smooth fade
      
      // Generate irregular shape for each layer
      const shapePoints = generateIrregularShape(
        [issue.latitude, issue.longitude],
        layerRadius,
        12 // More points for smoother curves
      );
      
      shapes.push(
        <Polygon
          key={`${issue.id}-shape-${i}`}
          positions={shapePoints}
          pathOptions={{
            fillColor: i === 0 ? categoryColor : priorityLevel.color,
            color: 'transparent',
            weight: 0,
            fillOpacity: layerOpacity,
          }}
        />
      );
    }
    
    return shapes;
  };

  // Create enhanced center marker
  const createIssueMarker = (issue: HeatmapIssue) => {
    const priorityLevel = getPriorityLevel(issue.priority || 0);
    const categoryColor = getCategoryColor(issue.tag_id || '');
    
    const customIcon = L.divIcon({
      className: '',
      html: `<div style="
        background: radial-gradient(circle, ${categoryColor} 0%, ${priorityLevel.color} 70%, transparent 100%);
        width: 20px;
        height: 20px;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 3px 12px rgba(0,0,0,0.5);
        position: relative;
        animation: pulse 2s infinite;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background: ${categoryColor};
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(0,0,0,0.4);
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10],
    });

    return (
      <Marker
        key={`marker-${issue.id}`}
        position={[issue.latitude, issue.longitude]}
        icon={customIcon}
      >
        <Popup>
          <div className="p-3 max-w-xs">
            <h4 className="font-bold text-lg mb-2 text-slate-800">{issue.title}</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600">Description:</span>
                <span className="text-sm font-medium text-right max-w-[150px]">{issue.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Location:</span>
                <span className="text-sm font-medium">{issue.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ward:</span>
                <span className="text-sm font-medium">Ward {issue.ward}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Priority Level:</span>
                <span className={`text-sm font-bold px-2 py-1 rounded-full text-white text-xs`}
                      style={{ backgroundColor: priorityLevel.color }}>
                  {priorityLevel.level.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Priority Score:</span>
                <span className="text-sm font-bold" style={{ color: priorityLevel.color }}>
                  {issue.priority?.toFixed(1) || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Issue ID:</span>
                <span className="text-sm font-mono">#{issue.id}</span>
              </div>
            </div>
          </div>
        </Popup>
      </Marker>
    );
  };

  return (
    <MapContainer
      center={bhaktapurCenter}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Loading indicator for boundaries */}
      {boundariesLoading && (
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
          <span className="text-sm text-slate-600">Loading ward boundaries...</span>
        </div>
      )}
      
      {/* Ward boundaries - RESTORED */}
      {Object.entries(wardBoundaries).map(([wardNum, wardData]) => {
        const wardNumber = parseInt(wardNum);
        const wardStats = getWardStats(wardNumber);
        const isSelected = selectedWard === wardNumber || selectedWard === null;
        
        return (
          <Polygon
            key={`ward-${wardNumber}`}
            positions={wardData.coordinates}
            pathOptions={{
              fillColor: getWardColor(wardNumber),
              weight: isSelected ? 3 : 2,
              opacity: isSelected ? 0.9 : 0.6,
              color: selectedWard === wardNumber ? '#0066ff' : '#333333',
              dashArray: isSelected ? undefined : '5, 5',
              fillOpacity: getWardOpacity(wardNumber),
            }}
          >
            <Popup>
              <div className="p-3">
                <h3 className="font-bold text-lg text-slate-800">Ward {wardNumber}</h3>
                <p className="text-sm text-gray-600 mb-3">{wardData.properties.name} Municipality</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total Issues:</span>
                    <span className="text-sm font-bold text-blue-600">{wardStats.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Avg Priority:</span>
                    <span className="text-sm font-bold" style={{ color: getWardColor(wardNumber) }}>
                      {wardStats.avgPriority.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Intensity:</span>
                    <span className="text-sm font-bold text-red-600">
                      {wardStats.intensity.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Polygon>
        );
      })}
      
      {/* Render irregular gradient shapes for each issue */}
      {filteredData.map((issue) => (
        <Fragment key={`issue-${issue.id}`}>
          {/* Irregular gradient layers */}
          {createIssueShapes(issue)}
          {/* Enhanced center marker */}
          {createIssueMarker(issue)}
        </Fragment>
      ))}
      
      {/* Enhanced Priority Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-xl max-w-xs border border-slate-200">
        <h4 className="font-bold text-sm mb-3 text-slate-800">🔥 Priority Heat Map</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full" style={{ background: 'radial-gradient(circle, #00ff88 20%, transparent 80%)' }}></div>
            <span className="font-medium">Low Priority (0-5)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full" style={{ background: 'radial-gradient(circle, #ffcc00 20%, transparent 80%)' }}></div>
            <span className="font-medium">Moderate Priority (5-10)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full" style={{ background: 'radial-gradient(circle, #ff6600 20%, transparent 80%)' }}></div>
            <span className="font-medium">High Priority (10-15)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full" style={{ background: 'radial-gradient(circle, #ff0000 20%, transparent 80%)' }}></div>
            <span className="font-medium">Critical Priority (15+)</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-600 leading-relaxed">
            🎯 <strong>Core colors</strong> = Issue categories<br/>
            📏 <strong>Shape size</strong> = Priority intensity<br/>
            🌊 <strong>Heat areas</strong> = Issue clusters<br/>
            🗺️ <strong>Ward boundaries</strong> = Administrative areas
          </p>
        </div>
      </div>
      
      {/* Issue count indicator */}
      <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-slate-200">
        <span className="text-sm font-bold text-slate-800">
          📍 {filteredData.length} Issues {selectedWard ? `in Ward ${selectedWard}` : 'Total'}
        </span>
      </div>
    </MapContainer>
  );
}