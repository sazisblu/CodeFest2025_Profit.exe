'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaClipboardList, FaChartLine } from 'react-icons/fa';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import HeatmapSection from '@/components/HeatmapSection';

// Define interfaces for type safety
interface CategoryData {
  name: string;
  count: number;
  color: string;
}

interface Tag {
  id: string;
  name: string;
  weight: number;
}

interface Issue {
  id: number;
  title: string;
  description: string;
  tag_id: string;
  ward: number;
  priority: number;
}

interface HeatmapResponse {
  success: boolean;
  count: number;
  issues: Issue[];
}

interface PriorityDistribution {
  critical: { count: number; percentage: number; label: string };
  high: { count: number; percentage: number; label: string };
  medium: { count: number; percentage: number; label: string };
  low: { count: number; percentage: number; label: string };
}

interface PriorityDistributionResponse {
  success: boolean;
  message?: string;
  data?: {
    total: number;
    distribution: PriorityDistribution;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentDesign, setCurrentDesign] = useState(0);
  
  // New state for category data
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [selectedWard, setSelectedWard] = useState<number | 'all'>('all');
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [totalIssueCount, setTotalIssueCount] = useState<number>(1);

  // New state for priority distribution
  const [priorityData, setPriorityData] = useState<PriorityDistribution | null>(null);
  const [isLoadingPriority, setIsLoadingPriority] = useState(true);
  const [priorityError, setPriorityError] = useState<string | null>(null);

  // Default color mapping for categories - memoized to prevent re-renders
  const getColorForCategory = useCallback((categoryName: string): string => {
    const colorMap: Record<string, string> = {
      'Education': 'bg-blue-600',
      'Street Lighting': 'bg-yellow-600',
      'Waste Management': 'bg-green-600',
      'Public Safety': 'bg-pink-600',
      'Sanitation': 'bg-teal-600',
      'Water Supply': 'bg-red-600',
      'Roads & Transportation': 'bg-orange-600',
      'Drainage': 'bg-purple-600',
      'Infrastructure': 'bg-gray-600',
      'Electricity': 'bg-indigo-600',
      'Parks & Recreation': 'bg-emerald-600',
      'Healthcare': 'bg-rose-600',
    };
    return colorMap[categoryName] || 'bg-slate-600';
  }, []);

  const handleLogout = () => {
    router.push('/login');
  };

  const handleDraftProposal = () => {
    router.push('/citizen-proposals');
  };

  // Fetch tags from database
  const fetchTags = useCallback(async () => {
    setIsLoadingTags(true);
    try {
      const response = await fetch('http://localhost:5000/api/tags');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.tags) {
        setTags(data.tags);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      // Fallback to empty array if tags fetch fails
      setTags([]);
    } finally {
      setIsLoadingTags(false);
    }
  }, []);

  // Fetch category data
  const fetchCategoryData = useCallback(async (ward: number | 'all' = 'all') => {
    setIsLoadingCategories(true);
    setCategoryError(null);
    
    try {
      // Get data for selected ward
      const endpoint = ward === 'all' 
        ? '/api/heatmap/all' 
        : `/api/heatmap/ward/${ward}`;
      
      const response = await fetch(`http://localhost:5000${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: HeatmapResponse = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch heatmap data');
      }

      // Set total count based on the filtered data (ward-specific or all)
      setTotalIssueCount(data.count || 1);

      // Process issues to count by category
      const categoryCounts: Record<string, number> = {};
      
      data.issues.forEach((issue) => {
        const tagId = issue.tag_id;
        categoryCounts[tagId] = (categoryCounts[tagId] || 0) + 1;
      });

      // Convert to array and use actual tag names
      const processedData: CategoryData[] = Object.entries(categoryCounts)
        .map(([tagId, count]) => {
          const tag = tags.find(t => t.id === tagId);
          const categoryName = tag?.name || `Tag ${tagId}`;
          return {
            name: categoryName,
            count,
            color: getColorForCategory(categoryName)
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Show top 5 categories

      setCategoryData(processedData);
      
    } catch (error) {
      console.error('Error fetching category data:', error);
      setCategoryError(error instanceof Error ? error.message : 'Failed to load data');
      
      // Fallback to empty data
      setCategoryData([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [tags, getColorForCategory]);

  // Fetch priority distribution data
  const fetchPriorityData = useCallback(async (ward: number | 'all' = 'all') => {
    setIsLoadingPriority(true);
    setPriorityError(null);
    
    try {
      const endpoint = ward === 'all' 
        ? '/api/priority_dist/all' 
        : `/api/priority_dist/ward/${ward}`;
      
      const response = await fetch(`http://localhost:5000${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: PriorityDistributionResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch priority distribution data');
      }

      if (data.data) {
        setPriorityData(data.data.distribution);
      }
      
    } catch (error) {
      console.error('Error fetching priority data:', error);
      setPriorityError(error instanceof Error ? error.message : 'Failed to load priority data');
      
      // Fallback to null data
      setPriorityData(null);
    } finally {
      setIsLoadingPriority(false);
    }
  }, []);

  // Auto-rotate designs every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDesign((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch tags on component mount
  useEffect(() => {
    fetchTags();
  }, []);

  // Fetch category data when tags are loaded or when ward changes
  useEffect(() => {
    if (!isLoadingTags) {
      fetchCategoryData(selectedWard);
      fetchPriorityData(selectedWard);
    }
  }, [selectedWard, isLoadingTags, fetchCategoryData, fetchPriorityData]);

  const designs = [
    {
      title: 'Welcome Back',
      subtitle: 'Admin',
      icon: <FaCheckCircle className="text-5xl text-blue-600 mb-4" />,
      message: 'All systems operational'
    },
    {
      title: 'Your Dashboard',
      subtitle: 'Is Ready',
      icon: <FaClipboardList className="text-5xl text-blue-600 mb-4" />,
      message: '15 high priority items'
    },
    {
      title: 'Let\'s Make',
      subtitle: 'Progress',
      icon: <FaChartLine className="text-5xl text-blue-600 mb-4" />,
      message: '71 issues resolved'
    }
  ];

  const design = designs[currentDesign];

  // Blue-themed Recent Issues data
  const recentIssues = [
    { id: 92, title: 'Large pothole on Main Street', category: 'Road Damage', status: 'Pending', location: '123 Main Street, Downtown', time: 'about 1 year ago' },
    { id: 88, title: 'Overflowing garbage bins at Central Park', category: 'Waste Management', status: 'In Review', location: 'Central Park, Playground Area', time: 'about 1 year ago' },
    { id: 65, title: 'Broken street light on Elm Avenue', category: 'Street Light', status: 'Pending', location: '45 Elm Avenue, Residential District', time: 'about 1 year ago' },
  ];

  const statusStyles: Record<string, string> = {
    Pending: 'bg-blue-100 text-blue-700',
    'In Review': 'bg-blue-200 text-blue-800',
    Resolved: 'bg-blue-300 text-blue-900',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="ml-64 flex flex-col min-h-screen">
        <div className="sticky top-0 z-20">
          <Topbar activeTab={activeTab} onLogout={handleLogout} />
        </div>
        
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* ONLY DASHBOARD CONTENT - NO SWITCH CASES */}
            <div className="space-y-6">
              {/* Welcome Hero Section & Stats Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Welcome Square Section - Modern Monitor Design */}
                <div className="lg:col-span-1">
                  <div className="relative aspect-square flex flex-col items-center justify-center transition-all duration-500">
                    {/* Modern LED Monitor */}
                    <div className="w-full h-4/5 flex flex-col">
                      <div
                        className="flex-1 rounded-2xl overflow-hidden border-8 border-slate-600 shadow-2xl relative flex flex-col items-center justify-center p-6"
                        style={{ background: 'linear-gradient(135deg, #E8F4F8 0%, #F0F9FF 50%, #E0F2FE 100%)' }}
                      >
                        {/* Subtle top bezel light */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"></div>
                        
                        {/* Screen Content */}
                        <div className="w-full h-full flex flex-col items-center justify-center text-center space-y-2">
                          {/* Status Bar with Dashboard Title */}
                          <div className="w-full flex justify-between items-center px-4 py-2 mb-2">
                            <h3 className="text-xl font-bold" style={{color: '#2D3F7B'}}>Dashboard</h3>
                            <div className="flex gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: '#ADD8E6'}}></div>
                              <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: '#ADD8E6'}}></div>
                              <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: '#ADD8E6'}}></div>
                            </div>
                          </div>

                          {/* Modern Mini Chart Visualization */}
                          <svg className="w-24 h-20" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Grid background */}
                            <defs>
                              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2D3F7B" strokeWidth="0.3" opacity="0.2"/>
                              </pattern>
                            </defs>
                            <rect width="140" height="100" fill="url(#grid)" />
                            
                            {/* Modern bars with gradient */}
                            <rect x="18" y="60" width="14" height="30" fill="#10b981" rx="3" opacity="0.95"/>
                            <rect x="38" y="40" width="14" height="50" fill="#f59e0b" rx="3" opacity="0.95"/>
                            <rect x="58" y="20" width="14" height="70" fill="#dc2626" rx="3" opacity="0.95"/>
                            <rect x="78" y="50" width="14" height="40" fill="#10b981" rx="3" opacity="0.95"/>
                            <rect x="98" y="30" width="14" height="60" fill="#f59e0b" rx="3" opacity="0.95"/>
                            <rect x="118" y="55" width="14" height="35" fill="#dc2626" rx="3" opacity="0.95"/>
                          </svg>

                          <h2 className="text-xl font-bold tracking-tight" style={{color: '#19295C'}}>
                            {design.title}
                          </h2>
                          <p className="text-3xl font-black" style={{color: '#2D3F7B'}}>
                            {design.subtitle}
                          </p>
                          <p className="text-sm font-medium" style={{color: '#2D3F7B', opacity: 0.75}}>
                            {design.message}
                          </p>

                          {/* Modern Indicator dots */}
                          <div className="flex justify-center gap-2 pt-2">
                            {designs.map((_, idx) => (
                              <div
                                key={idx}
                                className={`rounded-full transition-all duration-300 ${
                                  idx === currentDesign ? 'bg-blue-600 w-5 h-2' : 'bg-blue-300 w-2 h-2'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modern Minimal Stand */}
                    <div className="w-2 h-8 bg-gradient-to-b from-slate-600 to-slate-500 shadow-lg -mt-1"></div>

                    {/* Sleek Base */}
                    <div className="w-3/4 h-2 bg-gradient-to-b from-slate-500 to-slate-600 rounded-full shadow-xl"></div>

                    {/* Subtle LED Power Indicator */}
                    <div className="absolute -bottom-6 right-6">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{boxShadow: '0 0 12px rgba(59, 130, 246, 0.8)'}}></div>
                    </div>
                  </div>

                  {/* Button Below Monitor */}
                  <div className="mt-10 flex justify-center">
                    <button 
                      onClick={handleDraftProposal}
                      className="text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg text-base hover:shadow-xl transform hover:scale-105"
                      style={{backgroundColor: '#2D3F7B'}}
                      onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = '#19295C'}
                      onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = '#2D3F7B'}
                    >
                      DRAFT A PROPOSAL
                    </button>
                  </div>
                </div>

                {/* Stats Cards Grid */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    <div className="bg-gradient-to-br from-white/90 via-blue-100/45 to-blue-200/30 backdrop-blur-md p-6 rounded-xl shadow-lg border border-blue-200/60">
                      <div className="flex flex-col items-start gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide" style={{color: '#2D3F7B'}}>Total Issues</p>
                        <p className="text-4xl font-bold leading-tight text-[#19295C]">128</p>
                        <p className="text-sm" style={{color: '#19295C', opacity: 0.7}}>All time submissions</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-white/90 via-blue-100/45 to-blue-200/30 backdrop-blur-md p-6 rounded-xl shadow-lg border border-blue-200/60">
                      <div className="flex flex-col items-start gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide" style={{color: '#2D3F7B'}}>High Priority</p>
                        <p className="text-4xl font-bold leading-tight text-[#19295C]">15</p>
                        <p className="text-sm" style={{color: '#19295C', opacity: 0.7}}>Requires immediate attention</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-white/90 via-blue-100/45 to-blue-200/30 backdrop-blur-md p-6 rounded-xl shadow-lg border border-blue-200/60">
                      <div className="flex flex-col items-start gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide" style={{color: '#2D3F7B'}}>In Progress</p>
                        <p className="text-4xl font-bold leading-tight text-[#19295C]">42</p>
                        <p className="text-sm" style={{color: '#19295C', opacity: 0.7}}>Currently being resolved</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-white/90 via-blue-100/45 to-blue-200/30 backdrop-blur-md p-6 rounded-xl shadow-lg border border-blue-200/60">
                      <div className="flex flex-col items-start gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide" style={{color: '#2D3F7B'}}>Resolved</p>
                        <p className="text-4xl font-bold leading-tight text-[#19295C]">71</p>
                        <p className="text-sm" style={{color: '#19295C', opacity: 0.7}}>Successfully completed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* HEATMAP SECTION */}
              <HeatmapSection />

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Issues by Category - UPDATED WITH DYNAMIC DATA */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Issues by Category</h3>
                    <button 
                      onClick={() => fetchCategoryData(selectedWard)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      disabled={isLoadingCategories}
                    >
                      {isLoadingCategories ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>

                  {/* Ward Filter Dropdown */}
                  <div className="mb-4">
                    <label htmlFor="ward-select" className="block text-sm font-medium text-slate-700 mb-2">
                      Filter by Ward:
                    </label>
                    <select
                      id="ward-select"
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                      className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      disabled={isLoadingCategories}
                    >
                      <option value="all">All Wards</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(ward => (
                        <option key={ward} value={ward}>Ward {ward}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-slate-500">
                      This filter applies to both category and priority charts
                    </p>
                  </div>

                  {/* Category Data Display */}
                  <div className="space-y-4">
                    {isLoadingCategories ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : categoryError ? (
                      <div className="text-center py-8">
                        <p className="text-red-600 text-sm">{categoryError}</p>
                        <button 
                          onClick={() => fetchCategoryData(selectedWard)}
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : categoryData.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-slate-500 text-sm">
                          No issues found {selectedWard !== 'all' ? `for Ward ${selectedWard}` : ''}
                        </p>
                      </div>
                    ) : (
                      categoryData.map((category, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">{category.name}</span>
                            <span className="text-sm text-slate-500">{category.count}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                            <div 
                              className={`${category.color} h-2 rounded-full transition-all duration-500`}
                              style={{width: `${Math.max((category.count / totalIssueCount) * 100, 2)}%`}}
                            ></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Summary */}
                  {!isLoadingCategories && !categoryError && categoryData.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">
                          {selectedWard === 'all' ? 'All Wards' : `Ward ${selectedWard}`}
                        </span>
                        <span className="font-medium text-slate-900">
                          Total: {categoryData.reduce((sum, cat) => sum + cat.count, 0)} issues
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Priority Distribution - UPDATED WITH DYNAMIC DATA */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Issues by Priority</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Filtered by: {selectedWard === 'all' ? 'All Wards' : `Ward ${selectedWard}`}
                      </p>
                    </div>
                    <button 
                      onClick={() => fetchPriorityData(selectedWard)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      disabled={isLoadingPriority}
                    >
                      {isLoadingPriority ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>

                  {/* Ward Filter Buttons for Priority */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-slate-700 mb-3">Quick Ward Filter:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedWard('all')}
                        className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                          selectedWard === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        disabled={isLoadingPriority}
                      >
                        All Wards
                      </button>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(ward => (
                        <button
                          key={ward}
                          onClick={() => setSelectedWard(ward)}
                          className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                            selectedWard === ward
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                          disabled={isLoadingPriority}
                        >
                          Ward {ward}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {isLoadingPriority ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : priorityError ? (
                    <div className="text-center py-8">
                      <p className="text-red-600 text-sm">{priorityError}</p>
                      <button 
                        onClick={() => fetchPriorityData(selectedWard)}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : !priorityData ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500 text-sm">No priority data available</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-center">
                        <div className="relative w-48 h-48">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8"/>
                            {/* Critical priority */}
                            <circle 
                              cx="50" cy="50" r="40" fill="none" stroke="#dc2626" strokeWidth="8" 
                              strokeDasharray={`${priorityData.critical.percentage * 2.51} 251.2`} 
                              strokeDashoffset="0" 
                              strokeLinecap="round"
                            />
                            {/* High priority */}
                            <circle 
                              cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="8" 
                              strokeDasharray={`${priorityData.high.percentage * 2.51} 251.2`} 
                              strokeDashoffset={`-${priorityData.critical.percentage * 2.51}`} 
                              strokeLinecap="round"
                            />
                            {/* Medium priority */}
                            <circle 
                              cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="8" 
                              strokeDasharray={`${priorityData.medium.percentage * 2.51} 251.2`} 
                              strokeDashoffset={`-${(priorityData.critical.percentage + priorityData.high.percentage) * 2.51}`} 
                              strokeLinecap="round"
                            />
                            {/* Low priority */}
                            <circle 
                              cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="8" 
                              strokeDasharray={`${priorityData.low.percentage * 2.51} 251.2`} 
                              strokeDashoffset={`-${(priorityData.critical.percentage + priorityData.high.percentage + priorityData.medium.percentage) * 2.51}`} 
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-slate-900">
                                {priorityData.critical.count + priorityData.high.count + priorityData.medium.count + priorityData.low.count}
                              </p>
                              <p className="text-xs text-slate-500">Total</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-sm text-slate-700">{priorityData.critical.label}</span>
                          </div>
                          <span className="text-sm font-medium text-slate-900">
                            {priorityData.critical.count} ({priorityData.critical.percentage}%)
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm text-slate-700">{priorityData.high.label}</span>
                          </div>
                          <span className="text-sm font-medium text-slate-900">
                            {priorityData.high.count} ({priorityData.high.percentage}%)
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-slate-700">{priorityData.medium.label}</span>
                          </div>
                          <span className="text-sm font-medium text-slate-900">
                            {priorityData.medium.count} ({priorityData.medium.percentage}%)
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-slate-700">{priorityData.low.label}</span>
                          </div>
                          <span className="text-sm font-medium text-slate-900">
                            {priorityData.low.count} ({priorityData.low.percentage}%)
                          </span>
                        </div>
                      </div>
                      
                      {/* Summary showing reference context */}
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">
                            {selectedWard === 'all' ? 'Municipality Total' : `Ward ${selectedWard} Total`}
                          </span>
                          <span className="font-medium text-slate-900">
                            {priorityData.critical.count + priorityData.high.count + priorityData.medium.count + priorityData.low.count} issues
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Percentages calculated relative to {selectedWard === 'all' ? 'all issues in municipality' : `issues in Ward ${selectedWard} only`}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Recent Issues */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Recent Issues</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View all</button>
                  </div>
                </div>
                <div className="divide-y divide-slate-200">
                  {recentIssues.map((issue) => (
                    <div key={issue.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-slate-900">{issue.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[issue.status]}`}>
                              {issue.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            <span className="font-medium text-slate-800">{issue.category}</span> - {issue.location}
                          </p>
                          <p className="text-xs text-slate-500">{issue.time}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-3xl font-black" style={{color: '#4e5569ff'}}>
                            {issue.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}