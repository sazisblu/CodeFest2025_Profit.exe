"use client";
import { Issue, Report } from "@/types/issue";

interface IssueDetailProps {
  issue: Issue;
  showReports: boolean;
  onShowReportsToggle: () => void;
  onBack: () => void;
}

export default function IssueDetail({
  issue,
  showReports,
  onShowReportsToggle,
  onBack,
}: IssueDetailProps) {
  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-[#2D3F7B] hover:text-[#19295C] font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Issues List
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#19295C" }}>
                  Priority Issues
                </h1>
                <p className="text-slate-500 mt-1">
                  AI-grouped citizen reports ranked by community impact.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 text-sm font-semibold"
                  style={{ color: "#2D3F7B" }}
                >
                  {issue.reportsCount} Reports
                </div>
                <div
                  className="px-3 py-2 bg-white rounded-lg border border-blue-100 text-sm font-semibold"
                  style={{ color: "#19295C" }}
                >
                  Priority {issue.priority}
                </div>
              </div>
            </div>
          </div>

          {/* Issue Detail Card */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            <div className="p-8">
              <div className="flex gap-8">
                {/* Left Content */}
                <div className="flex-1">
                  {/* Header Tags */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-semibold text-black">
                      {issue.category}
                    </span>

                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{issue.location}</span>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-slate-500 ml-3">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{issue.timeAgo}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2
                    className="text-2xl font-bold mb-4"
                    style={{ color: "#19295C" }}
                  >
                    {issue.title}
                  </h2>

                  {/* AI Summary */}
                  <div className="flex items-start gap-3 mb-6">
                    <div className="w-7 h-7 bg-gradient-to-r from-[#2D3F7B] to-[#19295C] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 mb-2">
                        Issue Description
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        {issue.description}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="font-semibold text-slate-900">
                        {issue.reportsCount} Reports
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 11l3-3 3 3m-3-3v8"
                        />
                      </svg>
                      <span className="text-green-600 font-semibold">
                        {issue.engagement}
                      </span>
                    </div>
                    {issue.likes !== undefined && (
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span className="text-slate-900 font-semibold">
                          {issue.likes} Likes
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Hide/Show Reports Toggle */}
                  <div className="mb-6">
                    <button
                      onClick={onShowReportsToggle}
                      className="flex items-center gap-2 text-[#2D3F7B] hover:text-[#19295C] font-medium"
                    >
                      <span>
                        {showReports ? "Hide Reports" : "Show Reports"}
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          showReports ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Recent Citizen Reports */}
                  {showReports && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-4">
                        Recent Citizen Reports
                      </h3>
                      <div className="space-y-4">
                        {issue.recentReports &&
                        issue.recentReports.length > 0 ? (
                          issue.recentReports.map(
                            (report: Report, index: number) => (
                              <div
                                key={index}
                                className="flex gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm"
                              >
                                <div className="w-10 h-10 bg-[#2D3F7B] rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white font-semibold">
                                    {report.avatar}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="font-semibold text-slate-900">
                                      {report.name}
                                    </span>
                                    <span className="text-sm text-slate-500">
                                      {report.timeAgo}
                                    </span>
                                  </div>
                                  <p className="text-slate-700 mb-3 leading-relaxed">
                                    {report.report}
                                  </p>
                                  {report.image && (
                                    <div className="mt-3">
                                      <img
                                        src={report.image}
                                        alt="Issue reported by citizen"
                                        className="w-48 h-32 object-cover rounded-lg border border-slate-200"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <p className="text-slate-500">No comments yet</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - Priority Score & Action */}
                <div className="flex flex-col items-center gap-6 w-56">
                  <div className="text-center">
                    <div
                      className="text-6xl font-bold mb-2"
                      style={{ color: "#19295C" }}
                    >
                      {issue.priority}
                    </div>
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                      PRIORITY SCORE
                    </div>
                  </div>

                  <button className="px-6 py-3 bg-[#2D3F7B] text-white rounded-xl font-semibold hover:bg-[#19295C] transition-colors shadow-sm">
                    Draft Proposal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
