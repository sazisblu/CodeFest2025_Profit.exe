'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaClipboardList, FaChartLine } from 'react-icons/fa';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import HeatmapSection from '@/components/HeatmapSection';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

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

  // State for dynamic dashboard stats
  const [totalIssues, setTotalIssues] = useState<number>(0);
  const [highPriorityIssues, setHighPriorityIssues] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

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

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    setIsLoadingStats(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/heatmap/all');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: HeatmapResponse = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch issues data');
      }

      // Count total issues
      const total = data.issues.length;
      setTotalIssues(total);

      // Count high priority issues (priority score > 15)
      const highPriority = data.issues.filter(issue => (issue.priority || 0) > 15).length;
      setHighPriorityIssues(highPriority);
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Keep default values of 0 on error
      setTotalIssues(0);
      setHighPriorityIssues(0);
    } finally {
      setIsLoadingStats(false);
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
    fetchDashboardStats();
  }, [fetchTags, fetchDashboardStats]);

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
                    <label htmlFor="ward-select" className="block text-sm font-medium text-[#000000] mb-2">
                      Filter by Ward:
                    </label>
                    <select
                      id="ward-select"
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                      className="block w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-blue-700 sm:text-sm"
                      disabled={isLoadingCategories}
                    >
                      <option value="all">All Wards</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(ward => (
                        <option key={ward} value={ward}>Ward {ward}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category Data Display */}
                  <div className="space-y-4">
                    {isLoadingCategories ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8  border-blue-600"></div>
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
                        <p className="text-blue-500 text-sm">
                          No issues found {selectedWard !== 'all' ? `for Ward ${selectedWard}` : ''}
                        </p>
                        <div className="flex justify-center mt-4">
                          <DotLottieReact
                            src="https://lottie.host/896dad7e-cc05-49b3-a8f6-47d6b6d66469/LRZjW1087j.lottie"
                            loop
                            autoplay
                            style={{ width: 250, height: 250 }}
                          />
                        </div>
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

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}