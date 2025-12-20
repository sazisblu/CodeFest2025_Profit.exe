'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FaFilter, FaMapMarkerAlt } from 'react-icons/fa';
import { HeatmapIssue } from '@/types/issue';

// Dynamically import the map to avoid SSR issues
const HeatmapVisualization = dynamic(() => import('./HeatmapVisualization'), {
  ssr: false,
  loading: () => <div className="h-96 bg-slate-100 rounded-lg animate-pulse flex items-center justify-center">
    <span className="text-slate-500">Loading map...</span>
  </div>
});

interface HeatmapSectionProps {
  onCategoryChange?: (category: string) => void;
  onWardChange?: (ward: number | null) => void;
}

export default function HeatmapSection({ onCategoryChange, onWardChange }: HeatmapSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<number | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: '', name: 'All Categories' },
    { id: '19344d1e-059e-43c5-9cfd-1b75b0c7881f', name: 'Education' },
    { id: '233f9adf-5c19-4d39-8452-904f3a33c77f', name: 'Street Lighting' },
    { id: '29b499a4-864c-4804-a1fb-c8bbaa8c4aaa', name: 'Waste Management' },
    { id: '32a8cb09-a8b3-48cb-a99b-4ed1c0317d1b', name: 'Public Safety' },
    { id: '7690ef81-96ef-4575-9e3e-cf49d4f2bf83', name: 'Sanitation' },
    { id: '7f61ac8e-34c8-4554-a052-67039207a572', name: 'Water Supply' },
    { id: '87a5dd77-8e4e-40f0-9221-bff6912bca1d', name: 'Roads & Transportation' },
    { id: 'a076cd97-63b0-4005-99f8-03f5e5fe2fcd', name: 'Drainage' },
    { id: 'a65ae199-1384-40fc-ab1c-386baef41781', name: 'Infrastructure' },
    { id: 'a6a07259-77e0-4947-91b8-d1961c978c67', name: 'Electricity' },
    { id: 'c39db7a6-a2a0-4f8d-8fba-cbeb1f792661', name: 'Parks & Recreation' },
    { id: 'ed514dad-6c40-4e22-aa3e-29a2e94244a4', name: 'Healthcare' },
  ];

  const wards = [
    { id: null, name: 'All Wards' },
    ...Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Ward ${i + 1}` }))
  ];

  const fetchHeatmapData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build the API URL based on selections
      let apiUrl = 'http://localhost:5000/api/heatmap/all';
      
      // If a specific ward is selected, use the ward-specific endpoint
      if (selectedWard) {
        apiUrl = `http://localhost:5000/api/heatmap/ward/${selectedWard}`;
      }
      
      // Add category filter if selected
      if (selectedCategory) {
        const separator = apiUrl.includes('?') ? '&' : '?';
        apiUrl += `${separator}category=${selectedCategory}`;
      }

      console.log('Fetching heatmap data from:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Received heatmap data:', result);
      
      // Extract issues array from API response
      const dataArray = result.success && Array.isArray(result.issues) ? result.issues : [];
      setHeatmapData(dataArray);
      
      console.log(`Loaded ${dataArray.length} issues for map display`);
      
      if (dataArray.length === 0) {
        setError('No issues found for the selected filters');
      }
      
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      setError(`Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setHeatmapData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
  }, [selectedCategory, selectedWard]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    onCategoryChange?.(category);
  };

  const handleWardChange = (ward: number | null) => {
    setSelectedWard(ward);
    onWardChange?.(ward);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaMapMarkerAlt className="text-blue-600 text-xl" />
          <h3 className="text-lg font-semibold text-slate-900">Issues Heatmap - Bhaktapur Municipality</h3>
        </div>
        <div className="flex items-center gap-3">
          <FaFilter className="text-slate-400" />
          <span className="text-sm text-slate-600">Filter by:</span>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))} 
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Ward</label>
          <select
            value={selectedWard || ''}
            onChange={(e) => handleWardChange(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {wards.map((ward) => (
              <option key={ward.id || 'all'} value={ward.id || ''}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`mb-4 p-3 border rounded-lg ${
          error.includes('demo data') 
            ? 'bg-yellow-100 border-yellow-300 text-yellow-700' 
            : 'bg-red-100 border-red-300 text-red-700'
        }`}>
          {error}
        </div>
      )}

      {/* Map Container */}
      <div className="h-96 rounded-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="h-full bg-slate-100 animate-pulse flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <span className="text-slate-500">Loading heatmap...</span>
            </div>
          </div>
        ) : (
          <HeatmapVisualization data={heatmapData} selectedWard={selectedWard} />
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">Priority Intensity:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-xs text-slate-500">Low (0-5)</span>
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-xs text-slate-500">Medium (5-12)</span>
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-xs text-slate-500">High (12-15)</span>
            <div className="w-4 h-4 bg-red-700 rounded"></div>
            <span className="text-xs text-slate-500">Critical (15+)</span>
          </div>
        </div>
        <span className="text-sm text-slate-500">
          Total Issues: {Array.isArray(heatmapData) ? heatmapData.length : 0}
        </span>
      </div>


    </div>
  );
}