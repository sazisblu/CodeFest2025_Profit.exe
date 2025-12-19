'use client';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
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

export default function HeatmapVisualization({ data, selectedWard }: HeatmapVisualizationProps) {
  // Bhaktapur center coordinates
  const bhaktapurCenter: [number, number] = [27.6710, 85.4298];
  
  // State for ward boundaries
  const [wardBoundaries, setWardBoundaries] = useState<{ [key: number]: WardBoundary }>({});
  const [boundariesLoading, setBoundariesLoading] = useState(true);

  // Load ward boundaries from API
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
        
        // Fallback to mock boundaries if API fails
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

  // Calculate total priority intensity for a ward using API priority values
  const getWardPriorityIntensity = (wardNumber: number) => {
    const wardIssues = data.filter(issue => issue.ward === wardNumber);
    
    if (wardIssues.length === 0) return 0;
    
    // Sum all priority scores from API
    const totalPriority = wardIssues.reduce((sum, issue) => {
      return sum + (issue.priority || 0);
    }, 0);
    
    // Calculate average priority intensity
    const averagePriority = totalPriority / wardIssues.length;
    
    // Weight by issue count (more issues = higher overall intensity)
    const countFactor = Math.min(wardIssues.length * 0.1, 1); // Max +1 from count
    
    return averagePriority + (averagePriority * countFactor);
  };

  const getWardColor = (wardNumber: number) => {
    const priorityIntensity = getWardPriorityIntensity(wardNumber);
    
    if (priorityIntensity >= 15) return '#dc2626';  // Dark red for critical (15+)
    if (priorityIntensity >= 12) return '#ef4444';  // Red for high (12-14.9)
    if (priorityIntensity >= 8) return '#f59e0b';   // Orange for medium-high (8-11.9)
    if (priorityIntensity >= 5) return '#eab308';   // Yellow for medium (5-7.9)
    if (priorityIntensity >= 2) return '#84cc16';   // Light green for low (2-4.9)
    if (priorityIntensity > 0) return '#22c55e';    // Green for very low (0.1-1.9)
    return '#e2e8f0'; // Light gray for no issues
  };

  const getWardOpacity = (wardNumber: number) => {
    const priorityIntensity = getWardPriorityIntensity(wardNumber);
    if (priorityIntensity === 0) return 0.3;
    return Math.min(0.4 + (priorityIntensity * 0.04), 0.9); // Dynamic opacity based on priority
  };

  const createCustomIcon = () => {
    const color = '#3b82f6'; // blue for all issues
    
    return L.divIcon({
      className: '',
      html: `<div style="
        background-color: ${color};
        width: 12px;
        height: 12px;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
      popupAnchor: [0, -6],
    });
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
        <div className="absolute top-4 right-4 z-10 bg-white px-3 py-2 rounded-lg shadow-md">
          <span className="text-sm text-gray-600">Loading ward boundaries...</span>
        </div>
      )}
      
      {/* Ward boundaries */}
      {Object.entries(wardBoundaries).map(([wardNum, wardData]) => {
        const wardNumber = parseInt(wardNum);
        const priorityIntensity = getWardPriorityIntensity(wardNumber);
        const isSelected = selectedWard === wardNumber || selectedWard === null;
        
        return (
          <Polygon
            key={wardNumber}
            positions={wardData.coordinates}
            pathOptions={{
              fillColor: getWardColor(wardNumber),
              weight: isSelected ? 3 : 2,
              opacity: isSelected ? 1 : 0.8,
              color: selectedWard === wardNumber ? '#0f766e' : '#166534',
              dashArray: isSelected ? undefined : '5, 5',
              fillOpacity: getWardOpacity(wardNumber),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg">Ward {wardNumber}</h3>
                <p className="text-sm text-gray-600 mb-2">{wardData.properties.name} Municipality</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Issues:</span>
                    <span className="font-semibold">{data.filter(issue => issue.ward === wardNumber).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Priority Intensity:</span>
                    <span className="font-semibold text-red-600">
                      {getWardPriorityIntensity(wardNumber).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Priority:</span>
                    <span className="font-semibold text-blue-600">
                      {data.filter(issue => issue.ward === wardNumber).length > 0
                        ? (getWardPriorityIntensity(wardNumber) / data.filter(issue => issue.ward === wardNumber).length).toFixed(1)
                        : '0'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Polygon>
        );
      })}
      
      {/* Issue markers */}
      {data.map((issue) => (
        <Marker
          key={issue.id}
          position={[issue.latitude, issue.longitude]}
          icon={createCustomIcon()}
        >
          <Popup>
            <div className="p-3 max-w-xs">
              <h4 className="font-bold text-lg mb-2">{issue.title}</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Description:</span>
                  <span className="text-sm font-medium">{issue.description}</span>
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
                  <span className="text-sm text-gray-600">Priority:</span>
                  <span className={`text-sm font-bold ${
                    issue.priority >= 8 ? 'text-red-600' : 
                    issue.priority >= 5 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {issue.priority || 'N/A'}
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
      ))}
    </MapContainer>
  );
}