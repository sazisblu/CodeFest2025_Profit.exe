'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import IssuesList from '@/components/IssuesList';
import IssueDetail from '@/components/IssueDetail';
import { Issue } from '@/types/issue';

export default function CitizenIssues() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('citizen-issues');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showReports, setShowReports] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [issuesData, setIssuesData] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const priorityOptions = ['All Priorities', 'High', 'Medium', 'Low'];
  const statusOptions = ['All Statuses', 'Pending', 'In Review', 'Resolved'];
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  // Fetch issues from backend API
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('http://localhost:5000/api/issues');

        if (!response.ok) {
          throw new Error(`Failed to fetch issues: ${response.statusText}`);
        }

        const data = await response.json();
        setIssuesData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error fetching issues';
        setError(errorMessage);
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();

    // Refresh every 30 seconds
    const interval = setInterval(fetchIssues, 30000);
    return () => clearInterval(interval);
  }, []);

  const selectPriority = (val: string) => {
    setPriorityFilter(val);
    setPriorityOpen(false);
  };

  const selectStatus = (val: string) => {
    setStatusFilter(val);
    setStatusOpen(false);
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const filteredIssues = issuesData.filter(issue => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority =
      priorityFilter === 'All Priorities' ||
      (priorityFilter === 'High' && issue.priority >= 90) ||
      (priorityFilter === 'Medium' && issue.priority >= 70 && issue.priority < 90) ||
      (priorityFilter === 'Low' && issue.priority < 70);

    const matchesStatus = statusFilter === 'All Statuses' || issue.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleIssueClick = async (issue: Issue) => {
    try {
      const response = await fetch(`http://localhost:5000/api/issues/${issue.id}`);
      if (!response.ok) throw new Error('Failed to fetch issue details');
      const data = await response.json();
      setSelectedIssue(data);
    } catch (err) {
      console.error('Error fetching issue details:', err);
      setSelectedIssue(issue);
    }
  };

  const handleBackToList = () => {
    setSelectedIssue(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading issues...</p>
        </div>
      </div>
    );
  }

  // If an issue is selected, show the detailed view
  if (selectedIssue) {
    return (
      <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="ml-64 flex flex-col min-h-screen">
          <div className="sticky top-0 z-20">
            <Topbar activeTab={activeTab} onLogout={handleLogout} />
          </div>

          <IssueDetail
            issue={selectedIssue}
            showReports={showReports}
            onShowReportsToggle={() => setShowReports(!showReports)}
            onBack={handleBackToList}
          />
        </div>
      </div>
    );
  }

  // Default view - Issues table/list
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="ml-64 flex flex-col min-h-screen">
        <div className="sticky top-0 z-20">
          <Topbar activeTab={activeTab} onLogout={handleLogout} />
        </div>

        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Error message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <p className="font-semibold">Error loading issues</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Search and Filters */}
            <div className="bg-transparent p-4 rounded-2xl mb-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                {/* Search */}
                <div className="flex-1 relative w-full lg:w-auto">
                  <div className="flex items-center bg-gradient-to-r from-white to-blue-50/40 border border-slate-200 rounded-full px-3 py-2 shadow-sm">
                    <svg className="w-5 h-5 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search issues, location or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400"
                    />
                    {searchTerm && (
                      <button onClick={() => setSearchTerm('')} className="ml-2 text-slate-400 hover:text-slate-600">
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Priority dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setPriorityOpen(!priorityOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md focus:outline-none"
                  >
                    <span className="text-sm text-slate-700">{priorityFilter}</span>
                    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {priorityOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-md shadow-lg z-30">
                      {priorityOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => selectPriority(opt)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${
                            priorityFilter === opt ? 'font-semibold text-blue-700' : 'text-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setStatusOpen(!statusOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md focus:outline-none"
                  >
                    <span className="text-sm text-slate-700">{statusFilter}</span>
                    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {statusOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-30">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => selectStatus(opt)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${
                            statusFilter === opt ? 'font-semibold text-blue-700' : 'text-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="mb-4">
              <p className="text-slate-600">
                Showing {filteredIssues.length} of {issuesData.length} issues
              </p>
            </div>

            {/* Issues List Component */}
            <IssuesList
              filteredIssues={filteredIssues}
              issuesData={issuesData}
              searchTerm={searchTerm}
              onIssueClick={handleIssueClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
