'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const router = useRouter();

  const handleNavigation = (tabId: string) => {
    setActiveTab(tabId);
    
    // Navigate to specific pages
    switch (tabId) {
      case 'dashboard':
        router.push('/dashboard');
        break;
      case 'citizen-issues':
        router.push('/citizen-issues');
        break;
      case 'citizen-proposals':
        router.push('/citizen-proposals');
        break;
      case 'active-projects':
        router.push('/active-projects');
        break;
      case 'reports':
        router.push('/reports');
        break;
      
      case 'settings':
        // router.push('/settings'); // When you create this page
        break;
      default:
        break;
    }
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      )
    },
    { 
      id: 'citizen-issues', 
      label: 'Citizen Issues', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    },
    { 
      id: 'citizen-proposals', 
      label: 'Proposals', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 11.5V5zm3 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    { 
      id: 'active-projects', 
      label: 'Active Projects', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
      )
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    
  ];

  const settingsItem = { 
    id: 'settings', 
    label: 'Settings', 
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    )
  };

  return (
    <div className="bg-gradient-to-b from-blue-100/80 via-blue-50/50 to-blue-25/30 backdrop-blur-md w-64 h-screen fixed left-0 top-0 flex flex-col z-10 border-r border-blue-200/40">
      {/* Additional flowing overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-blue-100/20 pointer-events-none"></div>
      
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex-shrink-0 overflow-hidden">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={48} 
              height={48}
              className="w-full h-full object-contain scale-250"
            />
          </div>
          <h1 className="text-2xl font-bold text-blue-900">Hamro Chautari</h1>
        </div>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleNavigation(item.id)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                  activeTab === item.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                    : 'hover:bg-slate-200 text-slate-600 hover:text-slate-800'
                }`}
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-200">
        <button
          onClick={() => handleNavigation('settings')}
          className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
            activeTab === 'settings'
              ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
              : 'hover:bg-slate-200 text-slate-600 hover:text-slate-800'
          }`}
        >
          <span>{settingsItem.icon}</span>
          <span className="font-medium">{settingsItem.label}</span>
        </button>
      </div>
    </div>
  );
}