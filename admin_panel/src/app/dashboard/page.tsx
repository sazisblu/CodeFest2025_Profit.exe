'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaClipboardList, FaChartLine } from 'react-icons/fa';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentDesign, setCurrentDesign] = useState(0);

  const handleLogout = () => {
    router.push('/login');
  };

  const handleDraftProposal = () => {
    router.push('/citizen-proposals');
  };

  // Auto-rotate designs every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDesign((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Issues by Category */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">Issues by Category</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-800">View all</button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Road Damage</span>
                      <span className="text-sm text-slate-500">35</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '70%'}}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Waste Management</span>
                      <span className="text-sm text-slate-500">28</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '56%'}}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Water Supply</span>
                      <span className="text-sm text-slate-500">22</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{width: '44%'}}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Street Light</span>
                      <span className="text-sm text-slate-500">18</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{width: '36%'}}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Drainage</span>
                      <span className="text-sm text-slate-500">15</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '30%'}}></div>
                    </div>
                  </div>
                </div>

                {/* Priority Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">Issues by Priority</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-800">Details</button>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8"/>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#dc2626" strokeWidth="8" 
                                strokeDasharray="75.4" strokeDashoffset="0" strokeLinecap="round"/>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="8" 
                                strokeDasharray="50.3" strokeDashoffset="75.4" strokeLinecap="round"/>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="8" 
                                strokeDasharray="125.7" strokeDashoffset="125.7" strokeLinecap="round"/>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-slate-900">128</p>
                          <p className="text-xs text-slate-500">Total</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-slate-700">High Priority</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">15</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-slate-700">Medium Priority</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">42</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-slate-700">Low Priority</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">71</span>
                    </div>
                  </div>
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