'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import GovernmentProjectCard from '@/components/GovernmentProjectCard';
import ReportModal from './reportmodal';

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  date: string;
  completedDate?: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  categoryColor: string;
  categoryIcon: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
  statusColor: string;
  progress: number;
  budget: string;
  startDate: string;
  endDate: string;
  location: string;
  department: string;
  priority: 'High' | 'Medium' | 'Low';
  priorityColor: string;
  teamSize: number;
  milestones: Milestone[];
  recentUpdates: {
    update: string;
    date: string;
    author: string;
    avatar: string;
  }[];
}

export default function ActiveProjects() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('active-projects');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusOpen, setStatusOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const projectsData: Project[] = [
    {
      id: 1,
      title: 'Downtown Road Reconstruction',
      description: 'Complete reconstruction of Main Street including new asphalt, sidewalks, and drainage systems.',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=200&fit=crop',
      category: 'Infrastructure',
      categoryColor: 'bg-blue-100 text-blue-700',
      categoryIcon: '🏗️',
      status: 'In Progress',
      statusColor: 'bg-yellow-100 text-yellow-700',
      progress: 65,
      budget: 'Rs. 2.5 Crores',
      startDate: 'Jan 15, 2024',
      endDate: 'June 30, 2024',
      location: 'Main Street, Downtown',
      department: 'Public Works',
      priority: 'High',
      priorityColor: 'bg-red-100 text-red-700',
      teamSize: 12,
      milestones: [
        {
          id: '1',
          title: 'Site Preparation',
          description: 'Clear area and set up safety barriers',
          status: 'completed',
          date: 'Jan 20, 2024',
          completedDate: 'Jan 18, 2024'
        },
        {
          id: '2',
          title: 'Drainage Installation',
          description: 'Install new drainage pipes and manholes',
          status: 'completed',
          date: 'Feb 15, 2024',
          completedDate: 'Feb 12, 2024'
        },
        {
          id: '3',
          title: 'Road Foundation',
          description: 'Lay foundation and sub-base materials',
          status: 'current',
          date: 'Mar 10, 2024'
        },
        {
          id: '4',
          title: 'Asphalt Laying',
          description: 'Apply asphalt layers and road markings',
          status: 'upcoming',
          date: 'Apr 20, 2024'
        }
      ],
      recentUpdates: [
        {
          update: 'Foundation work is 80% complete. Weather conditions have been favorable.',
          date: '2 days ago',
          author: 'Rajesh Kumar',
          avatar: 'RK'
        },
        {
          update: 'Drainage system installation completed ahead of schedule.',
          date: '1 week ago',
          author: 'Priya Sharma',
          avatar: 'PS'
        }
      ]
    },
    {
      id: 2,
      title: 'Central Park Renovation',
      description: 'Complete renovation including new playground equipment, landscaping, and lighting systems.',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop',
      category: 'Parks & Recreation',
      categoryColor: 'bg-green-100 text-green-700',
      categoryIcon: '🌳',
      status: 'Planning',
      statusColor: 'bg-gray-100 text-gray-700',
      progress: 25,
      budget: 'Rs. 1.8 Crores',
      startDate: 'Mar 1, 2024',
      endDate: 'Aug 15, 2024',
      location: 'Central Park',
      department: 'Parks & Recreation',
      priority: 'Medium',
      priorityColor: 'bg-yellow-100 text-yellow-700',
      teamSize: 8,
      milestones: [
        {
          id: '1',
          title: 'Design Approval',
          description: 'Finalize park renovation designs',
          status: 'completed',
          date: 'Feb 20, 2024',
          completedDate: 'Feb 18, 2024'
        },
        {
          id: '2',
          title: 'Permit Acquisition',
          description: 'Obtain necessary construction permits',
          status: 'current',
          date: 'Mar 5, 2024'
        },
        {
          id: '3',
          title: 'Equipment Procurement',
          description: 'Purchase playground and lighting equipment',
          status: 'upcoming',
          date: 'Mar 20, 2024'
        }
      ],
      recentUpdates: [
        {
          update: 'Design plans approved by city council. Moving to permit phase.',
          date: '3 days ago',
          author: 'Amit Thapa',
          avatar: 'AT'
        }
      ]
    },
    {
      id: 3,
      title: 'Smart Traffic Light System',
      description: 'Installation of AI-powered traffic management system across 15 major intersections.',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop',
      category: 'Technology',
      categoryColor: 'bg-purple-100 text-purple-700',
      categoryIcon: '🚦',
      status: 'In Progress',
      statusColor: 'bg-yellow-100 text-yellow-700',
      progress: 45,
      budget: 'Rs. 3.2 Crores',
      startDate: 'Dec 1, 2023',
      endDate: 'May 30, 2024',
      location: 'City-wide',
      department: 'Traffic Management',
      priority: 'High',
      priorityColor: 'bg-red-100 text-red-700',
      teamSize: 15,
      milestones: [
        {
          id: '1',
          title: 'System Design',
          description: 'Complete traffic flow analysis and system design',
          status: 'completed',
          date: 'Dec 15, 2023',
          completedDate: 'Dec 12, 2023'
        },
        {
          id: '2',
          title: 'Phase 1 Installation',
          description: 'Install smart lights at 5 intersections',
          status: 'completed',
          date: 'Jan 31, 2024',
          completedDate: 'Jan 28, 2024'
        },
        {
          id: '3',
          title: 'Phase 2 Installation',
          description: 'Install at remaining 10 intersections',
          status: 'current',
          date: 'Mar 15, 2024'
        },
        {
          id: '4',
          title: 'System Testing',
          description: 'Complete system integration and testing',
          status: 'upcoming',
          date: 'Apr 30, 2024'
        }
      ],
      recentUpdates: [
        {
          update: '7 intersections now equipped with smart traffic lights. Testing phase ongoing.',
          date: '1 day ago',
          author: 'Suresh Magar',
          avatar: 'SM'
        },
        {
          update: 'Phase 1 completed successfully. Traffic flow improved by 30%.',
          date: '1 month ago',
          author: 'Maya Gurung',
          avatar: 'MG'
        }
      ]
    },
    {
      id: 4,
      title: 'Community Water Tank Construction',
      description: 'Construction of large capacity water storage tank to improve water supply reliability.',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop',
      category: 'Water Supply',
      categoryColor: 'bg-cyan-100 text-cyan-700',
      categoryIcon: '💧',
      status: 'Completed',
      statusColor: 'bg-green-100 text-green-700',
      progress: 100,
      budget: 'Rs. 1.5 Crores',
      startDate: 'Aug 1, 2023',
      endDate: 'Dec 15, 2023',
      location: 'Hillside Area',
      department: 'Water Department',
      priority: 'High',
      priorityColor: 'bg-red-100 text-red-700',
      teamSize: 10,
      milestones: [
        {
          id: '1',
          title: 'Foundation',
          description: 'Complete foundation and base structure',
          status: 'completed',
          date: 'Aug 30, 2023',
          completedDate: 'Aug 25, 2023'
        },
        {
          id: '2',
          title: 'Tank Construction',
          description: 'Build main water storage tank',
          status: 'completed',
          date: 'Oct 15, 2023',
          completedDate: 'Oct 10, 2023'
        },
        {
          id: '3',
          title: 'Pipeline Connection',
          description: 'Connect to existing water distribution network',
          status: 'completed',
          date: 'Nov 20, 2023',
          completedDate: 'Nov 15, 2023'
        },
        {
          id: '4',
          title: 'Testing & Commissioning',
          description: 'System testing and final commissioning',
          status: 'completed',
          date: 'Dec 15, 2023',
          completedDate: 'Dec 12, 2023'
        }
      ],
      recentUpdates: [
        {
          update: 'Project completed successfully. Water supply improved by 40% in the area.',
          date: '2 months ago',
          author: 'Krishna Bahadur',
          avatar: 'KB'
        }
      ]
    }
  ];

  // make projects editable in state so admin actions persist while app runs
  const [projectsState, setProjectsState] = useState<Project[]>(projectsData);

  // UI state for modals/forms
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Project>>({});
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState<Partial<Milestone>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [pendingDeleteProject, setPendingDeleteProject] = useState<Project | null>(null);

  const handleLogout = () => {
    router.push('/login');
  };


  const filteredProjects = projectsState.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All Statuses' || project.status === statusFilter;
    const matchesCategory = categoryFilter === 'All Categories' || project.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });



  const handleBackToList = () => {
    setSelectedProject(null);
  };

  // Ensure selectedProject references the item from projectsState (keeps updates in sync)
  const handleProjectClick = (project: Project) => {
    const p = projectsState.find(p => p.id === project.id) || project;
    setSelectedProject(p);
  };

  const openEditProject = (project: Project) => {
    setEditForm({ ...project });
    setShowEditModal(true);
  };

  const saveEditProject = () => {
    if (!editForm || !editForm.id) return;
    setProjectsState(prev => prev.map(p => p.id === editForm.id ? { ...(p as Project), ...(editForm as Project) } : p));
    if (selectedProject?.id === editForm.id) setSelectedProject(prev => prev ? { ...prev, ...(editForm as Project) } : prev);
    setShowEditModal(false);
  };

  const openProgressModal = (project: Project) => {
    setProgressValue(project.progress || 0);
    setShowProgressModal(true);
  };

  const saveProgress = () => {
    if (!selectedProject) return;
    setProjectsState(prev => prev.map(p => p.id === selectedProject.id ? { ...p, progress: progressValue } : p));
    setSelectedProject(prev => prev ? { ...prev, progress: progressValue } : prev);
    setShowProgressModal(false);
  };

  const openAddMilestone = () => {
    setMilestoneForm({ id: String(Date.now()), title: '', description: '', status: 'upcoming', date: '' });
    setShowMilestoneModal(true);
  };

  const openEditMilestone = (m: Milestone) => {
    setMilestoneForm({ ...m });
    setShowMilestoneModal(true);
  };

  const saveMilestone = () => {
    if (!selectedProject || !milestoneForm || !milestoneForm.id) return;

    const formatDateShort = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const sortMilestones = (list: Milestone[]) => {
      const order: Record<Milestone['status'], number> = { completed: 0, current: 1, upcoming: 2 };
      return list.slice().sort((a, b) => {
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        const da = Date.parse(a.completedDate || a.date || '') || 0;
        const db = Date.parse(b.completedDate || b.date || '') || 0;
        return da - db;
      });
    };

    const exists = selectedProject.milestones.some(m => m.id === milestoneForm.id);
    if (exists) {
      const updatedMilestone: Milestone = { ...(milestoneForm as Milestone) };
      if (updatedMilestone.status === 'completed' && !updatedMilestone.completedDate) {
        updatedMilestone.completedDate = formatDateShort(new Date());
      }

      setProjectsState(prev => prev.map(p => p.id === selectedProject.id ? { ...p, milestones: sortMilestones(p.milestones.map(m => m.id === updatedMilestone.id ? updatedMilestone : m)) } : p));
      setSelectedProject(prev => prev ? { ...prev, milestones: sortMilestones(prev.milestones.map(m => m.id === updatedMilestone.id ? updatedMilestone : m)) } : prev);
    } else {
      const newMilestone: Milestone = { ...(milestoneForm as Milestone) };
      if (newMilestone.status === 'completed' && !newMilestone.completedDate) {
        newMilestone.completedDate = formatDateShort(new Date());
      }

      setProjectsState(prev => prev.map(p => p.id === selectedProject.id ? { ...p, milestones: sortMilestones([...p.milestones, newMilestone]) } : p));
      setSelectedProject(prev => prev ? { ...prev, milestones: sortMilestones([...(prev.milestones || []), newMilestone]) } : prev);
    }

    setShowMilestoneModal(false);
    setMilestoneForm({});
  };

  const finishProject = (project: Project) => {
    // mark complete and open the generate-report modal
    setProjectsState(prev => prev.map(p => p.id === project.id ? { ...p, status: 'Completed', progress: 100 } : p));
    setSelectedProject(prev => prev ? { ...prev, status: 'Completed', progress: 100 } : prev);
    setShowReportModal(true);
  };

  const makeProposal = (project: Project) => {
    // Route to the existing citizen proposals page and include projectId
    router.push(`/citizen-proposals?projectId=${project.id}`);
  };

  // If a project is selected, show the detailed view
  if (selectedProject) {
    return (
      <div className="min-h-screen bg-white">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="ml-64 flex flex-col min-h-screen">
          <div className="sticky top-0 z-20">
            <Topbar activeTab={activeTab} onLogout={handleLogout} />
          </div>
          
          <div className="flex-1 p-8">
            <div className="max-w-6xl mx-auto">
              {/* Back Button */}
              <button 
                onClick={handleBackToList}
                className="mb-6 flex items-center gap-2 text-primary hover:text-secondary font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Projects List
              </button>

              {/* Project Header */}
              <div className="bg-white rounded-2xl shadow-sm border border-app-muted overflow-hidden mb-6">
                <div className="relative h-48">
                  <img 
                    src={selectedProject.image} 
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedProject.categoryColor}`}>
                        {selectedProject.categoryIcon} {selectedProject.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedProject.statusColor}`}>
                        {selectedProject.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedProject.priorityColor}`}>
                        {selectedProject.priority} Priority
                      </span>
                    </div>
                    {isAdmin ? (
                      <div className="space-y-2">
                        <input value={editForm?.title ?? selectedProject.title} onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))} className="w-full text-black text-2xl font-bold p-1 rounded" />
                        <textarea value={editForm?.description ?? selectedProject.description} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} className="w-full text-black p-2 rounded" />
                      </div>
                    ) : (
                      <>
                        <h1 className="text-2xl font-bold text-white mb-2">{selectedProject.title}</h1>
                        <p className="text-white/90">{selectedProject.description}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Progress Overview */}
                  <div className="bg-white rounded-2xl shadow-sm border border-app-muted p-6">
                    <h3 className="text-lg font-semibold text-dark mb-4">Progress Overview</h3>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-dark">Overall Progress</span>
                        <span className="text-sm font-bold text-dark">{selectedProject.progress}%</span>
                      </div>
                      <div className="w-full">
                        {isAdmin ? (
                          <div>
                            <input type="range" min={0} max={100} value={editForm?.progress ?? selectedProject.progress} onChange={e => setEditForm(prev => ({ ...prev, progress: Number(e.target.value) }))} className="w-full" />
                            <div className="text-sm text-dark mt-1">{editForm?.progress ?? selectedProject.progress}%</div>
                          </div>
                        ) : (
                          <div className="w-full bg-slate-200 rounded-full h-3">
                            <div 
                              className="h-3 rounded-full transition-all duration-500"
                              style={{width: `${selectedProject.progress}%`, background: 'linear-gradient(90deg, var(--secondary), var(--primary))'}}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="text-center p-4 bg-app-muted rounded-lg">
                        {isAdmin ? (
                          <input value={editForm?.budget ?? selectedProject.budget} onChange={e => setEditForm(prev => ({ ...prev, budget: e.target.value }))} className="text-center text-2xl font-bold text-primary text-black p-1 rounded w-full" />
                        ) : (
                          <div className="text-2xl font-bold text-primary">{selectedProject.budget}</div>
                        )}
                        <div className="text-sm text-dark">Budget</div>
                      </div>
                      <div className="text-center p-4 bg-app-muted rounded-lg">
                        {isAdmin ? (
                          <input value={String(editForm?.teamSize ?? selectedProject.teamSize)} onChange={e => setEditForm(prev => ({ ...prev, teamSize: Number(e.target.value) }))} className="text-center text-2xl font-bold text-primary text-black p-1 rounded w-full" />
                        ) : (
                          <div className="text-2xl font-bold text-primary">{selectedProject.teamSize}</div>
                        )}
                        <div className="text-sm text-dark">Team Members</div>
                      </div>
                      <div className="text-center p-4 bg-app-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{selectedProject.milestones.length}</div>
                        <div className="text-sm text-dark">Milestones</div>
                      </div>
                      <div className="text-center p-4 bg-app-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {selectedProject.milestones.filter(m => m.status === 'completed').length}
                        </div>
                        <div className="text-sm text-dark">Completed</div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white rounded-2xl shadow-sm border border-app-muted p-6">
                    <h3 className="text-lg font-semibold text-dark mb-6">Project Timeline</h3>
                    <div className="space-y-4">
                      {selectedProject.milestones.map((milestone, index) => (
                        <div key={milestone.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              milestone.status === 'completed' ? 'bg-green-500' :
                              milestone.status === 'current' ? 'bg-blue-500' : 'bg-slate-300'
                            }`}>
                              {milestone.status === 'completed' ? (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : milestone.status === 'current' ? (
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                              ) : (
                                <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                              )}
                            </div>
                            {index < selectedProject.milestones.length - 1 && (
                              <div className={`w-0.5 h-12 ${
                                milestone.status === 'completed' ? 'bg-green-500' : 'bg-slate-200'
                              }`}></div>
                            )}
                          </div>
                          <div className="flex-1 pb-8">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-slate-900">{milestone.title}</h4>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-500">
                                  {milestone.status === 'completed' ? milestone.completedDate : milestone.date}
                                </span>
                                {isAdmin && (
                                  <button onClick={() => openEditMilestone(milestone)} className="text-sm text-primary hover:underline">Edit</button>
                                )}
                              </div>
                            </div>
                            <p className="text-slate-600 text-sm">{milestone.description}</p>
                            {milestone.status === 'completed' && (
                              <span className="inline-flex items-center gap-1 text-green-600 text-sm mt-2">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Updates removed per request */}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Project Details */}
                  <div className="bg-white rounded-2xl shadow-sm border border-app-muted p-6">
                    <h3 className="text-lg font-semibold text-dark mb-4">Project Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {isAdmin ? (
                          <input value={editForm?.location ?? selectedProject.location} onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))} className="text-black text-sm p-1 rounded w-full" />
                        ) : (
                          <span className="text-dark">{selectedProject.location}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {isAdmin ? (
                          <input value={editForm?.department ?? selectedProject.department} onChange={e => setEditForm(prev => ({ ...prev, department: e.target.value }))} className="text-black text-sm p-1 rounded w-full" />
                        ) : (
                          <span className="text-dark">{selectedProject.department}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {isAdmin ? (
                          <input value={editForm?.startDate ?? selectedProject.startDate} onChange={e => setEditForm(prev => ({ ...prev, startDate: e.target.value }))} className="text-black text-sm p-1 rounded w-full" />
                        ) : (
                          <span className="text-dark">{selectedProject.startDate}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {isAdmin ? (
                          <input value={editForm?.endDate ?? selectedProject.endDate} onChange={e => setEditForm(prev => ({ ...prev, endDate: e.target.value }))} className="text-black text-sm p-1 rounded w-full" />
                        ) : (
                          <span className="text-dark">{selectedProject.endDate}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="bg-white rounded-2xl shadow-sm border border-app-muted p-6">
                    <h3 className="text-lg font-semibold text-dark mb-4">Actions</h3>
                    <div className="space-y-3">
                      {/* Admin Mode removed per design — admin UI remains disabled */}
                      <button onClick={() => openEditProject(selectedProject)} className="w-full px-4 py-2 btn-secondary rounded-lg font-medium hover:opacity-95 transition-colors">
                        Edit Project (Modal)
                      </button>
                      <button onClick={() => openProgressModal(selectedProject)} className="w-full px-4 py-2 btn-primary rounded-lg font-medium hover:opacity-95 transition-colors">
                        Update Progress
                      </button>
                      <button onClick={openAddMilestone} className="w-full px-4 py-2 btn-primary rounded-lg font-medium hover:opacity-95 transition-colors">
                        Add Milestone
                      </button>
                      <button onClick={() => finishProject(selectedProject)} className="w-full px-4 py-2 border border-app-muted text-dark rounded-lg font-medium hover:bg-app-muted transition-colors">
                        Finish Project & Generate Report
                      </button>
                      <button onClick={() => makeProposal(selectedProject)} className="w-full px-4 py-2 border border-app-muted text-dark rounded-lg font-medium hover:bg-app-muted transition-colors">
                        Make Proposal
                      </button>
                      {/* View Documents button removed per design */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modals */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
              <div className="bg-white rounded-xl w-full max-w-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-slate-900">Edit Project</h3>
                <div className="space-y-3">
                  <input value={editForm?.title || ''} onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Title" className="w-full border border-slate-200 bg-white text-black placeholder-slate-400 px-3 py-2 rounded" />
                  <textarea value={editForm?.description || ''} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Description" className="w-full border border-slate-200 bg-white text-black placeholder-slate-400 px-3 py-2 rounded resize-none" rows={4} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-[#19295c] mb-1 block">Budget</label>
                      <input value={editForm?.budget || ''} onChange={e => setEditForm(prev => ({ ...prev, budget: e.target.value }))} placeholder="Budget" className="w-full border border-slate-200 bg-white text-black placeholder-slate-400 px-3 py-2 rounded" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#19295c] mb-1 block">Team Members</label>
                      <input value={editForm?.teamSize?.toString() || ''} onChange={e => setEditForm(prev => ({ ...prev, teamSize: Number(e.target.value) }))} placeholder="Team Size" className="w-full border border-slate-200 bg-white text-black placeholder-slate-400 px-3 py-2 rounded" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">Cancel</button>
                  <button onClick={saveEditProject} className="px-4 py-2 bg-[#19295c] hover:bg-[#0f1a3b] text-white rounded">Save</button>
                </div>
              </div>
            </div>
          )}

          {showProgressModal && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
              <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-slate-900">Update Progress</h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={progressValue}
                    onChange={e => setProgressValue(Number(e.target.value))}
                    className="w-full accent-[#19295c]"
                    style={{ accentColor: '#19295c' }}
                  />
                  <div className="text-sm font-medium text-[#19295c]">{progressValue}%</div>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={() => setShowProgressModal(false)} className="px-4 py-2 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">Cancel</button>
                  <button onClick={saveProgress} className="px-4 py-2 bg-[#19295c] hover:bg-[#0f1a3b] text-white rounded">Save</button>
                </div>
              </div>
            </div>
          )}

          {showMilestoneModal && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
              <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-slate-900">{selectedProject && milestoneForm?.id && selectedProject.milestones.some(m => m.id === milestoneForm.id) ? 'Edit Milestone' : 'Add Milestone'}</h3>
                <div className="space-y-3">
                  <input value={milestoneForm?.title || ''} onChange={e => setMilestoneForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Title" className="w-full border border-slate-200 bg-white text-black placeholder-slate-400 px-3 py-2 rounded" />
                  <textarea value={milestoneForm?.description || ''} onChange={e => setMilestoneForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Description" className="w-full border border-slate-200 bg-white text-black placeholder-slate-400 px-3 py-2 rounded resize-none" rows={4} />
                  <input value={milestoneForm?.date || ''} onChange={e => setMilestoneForm(prev => ({ ...prev, date: e.target.value }))} placeholder="Date" className="w-full border border-slate-200 bg-white text-black placeholder-slate-400 px-3 py-2 rounded" />
                  <div>
                    <label className="text-sm font-medium text-[#19295c]">Status</label>
                    <select value={milestoneForm?.status || 'upcoming'} onChange={e => setMilestoneForm(prev => ({ ...prev, status: e.target.value as Milestone['status'] }))} className="w-full border border-slate-200 bg-white px-3 py-2 rounded mt-1 text-black">
                      <option value="upcoming">Upcoming</option>
                      <option value="current">Current</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  {milestoneForm?.status === 'completed' && (
                    <input value={milestoneForm?.completedDate || ''} onChange={e => setMilestoneForm(prev => ({ ...prev, completedDate: e.target.value }))} placeholder="Completed Date" className="w-full border border-slate-200 bg-white text-black placeholder-slate-400 px-3 py-2 rounded" />
                  )}
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={() => { setShowMilestoneModal(false); setMilestoneForm({}); }} className="px-4 py-2 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">Cancel</button>
                  <button onClick={saveMilestone} className="px-4 py-2 bg-[#19295c] hover:bg-[#0f1a3b] text-white rounded">{selectedProject && milestoneForm?.id && selectedProject.milestones.some(m => m.id === milestoneForm.id) ? 'Save' : 'Add'}</button>
                </div>
              </div>
            </div>
          )}
          {pendingDeleteProject && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
              <div className="bg-white rounded-xl w-full max-w-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-slate-900">Confirm Delete</h3>
                <p className="text-sm text-slate-700">Do you want to delete this project? This action cannot be undone.</p>
                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={() => setPendingDeleteProject(null)} className="px-4 py-2 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">Cancel</button>
                  <button onClick={() => {
                    if (!pendingDeleteProject) return;
                    setProjectsState(prev => prev.filter(p => p.id !== pendingDeleteProject.id));
                    if (selectedProject?.id === pendingDeleteProject.id) setSelectedProject(null);
                    setPendingDeleteProject(null);
                  }} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Delete</button>
                </div>
              </div>
            </div>
          )}
          {showReportModal && selectedProject && (
            <ReportModal
              project={selectedProject}
              onClose={() => setShowReportModal(false)}
              onSave={(report) => {
                // persist generated report to localStorage so Reports page can show it
                try {
                  const id = `gen_${Date.now()}`;
                  const completed = {
                    id,
                    title: report.title || selectedProject.title,
                    description: report.description || selectedProject.description,
                    category: selectedProject.category || 'Infrastructure',
                    categoryColor: selectedProject.categoryColor || 'bg-blue-100 text-blue-700',
                    categoryIcon: selectedProject.categoryIcon || '🏗️',
                    completedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                    startDate: selectedProject.startDate || '',
                    actualBudget: (report.financial && report.financial[0]) || selectedProject.budget || '',
                    plannedBudget: selectedProject.budget || '',
                    actualDuration: selectedProject.endDate || '',
                    plannedDuration: selectedProject.endDate || '',
                    department: selectedProject.department || '',
                    teamMembers: report.team && report.team.length ? report.team : (selectedProject.recentUpdates || []).map((u: any) => u.author + ' (member)'),
                    location: selectedProject.location || '',
                    beneficiaries: 0,
                    satisfactionScore: report.satisfaction || selectedProject.progress || 0,
                    objectives: report.objectives || [],
                    challenges: report.challenges || [],
                    outcomes: report.outcomes || [],
                    recommendations: report.recommendations || [],
                    photos: report.photos || [],
                    financialBreakdown: {
                      materials: report.financial && report.financial[0] ? report.financial[0] : '',
                      labor: report.financial && report.financial[1] ? report.financial[1] : '',
                      equipment: report.financial && report.financial[2] ? report.financial[2] : '',
                      miscellaneous: report.financial && report.financial[3] ? report.financial[3] : ''
                    },
                    kpis: {
                      onTime: true,
                      onBudget: true,
                      qualityScore: 0,
                      stakeholderSatisfaction: report.satisfaction || 0
                    }
                  };

                  const key = 'generatedReports';
                  const existing = localStorage.getItem(key);
                  const arr = existing ? JSON.parse(existing) : [];
                  arr.unshift(completed);
                  localStorage.setItem(key, JSON.stringify(arr));
                } catch (e) {
                  console.error('Failed to save generated report', e);
                }

                setShowReportModal(false);
                router.push(`/reports?projectId=${selectedProject.id}`);
              }}
            />
          )}
        </div>
      </div>
    );
  }

  // Default view - Projects table/list
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="ml-64 flex flex-col min-h-screen">
        <div className="sticky top-0 z-20">
          <Topbar activeTab={activeTab} onLogout={handleLogout} />
        </div>
        
        <div className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              {/* Sticky search bar: stays visible while only results scroll */}
                  <div className="sticky z-30 bg-slate-50 py-4 mb-6" style={{ top: 'var(--topbar-height)' }}>
                <div className="max-w-3xl mx-auto">
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 border border-slate-200 rounded-full text-black placeholder-slate-500 focus:outline-none relative z-10"
                      />

                      {/* decorative bluish gradient flow behind input */}
                      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-full overflow-hidden z-0">
                        <div className="absolute h-full w-[45%] opacity-30 gradient-flow"></div>
                      </div>

                      {/* small right action icon */}
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 z-20">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4m8-8h-4M4 12H8" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Styled dropdowns placed below the search */}
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    {/* Status dropdown */}
                    <div className="w-full sm:w-64 relative">
                      <button
                        type="button"
                        onClick={() => { setStatusOpen(!statusOpen); setCategoryOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 shadow-sm focus:outline-none transition-colors duration-150 ${statusOpen ? 'ring-2 ring-[#19295c]/20' : ''}`}
                        aria-haspopup="true"
                        aria-expanded={statusOpen}
                        aria-label="Filter by status"
                      >
                        <span className={`text-sm ${statusOpen ? 'text-[#19295c] font-semibold' : 'text-slate-700'}`}>
                          {statusFilter}
                        </span>
                        <svg
                          className={`w-4 h-4 transform transition-transform duration-200 ${statusOpen ? 'rotate-180 text-[#19295c]' : 'text-slate-400'}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {statusOpen && (
                        <ul className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-auto py-1">
                          {['All Statuses','Planning','In Progress','On Hold','Completed'].map(opt => (
                            <li
                              key={opt}
                              onClick={() => { setStatusFilter(opt); setStatusOpen(false); }}
                              role="option"
                              aria-selected={opt === statusFilter}
                              className={`px-4 py-2 cursor-pointer text-sm transition-colors ${opt === statusFilter ? 'bg-[#19295c] text-white font-semibold' : 'text-slate-700 hover:bg-[#e6f3ff] hover:text-[#19295c]'}`}
                            >
                              {opt}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Category dropdown */}
                    <div className="w-full sm:w-64 relative">
                      <button
                        type="button"
                        onClick={() => { setCategoryOpen(!categoryOpen); setStatusOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2 border rounded-lg bg-white shadow-sm hover:shadow-md focus:outline-none transition-colors duration-150 ${
                          categoryOpen ? 'open' : 'border-[#e6e9ef]'
                        }`}
                        aria-haspopup="true"
                        aria-expanded={categoryOpen}
                      >
                        <span
                          style={categoryOpen ? { color: '#19295c', fontWeight: 600 } : undefined}
                          className="text-sm text-[#2b2b2b]"
                        >
                          {categoryFilter}
                        </span>
                        <svg
                          className={`w-4 h-4 transform transition-transform duration-200 ${categoryOpen ? 'rotate-180' : ''}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          style={categoryOpen ? { color: '#19295c' } : { color: '#2b2b2b' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {categoryOpen && (
                        <ul className="absolute z-50 mt-2 w-full bg-white border border-[#e6e9ef] rounded-lg shadow-lg max-h-56 overflow-auto py-1">
                          {['All Categories','Infrastructure','Parks & Recreation','Technology','Water Supply'].map(opt => (
                            <li
                              key={opt}
                              onClick={() => { setCategoryFilter(opt); setCategoryOpen(false); }}
                              role="option"
                              aria-selected={opt === categoryFilter}
                              className={`dropdown-item px-4 py-2 cursor-pointer text-sm ${opt === categoryFilter ? 'selected' : ''}`}
                            >
                              {opt}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* gradient animation styles */}
                  <style jsx>{`
                    .gradient-flow {
                      left: -40%;
                      background: linear-gradient(90deg, rgba(25,41,92,0.12), rgba(25,41,92,0.18), rgba(25,41,92,0.12));
                      animation: flow 3.8s linear infinite;
                    }
                    .dropdown-item {
                      transition: background-color .12s ease, color .12s ease;
                      color: #2b2b2b; /* blackish grey when idle */
                    }
                    .dropdown-item:hover {
                      background-color: rgba(25,41,92,0.06);
                      color: #19295c;
                    }
                    .dropdown-item:active {
                      background-color: #19295c;
                      color: #fff;
                    }
                    .dropdown-item[aria-selected="true"], .dropdown-item.selected {
                      background-color: #19295c;
                      color: #fff;
                      font-weight: 600;
                    }
                    /* open state for the main button (border + subtle ring) */
                    .open {
                      border-color: #19295c !important;
                      box-shadow: 0 0 0 6px rgba(25,41,92,0.06);
                    }
                    @keyframes flow {
                      0% { transform: translateX(-100%); }
                      50% { transform: translateX(0%); }
                      100% { transform: translateX(200%); }
                    }
                  `}</style>
                </div>
              </div>

              {/* Scrollable results area: only this block scrolls while search stays sticky */}
              <div className="overflow-auto max-h-[60vh]">
                {/* Results count */}
                <div className="mb-6">
                  <p className="text-slate-600">Showing {filteredProjects.length} of {projectsState.length} projects</p>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                  {filteredProjects.map((project) => (
                    <GovernmentProjectCard
                      key={project.id}
                      title={project.title}
                      address={project.location}
                      details={{
                        description: project.description,
                        budget: project.budget,
                        startDate: project.startDate,
                        endDate: project.endDate,
                        contractor: project.department,
                        status: project.status,
                        fiscalYear: ''
                      }}
                      onCardClick={() => handleProjectClick(project)}
                      onRequestDelete={() => setPendingDeleteProject(project)}
                    />
                  ))}
                </div>
                {/* Delete confirmation modal for projects (grid view) */}
                {pendingDeleteProject && (
                  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl w-full max-w-sm p-6">
                      <h3 className="text-lg font-semibold mb-4 text-slate-900">Confirm Delete</h3>
                      <p className="text-sm text-slate-700">Do you want to delete this project? This action cannot be undone.</p>
                      <div className="mt-4 flex justify-end gap-3">
                        <button onClick={() => setPendingDeleteProject(null)} className="px-4 py-2 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">Cancel</button>
                        <button onClick={() => {
                          if (!pendingDeleteProject) return;
                          setProjectsState(prev => prev.filter(p => p.id !== pendingDeleteProject.id));
                          if (selectedProject?.id === pendingDeleteProject.id) setSelectedProject(null);
                          setPendingDeleteProject(null);
                        }} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Delete</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

