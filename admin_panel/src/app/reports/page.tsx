'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import ReportCard from '@/components/ReportCard';
import TwoSidedArrow from '@/components/TwoSidedArrow';

interface CompletedProject {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryColor: string;
  categoryIcon: string;
  completedDate: string;
  startDate: string;
  actualBudget: string;
  plannedBudget: string;
  actualDuration: string;
  plannedDuration: string;
  department: string;
  teamMembers: string[];
  location: string;
  beneficiaries: number;
  satisfactionScore: number;
  objectives: string[];
  challenges: string[];
  outcomes: string[];
  recommendations: string[];
  photos: string[];
  financialBreakdown: {
    materials: string;
    labor: string;
    equipment: string;
    miscellaneous: string;
  };
  kpis: {
    onTime: boolean;
    onBudget: boolean;
    qualityScore: number;
    stakeholderSatisfaction: number;
  };
}

export default function Reports() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedProject, setSelectedProject] = useState<CompletedProject | null>(null);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<CompletedProject[]>([]);
  const [removedReportIds, setRemovedReportIds] = useState<string[]>([]);
  const [pendingDeleteReportId, setPendingDeleteReportId] = useState<string | null>(null);

  const handleLogout = () => {
    router.push('/login');
  };

  const completedProjects: CompletedProject[] = [
    {
      id: 'cp1',
      title: 'Main Street Pothole Repair Project',
      description: 'Comprehensive repair and resurfacing of Main Street addressing critical pothole issues that were causing vehicle damage and safety hazards for residents.',
      category: 'Infrastructure',
      categoryColor: 'bg-blue-100 text-blue-700',
      categoryIcon: '🛣️',
      completedDate: 'November 25, 2024',
      startDate: 'September 15, 2024',
      actualBudget: '₹ 18,50,000',
      plannedBudget: '₹ 20,00,000',
      actualDuration: '2.5 months',
      plannedDuration: '3 months',
      department: 'Public Works',
      teamMembers: ['Raj Kumar (Project Manager)', 'Sita Devi (Engineer)', 'Ram Bahadur (Supervisor)', 'Maya Gurung (Safety Officer)'],
      location: 'Main Street, Downtown Area',
      beneficiaries: 15000,
      satisfactionScore: 92,
      objectives: [
        'Repair all major potholes on Main Street (2.5 km stretch)',
        'Improve road surface quality and safety',
        'Reduce vehicle maintenance costs for residents',
        'Enhance traffic flow and reduce congestion'
      ],
      challenges: [
        'Weather delays during monsoon season',
        'Traffic management during peak hours',
        'Coordinating with local businesses',
        'Material delivery scheduling conflicts'
      ],
      outcomes: [
        'Successfully repaired 450+ potholes across 2.5 km stretch',
        'Reduced vehicle damage complaints by 95%',
        'Improved average traffic speed by 25%',
        'Enhanced road safety with zero accidents post-completion',
        'Positive community feedback with 92% satisfaction rate'
      ],
      recommendations: [
        'Implement quarterly road condition assessments',
        'Establish preventive maintenance schedule',
        'Create dedicated funds for emergency road repairs',
        'Develop better communication channels with residents during projects'
      ],
      photos: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=400&h=300&fit=crop'
      ],
      financialBreakdown: {
        materials: '₹ 12,00,000',
        labor: '₹ 4,50,000',
        equipment: '₹ 1,50,000',
        miscellaneous: '₹ 50,000'
      },
      kpis: {
        onTime: true,
        onBudget: true,
        qualityScore: 88,
        stakeholderSatisfaction: 92
      }
    },
    {
      id: 'cp2',
      title: 'Community Park Waste Management System',
      description: 'Installation of modern waste collection and recycling infrastructure in Central Park to address overflowing garbage issues and promote environmental sustainability.',
      category: 'Environment',
      categoryColor: 'bg-green-100 text-green-700',
      categoryIcon: '♻️',
      completedDate: 'October 15, 2024',
      startDate: 'August 1, 2024',
      actualBudget: '₹ 8,75,000',
      plannedBudget: '₹ 9,00,000',
      actualDuration: '2.5 months',
      plannedDuration: '2.5 months',
      department: 'Environmental Services',
      teamMembers: ['Kiran Thapa (Project Lead)', 'Deepa Sharma (Environmental Engineer)', 'Arjun Magar (Installation Team)'],
      location: 'Central Park, Recreation Area',
      beneficiaries: 8500,
      satisfactionScore: 89,
      objectives: [
        'Install 25 new waste collection bins throughout the park',
        'Establish 5 recycling stations with proper segregation',
        'Reduce littering and improve park cleanliness',
        'Educate community about proper waste disposal'
      ],
      challenges: [
        'Selecting optimal locations for maximum coverage',
        'Community education and behavior change',
        'Coordinating with park maintenance staff',
        'Weather-related installation delays'
      ],
      outcomes: [
        'Successfully installed 25 waste bins and 5 recycling stations',
        'Reduced park litter by 78%',
        'Increased recycling participation by 65%',
        'Improved overall park aesthetics and cleanliness',
        'Positive environmental impact with proper waste segregation'
      ],
      recommendations: [
        'Expand similar systems to other parks in the city',
        'Implement regular maintenance and cleaning schedules',
        'Continue community education programs',
        'Monitor usage patterns for optimization'
      ],
      photos: [
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1469022563428-aa04fef9f5a2?w=400&h=300&fit=crop'
      ],
      financialBreakdown: {
        materials: '₹ 6,00,000',
        labor: '₹ 2,00,000',
        equipment: '₹ 50,000',
        miscellaneous: '₹ 25,000'
      },
      kpis: {
        onTime: true,
        onBudget: true,
        qualityScore: 91,
        stakeholderSatisfaction: 89
      }
    },
    {
      id: 'cp3',
      title: 'School Zone Traffic Safety Enhancement',
      description: 'Implementation of comprehensive traffic safety measures around local schools including speed bumps, crosswalks, signage, and pedestrian barriers to ensure student safety.',
      category: 'Traffic Safety',
      categoryColor: 'bg-orange-100 text-orange-700',
      categoryIcon: '🚸',
      completedDate: 'September 30, 2024',
      startDate: 'July 15, 2024',
      actualBudget: '₹ 12,25,000',
      plannedBudget: '₹ 12,00,000',
      actualDuration: '2.5 months',
      plannedDuration: '2 months',
      department: 'Traffic Management',
      teamMembers: ['Bikash Rai (Traffic Engineer)', 'Sunita Tamang (Safety Coordinator)', 'Pramod Ghale (Installation Supervisor)'],
      location: 'School zones across 3 locations',
      beneficiaries: 2200,
      satisfactionScore: 95,
      objectives: [
        'Install speed reduction measures in all school zones',
        'Create clearly marked pedestrian crossings',
        'Implement proper safety signage and barriers',
        'Reduce traffic accidents near schools by 80%'
      ],
      challenges: [
        'Coordinating work around school schedules',
        'Managing traffic during construction',
        'Ensuring minimal disruption to students',
        'Weather delays affecting paint application'
      ],
      outcomes: [
        'Installed 12 speed bumps across 3 school zones',
        'Created 8 marked pedestrian crossings with proper signals',
        'Deployed 25 safety signs and warning boards',
        'Reduced traffic speed by average 40% in school zones',
        'Zero traffic accidents reported post-implementation'
      ],
      recommendations: [
        'Extend safety measures to additional school zones',
        'Regular maintenance of speed bumps and signage',
        'Community awareness programs on school zone safety',
        'Consider additional measures like traffic lights if needed'
      ],
      photos: [
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1461709444300-a6217cec3dff?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1581905764498-f1b60bae941a?w=400&h=300&fit=crop'
      ],
      financialBreakdown: {
        materials: '₹ 8,00,000',
        labor: '₹ 3,00,000',
        equipment: '₹ 1,00,000',
        miscellaneous: '₹ 25,000'
      },
      kpis: {
        onTime: false,
        onBudget: false,
        qualityScore: 94,
        stakeholderSatisfaction: 95
      }
    }
    ,
    {
      id: 'cp4',
      title: 'Neighborhood Lighting Upgrade',
      description: 'Upgrade of street lighting in several residential neighborhoods to LED fixtures to improve safety and reduce energy use.',
      category: 'Lighting',
      categoryColor: 'bg-yellow-100 text-yellow-700',
      categoryIcon: '💡',
      completedDate: 'December 5, 2024',
      startDate: 'October 1, 2024',
      actualBudget: '₹ 6,20,000',
      plannedBudget: '₹ 6,50,000',
      actualDuration: '1.5 months',
      plannedDuration: '2 months',
      department: 'Public Works',
      teamMembers: ['Nina Joshi (Lead)', 'Suresh Patel (Electrician)'],
      location: 'Northside, Sector 4',
      beneficiaries: 4200,
      satisfactionScore: 90,
      objectives: ['Replace old sodium lamps with LEDs', 'Improve night-time visibility', 'Reduce energy consumption'],
      challenges: ['Supply delays', 'Access to some poles'],
      outcomes: ['Reduced energy usage by 60%', 'Improved visibility and fewer safety complaints'],
      recommendations: ['Roll out to additional neighborhoods', 'Schedule yearly maintenance checks'],
      photos: [],
      financialBreakdown: { materials: '₹ 4,00,000', labor: '₹ 1,50,000', equipment: '₹ 50,000', miscellaneous: '₹ 20,000' },
      kpis: { onTime: true, onBudget: true, qualityScore: 87, stakeholderSatisfaction: 90 }
    },
    {
      id: 'cp5',
      title: 'Community Clinic Renovation',
      description: 'Renovation of the local community clinic to expand capacity and improve patient experience.',
      category: 'Health',
      categoryColor: 'bg-red-100 text-red-700',
      categoryIcon: '🏥',
      completedDate: 'November 10, 2024',
      startDate: 'August 20, 2024',
      actualBudget: '₹ 14,00,000',
      plannedBudget: '₹ 13,50,000',
      actualDuration: '2.8 months',
      plannedDuration: '3 months',
      department: 'Health Services',
      teamMembers: ['Dr. Anil Mehta (Coordinator)', 'Rita Karki (Nurse Supervisor)'],
      location: 'Eastside Clinic',
      beneficiaries: 3200,
      satisfactionScore: 94,
      objectives: ['Expand waiting area', 'Upgrade examination rooms', 'Improve hygiene facilities'],
      challenges: ['Coordination with clinic staff', 'Temporary relocation during works'],
      outcomes: ['Increased patient throughput', 'Higher patient satisfaction scores'],
      recommendations: ['Consider satellite clinics in other sectors'],
      photos: [],
      financialBreakdown: { materials: '₹ 8,00,000', labor: '₹ 4,00,000', equipment: '₹ 1,00,000', miscellaneous: '₹ 1,00,000' },
      kpis: { onTime: true, onBudget: false, qualityScore: 92, stakeholderSatisfaction: 94 }
    },
    {
      id: 'cp6',
      title: 'Riverbank Erosion Control',
      description: 'Stabilization work and planting along the riverbank to prevent erosion and protect nearby properties.',
      category: 'Environment',
      categoryColor: 'bg-green-100 text-green-700',
      categoryIcon: '🌿',
      completedDate: 'October 2, 2024',
      startDate: 'July 1, 2024',
      actualBudget: '₹ 10,50,000',
      plannedBudget: '₹ 11,00,000',
      actualDuration: '3 months',
      plannedDuration: '3 months',
      department: 'Environmental Services',
      teamMembers: ['Hari Singh (Ecologist)', 'Mina Rai (Field Lead)'],
      location: 'Riverbend District',
      beneficiaries: 6000,
      satisfactionScore: 88,
      objectives: ['Install gabion walls', 'Plant native vegetation', 'Monitor erosion rates'],
      challenges: ['Heavy rains during work window', 'Sourcing native plants'],
      outcomes: ['Reduced visible erosion by 80%', 'Improved habitat for local species'],
      recommendations: ['Ongoing monitoring and maintenance'],
      photos: [],
      financialBreakdown: { materials: '₹ 6,00,000', labor: '₹ 3,00,000', equipment: '₹ 1,00,000', miscellaneous: '₹ 50,000' },
      kpis: { onTime: false, onBudget: true, qualityScore: 85, stakeholderSatisfaction: 88 }
    }
  ];

  const allProjects = [...generatedReports, ...completedProjects].filter(p => !removedReportIds.includes(p.id));

  const filteredProjects = allProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || project.department.toLowerCase() === filterDepartment.toLowerCase();
    
    const matchesPeriod = (() => {
      if (filterPeriod === 'all') return true;
      const completedDate = new Date(project.completedDate);
      const now = new Date();
      
      switch (filterPeriod) {
        case '30days':
          return (now.getTime() - completedDate.getTime()) <= (30 * 24 * 60 * 60 * 1000);
        case '6months':
          return (now.getTime() - completedDate.getTime()) <= (6 * 30 * 24 * 60 * 60 * 1000);
        case '1year':
          return (now.getTime() - completedDate.getTime()) <= (365 * 24 * 60 * 60 * 1000);
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesDepartment && matchesPeriod;
  });

  const handleProjectClick = (project: CompletedProject) => {
    setSelectedProject(project);
  };

  const deleteReport = (id: string) => {
    setRemovedReportIds(prev => prev.includes(id) ? prev : [...prev, id]);
    try {
      const key = 'generatedReports';
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as CompletedProject[];
        const next = parsed.filter(p => p.id !== id);
        localStorage.setItem(key, JSON.stringify(next));
        setGeneratedReports(next);
      }
    } catch (e) {
      console.error('Failed to remove generated report', e);
    }
  };

  const handleBackToReports = () => {
    setSelectedProject(null);
  };

  React.useEffect(() => {
    try {
      const key = 'generatedReports';
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as CompletedProject[];
        setGeneratedReports(parsed);
      }
    } catch (e) {
      console.error('Failed to load generated reports', e);
    }
  }, []);

  const handleGeneratePDF = async () => {
    if (!selectedProject) return;
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const lineHeight = 14;
      let y = margin;

      const addPageIfNeeded = (needed = lineHeight) => {
        if (y + needed > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
      };

      const formatINR = (s: string) => {
        try {
          const digits = s.replace(/[^\d.-]/g, '');
          const n = Number(digits);
          if (isNaN(n)) return s;
          // format as Rs 1,23,45,678 (no currency symbol glyph)
          return 'Rs ' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
        } catch (e) {
          return s;
        }
      };

      // Title (centered, bold)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.text(selectedProject.title, pageWidth / 2, y, { align: 'center' });
      y += 26;
      pdf.setLineWidth(0.8);
      pdf.setDrawColor(200);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 12;

      // Description
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      const descLines = pdf.splitTextToSize(selectedProject.description, pageWidth - margin * 2);
      addPageIfNeeded(descLines.length * lineHeight);
      pdf.text(descLines, margin, y);
      y += descLines.length * lineHeight + 10;

      // Project Summary as a bordered two-column table
      pdf.setFontSize(13);
      addPageIfNeeded(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Project Summary', margin, y);
      y += 16;

      const tableX = margin;
      const tableW = pageWidth - margin * 2;
      const colLeft = tableX + 8;
      const colRightX = tableX + tableW - 8;
      const headerH = 18;
      const rowH = 16;

      // header
      pdf.setFillColor(245, 245, 245);
      pdf.rect(tableX, y, tableW, headerH, 'F');
      pdf.setDrawColor(200);
      pdf.rect(tableX, y, tableW, headerH, 'S');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Field', colLeft, y + 12);
      const headerRight = 'Value';
      pdf.text(headerRight, colRightX - pdf.getTextWidth(headerRight), y + 12);
      y += headerH;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const summaryRows: [string, string][] = [
        ['Department', selectedProject.department],
        ['Location', selectedProject.location],
        ['Start Date', selectedProject.startDate],
        ['Completed Date', selectedProject.completedDate],
        ['Actual Budget', formatINR(selectedProject.actualBudget)],
        ['Planned Budget', formatINR(selectedProject.plannedBudget)],
        ['Beneficiaries', selectedProject.beneficiaries.toLocaleString()],
        ['Satisfaction Score', `${selectedProject.satisfactionScore}%`]
      ];

      for (const [k, v] of summaryRows) {
        addPageIfNeeded(rowH + 6);
        // row separator
        pdf.setDrawColor(220);
        pdf.line(tableX, y, tableX + tableW, y);
        // content
        pdf.text(k, colLeft, y + 12 - 2);
        const val = String(v);
        const w = pdf.getTextWidth(val);
        pdf.text(val, colRightX - w, y + 12 - 2);
        y += rowH;
      }
      // bottom border
      pdf.setDrawColor(200);
      pdf.line(tableX, y, tableX + tableW, y);
      y += 8;

      const addSection = (title: string, items: string[]) => {
        // ensure a little extra space before section title
        y += 8;
        addPageIfNeeded(lineHeight * 3);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text(title, margin, y);
        y += 16;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        for (const item of items) {
          addPageIfNeeded(lineHeight * 2);
          const lines = pdf.splitTextToSize(item, pageWidth - margin * 2 - 20);
          // bullet on first line
          pdf.text('• ' + lines[0], margin + 6, y);
          if (lines.length > 1) {
            for (let i = 1; i < lines.length; i++) {
              y += lineHeight;
              addPageIfNeeded(0);
              pdf.text(lines[i], margin + 16, y);
            }
          }
          y += lineHeight + 4; // extra spacing between items
        }
        // clear separation after section
        y += 10;
      };

      addSection('Objectives', selectedProject.objectives);
      addSection('Achieved Outcomes', selectedProject.outcomes);
      addSection('Challenges', selectedProject.challenges);
      addSection('Recommendations', selectedProject.recommendations);

      // Financial Breakdown as a bordered table for clarity
      addPageIfNeeded(lineHeight * 4);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('Financial Breakdown', margin, y);
      y += 16;

      // table layout
      const tableX2 = margin;
      const tableW2 = pageWidth - margin * 2;
      const colLeft2 = tableX2 + 6;
      const colRightX2 = tableX2 + tableW2 - 6;
      const headerH2 = 18;
      const rowH2 = 16;

      // header box
      pdf.setFillColor(245, 245, 245);
      pdf.rect(tableX2, y, tableW2, headerH2, 'F');
      pdf.setDrawColor(200);
      pdf.rect(tableX2, y, tableW2, headerH2, 'S');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('Item', colLeft2, y + 12);
      pdf.text('Amount (Rs)', colRightX2 - pdf.getTextWidth('Amount (Rs)'), y + 12);
      y += headerH2;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const fb = selectedProject.financialBreakdown;
      const fbRows: [string, string][] = [
        ['Materials', formatINR(fb.materials)],
        ['Labor', formatINR(fb.labor)],
        ['Equipment', formatINR(fb.equipment)],
        ['Miscellaneous', formatINR(fb.miscellaneous)]
      ];

      for (const [k, v] of fbRows) {
        addPageIfNeeded(rowH2 + 6);
        // row border
        pdf.setDrawColor(220);
        pdf.line(tableX2, y, tableX2 + tableW2, y);
        // content
        pdf.text(k, colLeft2, y + 12 - 2);
        const w = pdf.getTextWidth(v);
        pdf.text(v, colRightX2 - w, y + 12 - 2);
        y += rowH2;
      }

      // bottom border
      pdf.setDrawColor(200);
      pdf.line(tableX2, y, tableX2 + tableW2, y);

      // Total row
      addPageIfNeeded(rowH2 + 8);
      pdf.setFont('helvetica', 'bold');
      const total = formatINR(selectedProject.actualBudget);
      pdf.text('Total Actual Cost', colLeft2, y + 12 - 2);
      const tw = pdf.getTextWidth(total);
      pdf.text(total, colRightX2 - tw, y + 12 - 2);
      y += rowH2 + 6;
      pdf.setFont('helvetica', 'normal');

      // Project Team
      // add some vertical spacing before the title
      y += 15;
      addPageIfNeeded(lineHeight * 2);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('Project Team', margin, y);
      y += 18;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      for (const m of selectedProject.teamMembers) {
        addPageIfNeeded(lineHeight);
        const lines = pdf.splitTextToSize(m, pageWidth - margin * 2);
        pdf.text(lines, margin, y);
        y += lines.length * lineHeight;
      }

      const filename = `${selectedProject.title.replace(/\s+/g, '_')}_report.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('PDF generation failed', err);
      alert('PDF generation failed.');
    }
  };

  const printRef = useRef<HTMLDivElement | null>(null);

  const handleExportData = () => {
    // Implement data export logic
    console.log('Exporting data for:', selectedProject?.title);
    alert('Data export would be implemented here');
  };

  // Project Detail Report View
  if (selectedProject) {
    return (
      <div className="min-h-screen bg-[#f6f9ff]">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="ml-64 flex flex-col min-h-screen">
          <div className="sticky top-0 z-20">
            <Topbar activeTab={activeTab} onLogout={handleLogout} />
          </div>
          
          <div className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              {/* Hidden printable minimal report used for PDF generation */}
              <div
                ref={printRef}
                aria-hidden
                style={{ position: 'absolute', left: -9999, top: 0, width: 800, background: '#ffffff', padding: 24, color: '#111827' }}
              >
                <div style={{ fontFamily: 'Inter, Arial, sans-serif', color: '#111827' }}>
                  <h1 style={{ fontSize: 24, marginBottom: 8 }}>{selectedProject.title}</h1>
                  <p style={{ marginBottom: 12 }}>{selectedProject.description}</p>

                  <h2 style={{ fontSize: 16, marginBottom: 8 }}>Project Summary</h2>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: 6, width: '33%' }}><strong>Department:</strong></td>
                        <td style={{ padding: 6 }}>{selectedProject.department}</td>
                        <td style={{ padding: 6 }}><strong>Location:</strong></td>
                        <td style={{ padding: 6 }}>{selectedProject.location}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: 6 }}><strong>Start Date:</strong></td>
                        <td style={{ padding: 6 }}>{selectedProject.startDate}</td>
                        <td style={{ padding: 6 }}><strong>Completed Date:</strong></td>
                        <td style={{ padding: 6 }}>{selectedProject.completedDate}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: 6 }}><strong>Actual Budget:</strong></td>
                        <td style={{ padding: 6 }}>{selectedProject.actualBudget}</td>
                        <td style={{ padding: 6 }}><strong>Planned Budget:</strong></td>
                        <td style={{ padding: 6 }}>{selectedProject.plannedBudget}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: 6 }}><strong>Beneficiaries:</strong></td>
                        <td style={{ padding: 6 }}>{selectedProject.beneficiaries.toLocaleString()}</td>
                        <td style={{ padding: 6 }}><strong>Satisfaction Score:</strong></td>
                        <td style={{ padding: 6 }}>{selectedProject.satisfactionScore}%</td>
                      </tr>
                    </tbody>
                  </table>

                  <h3 style={{ fontSize: 14, marginBottom: 6 }}>Objectives</h3>
                  <ul>
                    {selectedProject.objectives.map((o, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{o}</li>
                    ))}
                  </ul>

                  <h3 style={{ fontSize: 14, marginTop: 12, marginBottom: 6 }}>Achieved Outcomes</h3>
                  <ul>
                    {selectedProject.outcomes.map((o, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{o}</li>
                    ))}
                  </ul>

                  <h3 style={{ fontSize: 14, marginTop: 12, marginBottom: 6 }}>Challenges</h3>
                  <ul>
                    {selectedProject.challenges.map((c, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{c}</li>
                    ))}
                  </ul>

                  <h3 style={{ fontSize: 14, marginTop: 12, marginBottom: 6 }}>Recommendations</h3>
                  <ul>
                    {selectedProject.recommendations.map((r, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{r}</li>
                    ))}
                  </ul>

                  <h3 style={{ fontSize: 14, marginTop: 12, marginBottom: 6 }}>Financial Breakdown</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: 6 }}>Materials</td>
                        <td style={{ padding: 6 }}>{selectedProject.financialBreakdown.materials}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: 6 }}>Labor</td>
                        <td style={{ padding: 6 }}>{selectedProject.financialBreakdown.labor}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: 6 }}>Equipment</td>
                        <td style={{ padding: 6 }}>{selectedProject.financialBreakdown.equipment}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: 6 }}>Miscellaneous</td>
                        <td style={{ padding: 6 }}>{selectedProject.financialBreakdown.miscellaneous}</td>
                      </tr>
                    </tbody>
                  </table>

                  <h3 style={{ fontSize: 14, marginTop: 12, marginBottom: 6 }}>Project Team</h3>
                  <ul>
                    {selectedProject.teamMembers.map((m, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleBackToReports}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-[#19295c]">Project Report</h1>
                    <p className="text-[#6B7386]">Detailed completion report and analysis</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleExportData}
                    className="flex items-center gap-2 px-4 py-2 border border-[#cfe0ff] rounded-lg text-[#475569] hover:bg-[#eef6ff] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Data
                  </button>
                  <button 
                    onClick={handleGeneratePDF}
                    className="flex items-center gap-2 px-4 py-2 bg-[#19295c] text-white rounded-lg hover:bg-[#0f1a3b] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Generate PDF
                  </button>
                </div>
              </div>

              {/* Project Overview */}
              <div className="bg-transparent rounded-3xl shadow-sm border border-transparent p-8 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex-1 text-center">
                      <h2 className="text-3xl font-bold text-[#19295c] mb-3">{selectedProject.title}</h2>
                      <p className="text-[#475679] text-lg leading-relaxed">{selectedProject.description}</p>
                    </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600 mb-1">{selectedProject.satisfactionScore}%</div>
                    <div className="text-sm text-slate-500">Satisfaction Score</div>
                  </div>
                </div>
              </div>

              {/* Key Performance Indicators */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Key Performance Indicators</h3>
                <div className="mb-6 flex items-center justify-center">
                  <TwoSidedArrow
                    items={[
                      { label: 'Completion Date', value: selectedProject.completedDate, side: 'right' },
                      { label: 'Final Budget', value: selectedProject.actualBudget, side: 'left' },
                      { label: 'Duration', value: selectedProject.actualDuration, side: 'right' },
                      { label: 'Beneficiaries', value: selectedProject.beneficiaries.toLocaleString(), side: 'left' }
                    ]}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center bg-blue-100">
                      {selectedProject.kpis.onTime ? (
                        <svg className="w-8 h-8 text-[#19295c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-[#19295c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div className="font-semibold text-slate-900">On Time Delivery</div>
                    <div className={`text-sm text-blue-600`}>
                      {selectedProject.kpis.onTime ? 'Achieved' : 'Delayed'}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                      selectedProject.kpis.onBudget ? 'bg-blue-100' : 'bg-blue-100'
                    }`}>
                      {selectedProject.kpis.onBudget ? (
                        <svg className="w-8 h-8 text-[#19295c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-[#19295c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div className="font-semibold text-slate-900">Budget Adherence</div>
                    <div className={`text-sm text-blue-600`}>
                      {selectedProject.kpis.onBudget ? 'Under Budget' : 'Over Budget'}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                      <div className="text-xl font-bold text-[#19295c]">{selectedProject.kpis.qualityScore}</div>
                    </div>
                    <div className="font-semibold text-slate-900">Quality Score</div>
                    <div className="text-sm text-blue-600">Out of 100</div>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                      <div className="text-xl font-bold text-[#19295c]">{selectedProject.kpis.stakeholderSatisfaction}%</div>
                    </div>
                    <div className="font-semibold text-slate-900">Stakeholder Satisfaction</div>
                    <div className="text-sm text-blue-600">Survey Result</div>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Financial Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Materials</span>
                      <span className="font-semibold text-slate-900">{selectedProject.financialBreakdown.materials}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Labor</span>
                      <span className="font-semibold text-slate-900">{selectedProject.financialBreakdown.labor}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Equipment</span>
                      <span className="font-semibold text-slate-900">{selectedProject.financialBreakdown.equipment}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Miscellaneous</span>
                      <span className="font-semibold text-slate-900">{selectedProject.financialBreakdown.miscellaneous}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-900">Total Actual Cost</span>
                        <span className="font-bold text-lg text-slate-900">{selectedProject.actualBudget}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-slate-600">Planned Budget</span>
                        <span className="text-slate-600">{selectedProject.plannedBudget}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Project Team</h3>
                  <div className="space-y-3">
                    {selectedProject.teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {member.split(' ')[0].charAt(0)}
                          </span>
                        </div>
                        <span className="text-slate-700">{member}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{selectedProject.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Objectives */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Project Objectives</h3>
                  <ul className="space-y-3">
                    {selectedProject.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-slate-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Outcomes */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Achieved Outcomes</h3>
                  <ul className="space-y-3">
                    {selectedProject.outcomes.map((outcome, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-700">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Challenges */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Challenges Faced</h3>
                  <ul className="space-y-3">
                    {selectedProject.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span className="text-slate-700">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Future Recommendations</h3>
                  <ul className="space-y-3">
                    {selectedProject.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="text-slate-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Project Photos */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Project Photos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {selectedProject.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={photo} 
                        alt={`Project photo ${index + 1}`} 
                        className="w-full h-48 object-cover rounded-lg border border-slate-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-lg cursor-pointer" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Reports List View
  return (
    <div className="min-h-screen bg-[#f6f9ff]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="ml-64 flex flex-col min-h-screen">
        <div className="sticky top-0 z-20">
          <Topbar activeTab={activeTab} onLogout={handleLogout} />
        </div>
        
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Sticky search/filter region (matches Active Projects) */}
            <div className="sticky z-30 bg-slate-50 py-4 mb-6" style={{ top: 'var(--topbar-height)' }}>
              <div className="max-w-3xl mx-auto">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search completed projects..."
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
                  {/* Period dropdown */}
                  <div className="w-full sm:w-64 relative">
                    <button
                      type="button"
                      onClick={() => { setPeriodOpen(!periodOpen); setDeptOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2 border border-blue-100 rounded-lg bg-white shadow-sm hover:shadow-md focus:outline-none transition-colors duration-150 ${periodOpen ? 'ring-2 ring-[#19295C]/15' : ''}`}
                      aria-haspopup="true"
                      aria-expanded={periodOpen}
                    >
                      <span className={`${periodOpen ? 'text-[#19295C] font-semibold' : 'text-[#2D3F7B]'} text-sm`}>
                        {filterPeriod === 'all' ? 'All Time' : filterPeriod === '30days' ? 'Last 30 Days' : filterPeriod === '6months' ? 'Last 6 Months' : 'Last Year'}
                      </span>
                      <svg className={`w-4 h-4 transform transition-transform duration-200 ${periodOpen ? 'rotate-180 text-[#19295C]' : 'text-[#2D3F7B]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {periodOpen && (
                      <ul className="absolute z-50 mt-2 w-full bg-white border border-blue-100 rounded-lg shadow-lg max-h-56 overflow-auto py-1">
                        {[
                          { key: 'all', label: 'All Time' },
                          { key: '30days', label: 'Last 30 Days' },
                          { key: '6months', label: 'Last 6 Months' },
                          { key: '1year', label: 'Last Year' }
                        ].map(opt => (
                          <li
                            key={opt.key}
                            onClick={() => { setFilterPeriod(opt.key); setPeriodOpen(false); }}
                            role="option"
                            aria-selected={opt.key === filterPeriod}
                            className={`px-4 py-2 cursor-pointer text-sm transition-colors ${opt.key === filterPeriod ? 'bg-[#19295C] text-white font-semibold' : 'text-slate-900 hover:bg-[#e6f3ff] hover:text-[#19295C]'}`}
                          >
                            {opt.label}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Department dropdown */}
                  <div className="w-full sm:w-64 relative">
                    <button
                      type="button"
                      onClick={() => { setDeptOpen(!deptOpen); setPeriodOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2 border border-blue-100 rounded-lg bg-white shadow-sm hover:shadow-md focus:outline-none transition-colors duration-150 ${deptOpen ? 'ring-2 ring-[#19295C]/15' : ''}`}
                      aria-haspopup="true"
                      aria-expanded={deptOpen}
                    >
                      <span className={`${deptOpen ? 'text-[#19295C] font-semibold' : 'text-[#2D3F7B]'} text-sm`}>{filterDepartment === 'all' ? 'All Departments' : filterDepartment}</span>
                      <svg className={`w-4 h-4 transform transition-transform duration-200 ${deptOpen ? 'rotate-180 text-[#19295C]' : 'text-[#2D3F7B]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {deptOpen && (
                      <ul className="absolute z-50 mt-2 w-full bg-white border border-blue-100 rounded-lg shadow-lg max-h-56 overflow-auto py-1">
                        {[
                          { key: 'all', label: 'All Departments' },
                          { key: 'public works', label: 'Public Works' },
                          { key: 'environmental services', label: 'Environmental Services' },
                          { key: 'traffic management', label: 'Traffic Management' }
                        ].map(opt => (
                          <li
                            key={opt.key}
                            onClick={() => { setFilterDepartment(opt.key); setDeptOpen(false); }}
                            role="option"
                            aria-selected={opt.key === filterDepartment}
                            className={`px-4 py-2 cursor-pointer text-sm transition-colors ${opt.key === filterDepartment ? 'bg-[#19295C] text-white font-semibold' : 'text-slate-900 hover:bg-[#e6f3ff] hover:text-[#19295C]'}`}
                          >
                            {opt.label}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Reports Stats */}
            <div className="bg-transparent rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-0 bg-transparent shadow-none border-0">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100/40 to-blue-200/20 backdrop-blur-sm border-[3px] border-blue-300/60 flex items-center justify-center bubble-float">
                    <div className="text-xl font-bold text-[#19295C]">{completedProjects.length}</div>
                  </div>
                  <div>
                    <div className="text-lg text-[#19295C] font-semibold slide-from-bubble" style={{ animationDelay: '0.12s' }}>Completed Projects</div>
                  </div>
                </div>
              </div>

              <div className="p-0 bg-transparent shadow-none border-0">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100/40 to-blue-200/20 backdrop-blur-sm border-[3px] border-blue-300/60 flex items-center justify-center bubble-float">
                    <div className="text-xl font-bold text-[#19295C]">{Math.round(completedProjects.reduce((acc, p) => acc + parseFloat(p.actualBudget.replace(/[₹,]/g, '')), 0) / 100000)}L</div>
                  </div>
                  <div>
                    <div className="text-lg text-[#19295C] font-semibold slide-from-bubble" style={{ animationDelay: '0.18s' }}>Total Investment</div>
                  </div>
                </div>
              </div>

              <div className="p-0 bg-transparent shadow-none border-0">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100/40 to-blue-200/20 backdrop-blur-sm border-[3px] border-blue-300/60 flex items-center justify-center bubble-float">
                    <div className="text-xl font-bold text-[#19295C]">{Math.round(completedProjects.reduce((acc, p) => acc + p.satisfactionScore, 0) / completedProjects.length)}%</div>
                  </div>
                  <div>
                    <div className="text-lg text-[#19295C] font-semibold slide-from-bubble" style={{ animationDelay: '0.24s' }}>Avg Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>

              {/* Results count */}
              <div className="mb-6">
                <p className="text-slate-600">Showing {filteredProjects.length} of {completedProjects.length} completed projects</p>
              </div>

              {/* Reports List - use ReportCard component */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 auto-rows-fr items-stretch">
                {filteredProjects.map((project) => (
                  <ReportCard
                    key={project.id}
                    id={project.id}
                    title={project.title}
                    department={project.department}
                    completedDate={project.completedDate}
                    satisfactionScore={project.satisfactionScore}
                    category={project.category}
                    categoryColor={project.categoryColor}
                    categoryIcon={project.categoryIcon}
                    onClick={() => handleProjectClick(project)}
                    onRequestDelete={() => setPendingDeleteReportId(project.id)}
                  />
                ))}
              </div>
              {/* Delete confirmation modal for reports */}
              {pendingDeleteReportId && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                  <div className="bg-white rounded-xl w-full max-w-sm p-6">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900">Confirm Delete</h3>
                    <p className="text-sm text-slate-700">Do you want to delete this report? This action cannot be undone.</p>
                    <div className="mt-4 flex justify-end gap-3">
                      <button onClick={() => setPendingDeleteReportId(null)} className="px-4 py-2 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button onClick={() => { deleteReport(pendingDeleteReportId); setPendingDeleteReportId(null); }} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Delete</button>
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