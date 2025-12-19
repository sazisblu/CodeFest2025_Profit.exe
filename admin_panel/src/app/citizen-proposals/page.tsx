'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

// Attachment type (stores preview dataUrl so drafts can persist)
type Attachment = {
  name: string;
  type?: string;
  size?: number;
  dataUrl?: string;
  file?: File;
};

export default function CitizenProposals() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('citizen-proposals');

  // form state
  const [projectTitle, setProjectTitle] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('4,50,000');
  const [estimatedDuration, setEstimatedDuration] = useState('2 weeks');
  const [department, setDepartment] = useState('Public Works');

  // department custom dropdown state & options
  const departments = ['Public Works', 'Transportation', 'Infrastructure', 'Urban Planning'];
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const selectDepartment = (d: string) => { setDepartment(d); setDepartmentOpen(false); };

  // attachments & UI state (store Attachment objects with dataUrl)
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB per file
  const MAX_TOTAL_SIZE = 8 * 1024 * 1024; // 8 MB total for all attachments
  const MAX_COUNT = 8;
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // draft & draft-modal state
  const [hasDraft, setHasDraft] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftData, setDraftData] = useState<any>(null);
  // list of saved drafts
  const [draftsList, setDraftsList] = useState<any[]>([]);
  // if editing an existing draft, hold its id
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);

  // (font) Poppins is loaded globally from RootLayout

  // toast helper
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const raw = localStorage.getItem('proposal_drafts');
    const list = raw ? JSON.parse(raw) : [];
    setDraftsList(list);
    setHasDraft(list.length > 0);
  }, []);

  const handleLogout = () => {
    router.push('/login');
  };

  const handleAttachClick = () => fileInputRef.current?.click();
  // read file as dataUrl helper
  const fileToDataUrl = (file: File) => new Promise<string>((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result));
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const arr = Array.from(files);

    // validate sizes and counts before reading
    const existingTotal = attachments.reduce((s, a) => s + (a.size || 0), 0);
    const existingCount = attachments.length;

    const acceptable: File[] = [];
    for (const f of arr) {
      if (f.size > MAX_FILE_SIZE) {
        setToast(`File ${f.name} is too large (max ${Math.round(MAX_FILE_SIZE/1024/1024)}MB)`);
        continue;
      }
      if (existingCount + acceptable.length >= MAX_COUNT) {
        setToast(`Maximum ${MAX_COUNT} attachments allowed`);
        break;
      }
      const projectedTotal = existingTotal + acceptable.reduce((s, x) => s + x.size, 0) + f.size;
      if (projectedTotal > MAX_TOTAL_SIZE) {
        setToast('Adding these files would exceed total attachments size limit');
        break;
      }
      acceptable.push(f);
    }

    if (acceptable.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const mapped: Attachment[] = await Promise.all(acceptable.map(async (f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
      dataUrl: await fileToDataUrl(f),
      file: f
    })));
    setAttachments(prev => [...prev, ...mapped]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;
    const arr = Array.from(files);

    const existingTotal = attachments.reduce((s, a) => s + (a.size || 0), 0);
    const existingCount = attachments.length;

    const acceptable: File[] = [];
    for (const f of arr) {
      if (f.size > MAX_FILE_SIZE) {
        setToast(`File ${f.name} is too large (max ${Math.round(MAX_FILE_SIZE/1024/1024)}MB)`);
        continue;
      }
      if (existingCount + acceptable.length >= MAX_COUNT) {
        setToast(`Maximum ${MAX_COUNT} attachments allowed`);
        break;
      }
      const projectedTotal = existingTotal + acceptable.reduce((s, x) => s + x.size, 0) + f.size;
      if (projectedTotal > MAX_TOTAL_SIZE) {
        setToast('Adding these files would exceed total attachments size limit');
        break;
      }
      acceptable.push(f);
    }

    if (acceptable.length === 0) return;

    const mapped: Attachment[] = await Promise.all(acceptable.map(async (f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
      dataUrl: await fileToDataUrl(f),
      file: f
    })));
    setAttachments(prev => [...prev, ...mapped]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const removeAttachment = (idx: number) => setAttachments(prev => prev.filter((_, i) => i !== idx));

  // save (create or update) draft into localStorage array 'proposal_drafts'
  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      const id = editingDraftId || `draft_${Date.now()}`;
      const draftObj = {
        id,
        projectTitle,
        problemStatement,
        proposedSolution,
        estimatedBudget,
        estimatedDuration,
        department,
        updatedAt: new Date().toISOString(),
        attachments: attachments.map(a => ({ name: a.name, type: a.type, size: a.size, dataUrl: a.dataUrl }))
      };

      const raw = localStorage.getItem('proposal_drafts');
      const list = raw ? JSON.parse(raw) : [];
      const existingIndex = list.findIndex((d: any) => d.id === id);
      if (existingIndex >= 0) {
        list[existingIndex] = draftObj;
      } else {
        list.unshift(draftObj);
      }
      localStorage.setItem('proposal_drafts', JSON.stringify(list));
      setDraftsList(list);
      setHasDraft(list.length > 0);
      setEditingDraftId(null);
      setToast(editingDraftId ? 'Draft updated' : 'Draft saved');
    } catch (err) {
      setToast('Unable to save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmitForReview = async () => {
    setSubmitting(true);
    // simulate upload/submit
    await new Promise((r) => setTimeout(r, 900));
    // pretend successful
    setSubmitting(false);
    setToast('Proposal submitted for review');
    // clear form
    setProjectTitle(''); setProblemStatement(''); setProposedSolution(''); setAttachments([]);
  };

  const handleBackClick = () => {
    router.push('/dashboard');
  };

  const aiSuggestion = "Based on 45 citizen reports, the primary issue is vehicle damage and traffic congestion caused by severe road degradation on Prithivi Highway";

  const problemStatementText = `The current state of Prithive Highway (between Mangaltar and Khurkot) presents a significant safety hazard to motorists and Passengers. Multiple deep potholes have been reported, causing vehicle damage and forcing traffic to slow dangerously.`;

  const proposedSolutionText = `We propose a complete resurfacing of the affected road. This includes:
1. Milling the existing surface
2. Repairing the base layer where necessary
3. Laying new asphalt
4. Restriping all lane markers and crosswalks`;

  const handleOpenDrafts = () => {
    const raw = localStorage.getItem('proposal_drafts');
    const list = raw ? JSON.parse(raw) : [];
    setDraftsList(list);
    setShowDraftModal(true);
  };

  // load a specific draft into the form (used for edit/load)
  const handleLoadDraft = (d: any) => {
    if (!d) { setToast('No draft to load'); return; }
    setProjectTitle(d.projectTitle || '');
    setProblemStatement(d.problemStatement || '');
    setProposedSolution(d.proposedSolution || '');
    setEstimatedBudget(d.estimatedBudget || '');
    setEstimatedDuration(d.estimatedDuration || '');
    setDepartment(d.department || 'Public Works');
    // restore attachments as Attachment objects (dataUrl present)
    setAttachments((d.attachments || []).map((a: any) => ({
      name: a.name, type: a.type, size: a.size, dataUrl: a.dataUrl
    })));
    setToast('Draft loaded');
    setShowDraftModal(false);
    setEditingDraftId(d.id || null);
  };

  const handleDeleteDraft = (id: string) => {
    const raw = localStorage.getItem('proposal_drafts');
    const list = raw ? JSON.parse(raw) : [];
    const next = list.filter((x: any) => x.id !== id);
    localStorage.setItem('proposal_drafts', JSON.stringify(next));
    setDraftsList(next);
    setHasDraft(next.length > 0);
    setToast('Draft deleted');
  };

  const handleClearAllDrafts = () => {
    localStorage.removeItem('proposal_drafts');
    setDraftsList([]);
    setHasDraft(false);
    setShowDraftModal(false);
    setToast('All drafts cleared');
  };

  // image/open helpers
  const openAttachmentInNewTab = async (a: Attachment) => {
    try {
      if (!a) return;
      // if we have original File object use object URL
      if (a.file) {
        const obj = URL.createObjectURL(a.file);
        const win = window.open(obj, '_blank');
        setTimeout(() => URL.revokeObjectURL(obj), 10000);
        if (!win) window.location.href = obj;
        return;
      }
      // otherwise convert dataUrl to blob then open
      if (a.dataUrl) {
        const res = await fetch(a.dataUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        if (!win) window.location.href = url;
        return;
      }
    } catch (err) {
      console.error(err);
      setToast?.('Unable to open attachment');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="ml-64 flex flex-col min-h-screen">
        <div className="sticky top-0 z-20">
          <Topbar activeTab={activeTab} onLogout={handleLogout} />
        </div>
        
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleBackClick}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-[#19295C]">New Budget Proposal</h1>
                    <p className="text-slate-500">Drafting proposal for FY 2025-Q3 Cycle</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveDraft}
                    disabled={savingDraft}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-[#2D3F7B] bg-white hover:shadow-sm transition"
                    title="Save draft locally"
                  >
                    {savingDraft ? 'Saving...' : 'Save Draft'}
                  </button>

                  <button
                    onClick={handleOpenDrafts}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[#2D3F7B] hover:shadow-sm"
                    title="View saved drafts"
                  >
                    View Drafts
                  </button>

                  <button
                    onClick={handleSubmitForReview}
                    disabled={submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2D3F7B] text-white rounded-lg hover:bg-[#19295C] transition"
                  >
                    {submitting ? 'Submitting...' : 'Submit for Review'}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Project Title */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Project Title</label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Enter a clear, descriptive title"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2D3F7B] focus:border-[#19295C]"
                  />
                </div>

                {/* Problem Statement */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Problem Statement</label>
                  
                  {/* AI Suggestion */}
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-[#2D3F7B] to-[#19295C] rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#2D3F7B] mb-1">AI Suggestion:</p>
                        <p className="text-sm text-[#19295C]">{aiSuggestion}</p>
                      </div>
                    </div>
                  </div>

                  <textarea
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    placeholder={problemStatementText}
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2D3F7B] focus:border-[#19295C] resize-none"
                  />
                </div>

                {/* Proposed Solution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Proposed Solution</label>
                  <textarea
                    value={proposedSolution}
                    onChange={(e) => setProposedSolution(e.target.value)}
                    placeholder={proposedSolutionText}
                    rows={8}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2D3F7B] focus:border-[#19295C] resize-none"
                  />
                </div>

                {/* Attachments */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Attachments</label>
                  <div
                    className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-200 transition-colors cursor-pointer"
                    onClick={handleAttachClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    role="button"
                    aria-label="Add attachments"
                  >
                    <svg className="w-10 h-10 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-slate-600 font-medium">Click to upload files</p>
                    <p className="text-sm text-slate-500">or drag and drop</p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFilesChange}
                      className="hidden"
                    />
                  </div>

                  {attachments.length > 0 && (
                    <div className="mt-4 grid gap-2">
                      {attachments.map((a, i) => (
                        <div key={i} className="flex items-center justify-between bg-white border border-slate-100 rounded-md p-2">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 bg-slate-100 rounded-md flex items-center justify-center text-slate-600 text-sm overflow-hidden">
                              {a.type?.startsWith('image') && a.dataUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={a.dataUrl} alt={a.name} className="w-full h-full object-cover cursor-pointer" onClick={(e)=>{ e.stopPropagation(); openAttachmentInNewTab(a); }} />
                              ) : (
                                '📎'
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-[#19295C] truncate">{a.name}</div>
                              <div className="text-xs text-slate-500">{a.size ? `${Math.round(a.size / 1024)} KB` : ''}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); openAttachmentInNewTab(a); }}
                              className="text-sm text-[#2D3F7B] hover:underline"
                            >
                              Open
                            </button>
                            <button onClick={() => removeAttachment(i)} className="text-sm text-slate-500 hover:text-red-500">
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Budget & Timeline + Impact Analysis */}
              <div className="space-y-6">
                {/* Budget & Timeline */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Budget & Timeline</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Budget</label>
                      <div className="flex items-center gap-3">
                        <span className="text-lg text-slate-700">रु</span>
                        <input
                          value={estimatedBudget}
                          onChange={(e) => setEstimatedBudget(e.target.value)}
                          placeholder="0"
                          className="text-2xl font-bold text-[#19295C] w-40 px-2 py-1 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D3F7B]"
                        />
                      </div>
                    </div>
 
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Duration</label>
                      <input
                        value={estimatedDuration}
                        onChange={(e) => setEstimatedDuration(e.target.value)}
                        placeholder="e.g. 2 weeks"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2D3F7B] focus:border-[#19295C]"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                      <button
                        type="button"
                        onClick={() => setDepartmentOpen(!departmentOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#2D3F7B]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                          </svg>
                          <span className="truncate">{department}</span>
                        </div>
                        <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {departmentOpen && (
                        <div className="absolute mt-2 w-full bg-white border border-slate-200 rounded-md shadow-lg z-30">
                          {departments.map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => selectDepartment(d)}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${department === d ? 'font-semibold text-[#2D3F7B]' : 'text-slate-700'}`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Impact Analysis */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Impact Analysis</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Beneficiaries</span>
                      <span className="font-semibold text-slate-900">~12,000 Residents</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Priority Score</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        High (92)
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-600">Alignment with City Goals</span>
                        <span className="text-sm font-medium text-slate-900">85%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-[#2D3F7B] h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* toast */}
          {toast && (
            <div className="fixed right-6 bottom-6 z-50 bg-[#19295C] text-white px-4 py-2 rounded-lg shadow-lg">
              {toast}
            </div>
          )}

          {/* Drafts Modal (shows all saved drafts with edit/load/delete) */}
          {showDraftModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-[#2D3F7B]/20">
              <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Saved Drafts</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={handleClearAllDrafts} className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-md">Clear All</button>
                    <button onClick={() => setShowDraftModal(false)} className="px-3 py-1 text-sm bg-slate-700 rounded-md">Close</button>
                  </div>
                </div>

                {draftsList.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm py-8">No drafts saved yet.</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-auto">
                    {draftsList.map((d) => (
                      <div key={d.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-md font-semibold text-[#19295C] truncate">{d.projectTitle || 'Untitled draft'}</h4>
                            <span className="text-xs text-slate-500">• {new Date(d.updatedAt).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-slate-600 max-w-2xl truncate">{d.problemStatement}</p>
                          <div className="mt-2 text-xs text-slate-500 flex gap-4">
                            <div>Budget: {d.estimatedBudget}</div>
                            <div>Duration: {d.estimatedDuration}</div>
                            <div>Dept: {d.department}</div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-end gap-2">
                          <button onClick={() => handleLoadDraft(d)} className="px-3 py-1 bg-[#2D3F7B] text-white rounded-md hover:bg-[#19295C]">Load</button>
                          <button onClick={() => handleDeleteDraft(d.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}