"use client";
import { useState, useEffect, useRef } from "react";

interface Props {
  project?: any;
  onClose: () => void;
  onSave: (report: any) => void;
}

export default function ReportModal({ project, onClose, onSave }: Props) {
  const [title, setTitle] = useState(project?.title || "");
  const [description, setDescription] = useState(project?.description || "");
  const [satisfaction, setSatisfaction] = useState<number>(92);
  const [kpisText, setKpisText] = useState("");
  const [financialText, setFinancialText] = useState("");
  const [teamText, setTeamText] = useState("");
  const [objectivesText, setObjectivesText] = useState("");
  const [outcomesText, setOutcomesText] = useState("");
  const [challengesText, setChallengesText] = useState("");
  const [recommendationsText, setRecommendationsText] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB per file
  const MAX_TOTAL_SIZE = 8 * 1024 * 1024; // 8 MB total
  const MAX_COUNT = 8; // max number of attachments

  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setDescription(project.description || "");
    }
  }, [project]);

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const oversized = arr.filter(f => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      setAttachError(`Some files exceed ${Math.round(MAX_FILE_SIZE/1024/1024*10)/10} MB and were not added.`);
      setTimeout(() => setAttachError(null), 4000);
    }

    const accepted = arr.filter(f => f.size <= MAX_FILE_SIZE);

    const existingCount = photos.length;
    const countAllowed = Math.max(0, MAX_COUNT - existingCount);
    const acceptedCount = accepted.slice(0, countAllowed);

    const existingTotal = photos.reduce((s, f) => s + (f.size || 0), 0);
    const acceptedTotalSize = acceptedCount.reduce((s, f) => s + (f.size || 0), 0);
    if (existingTotal + acceptedTotalSize > MAX_TOTAL_SIZE) {
      setAttachError('Adding these files would exceed total attachments size limit.');
      setTimeout(() => setAttachError(null), 4000);
      return;
    }

    if (acceptedCount.length === 0) return;
    setPhotos(prev => [...prev, ...acceptedCount]);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    addFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer?.files) return;
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removePhoto = (idx: number) => setPhotos(prev => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    const toDataURL = (file: File) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });

    const buildReport = async () => {
      const photosData = await Promise.all(photos.map(p => toDataURL(p)));

      const report = {
        projectId: project?.id,
        title,
        description,
        satisfaction,
        kpis: kpisText.split("\n").map(s => s.trim()).filter(Boolean),
        financial: financialText.split("\n").map(s => s.trim()).filter(Boolean),
        team: teamText.split("\n").map(s => s.trim()).filter(Boolean),
        objectives: objectivesText.split("\n").map(s => s.trim()).filter(Boolean),
        outcomes: outcomesText.split("\n").map(s => s.trim()).filter(Boolean),
        challenges: challengesText.split("\n").map(s => s.trim()).filter(Boolean),
        recommendations: recommendationsText.split("\n").map(s => s.trim()).filter(Boolean),
        photos: photosData
      };

      onSave(report);
    };

    buildReport().catch(err => {
      console.error('Failed to build report photos', err);
      // still attempt to save without photos
      onSave({
        projectId: project?.id,
        title,
        description,
        satisfaction,
        kpis: kpisText.split("\n").map(s => s.trim()).filter(Boolean),
        financial: financialText.split("\n").map(s => s.trim()).filter(Boolean),
        team: teamText.split("\n").map(s => s.trim()).filter(Boolean),
        objectives: objectivesText.split("\n").map(s => s.trim()).filter(Boolean),
        outcomes: outcomesText.split("\n").map(s => s.trim()).filter(Boolean),
        challenges: challengesText.split("\n").map(s => s.trim()).filter(Boolean),
        recommendations: recommendationsText.split("\n").map(s => s.trim()).filter(Boolean),
        photos: []
      });
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-auto max-h-[85vh] p-6 text-slate-900">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold text-[#19295c]">Generate Project Report</h2>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-2 border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-50">Close</button>
            <button onClick={handleSave} className="px-4 py-2 bg-[#19295c] text-white rounded hover:opacity-95">Save & Generate</button>
          </div>
        </div>

        <div className="mt-4 space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-800">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-2 p-3 border border-slate-200 rounded text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#19295c]/20" placeholder="Enter report title" />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-800">Summary / Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full mt-2 p-3 border border-slate-200 rounded text-slate-900 placeholder-slate-400 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#19295c]/20" placeholder="Write a concise summary of the project and outcomes" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-800">Satisfaction Score</label>
              <input type="number" value={satisfaction} onChange={e => setSatisfaction(Number(e.target.value))} min={0} max={100} className="w-full mt-2 p-2 border border-slate-200 rounded text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#19295c]/20" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-800">Key Performance Indicators (one per line)</label>
              <textarea value={kpisText} onChange={e => setKpisText(e.target.value)} rows={3} className="w-full mt-2 p-3 border border-slate-200 rounded text-slate-900 placeholder-slate-400 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#19295c]/20" placeholder="On Time Delivery - Achieved\nBudget Adherence - Under Budget" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-800">Financial Breakdown (one per line)</label>
              <textarea value={financialText} onChange={e => setFinancialText(e.target.value)} rows={6} className="w-full mt-2 p-3 border border-slate-200 rounded text-slate-900 placeholder-slate-400 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#19295c]/20" placeholder="Materials: ₹12,00,000\nLabor: ₹4,50,000" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-800">Project Team (one per line)</label>
              <textarea value={teamText} onChange={e => setTeamText(e.target.value)} rows={6} className="w-full mt-2 p-3 border border-slate-200 rounded text-slate-900 placeholder-slate-400 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#19295c]/20" placeholder="Raj Kumar (Project Manager)" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-800">Project Objectives (one per line)</label>
              <textarea value={objectivesText} onChange={e => setObjectivesText(e.target.value)} rows={6} className="w-full mt-2 p-3 border border-slate-200 rounded text-slate-900 placeholder-slate-400 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#19295c]/20" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-800">Achieved Outcomes (one per line)</label>
              <textarea value={outcomesText} onChange={e => setOutcomesText(e.target.value)} rows={6} className="w-full mt-2 p-3 border border-slate-200 rounded text-slate-900 placeholder-slate-400 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#19295c]/20" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-800">Challenges Faced (one per line)</label>
              <textarea value={challengesText} onChange={e => setChallengesText(e.target.value)} rows={6} className="w-full mt-2 p-3 border border-slate-200 rounded text-slate-900 placeholder-slate-400 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#19295c]/20" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-800">Future Recommendations (one per line)</label>
              <textarea value={recommendationsText} onChange={e => setRecommendationsText(e.target.value)} rows={6} className="w-full mt-2 p-3 border border-slate-200 rounded text-slate-900 placeholder-slate-400 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#19295c]/20" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-800">Attachments</label>
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handlePhotoChange} className="hidden" />

            <div
              onClick={handleBoxClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              role="button"
              tabIndex={0}
              className="mt-3 w-full border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center text-center text-slate-600 cursor-pointer hover:border-slate-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v12m0 0l4-4m-4 4L8 11" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              </svg>
              <div className="font-medium text-slate-700">Click to upload files</div>
              <div className="text-sm text-slate-500">or drag and drop</div>
            </div>

            {attachError && (
              <div className="mt-2 text-sm text-red-600">{attachError}</div>
            )}

            {photos.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {photos.map((f, i) => (
                  <div key={i} className="relative">
                    <img src={URL.createObjectURL(f)} className="w-full h-24 object-cover rounded" alt={f.name} />
                    <button onClick={() => removePhoto(i)} className="absolute -top-2 -right-2 bg-white rounded-full p-1 border border-slate-300">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
