"use client";
import { Issue } from "@/types/issue";

interface IssuesListProps {
  filteredIssues: Issue[];
  issuesData: Issue[];
  searchTerm: string;
  onIssueClick: (issue: Issue) => void;
}

export default function IssuesList({
  filteredIssues,
  issuesData,
  searchTerm,
  onIssueClick,
}: IssuesListProps) {
  return (
    <div className="space-y-4">
      {filteredIssues.length > 0 ? (
        filteredIssues.map((issue, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={issue.id}
              onClick={() => onIssueClick(issue)}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-shadow cursor-pointer hover:shadow-md ${
                isEven
                  ? "bg-blue-50 border-blue-100"
                  : "bg-white border-slate-200"
              }`}
            >
              <img
                src={issue.image}
                alt="Issue"
                className={`w-12 h-12 rounded-lg object-cover ${
                  isEven ? "border-blue-100" : "border-slate-200"
                } shadow-sm`}
              />

              <div className="w-20 flex flex-col items-center justify-center">
                <div
                  className="text-2xl font-extrabold leading-none"
                  style={{ color: "#19295C" }}
                >
                  {issue.priority}
                </div>
                <div className="text-xs text-slate-500 tracking-wider">
                  PRIORITY
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 mb-1 truncate">
                  {issue.title}
                </h4>
                <p className="text-sm text-slate-500 flex items-center gap-1 truncate">
                  <svg
                    className="w-3 h-3 text-slate-400"
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
                  <span
                    className="truncate"
                    style={{ color: "#2D3F7B", opacity: 0.85 }}
                  >
                    {issue.location}
                  </span>
                </p>
              </div>

              <div className="w-56 flex items-center justify-end gap-4">
                <span className="text-sm font-semibold text-black mr-6 whitespace-nowrap">
                  {issue.category}
                </span>
                <span
                  className={`text-sm font-semibold whitespace-nowrap ${issue.statusColor}`}
                >
                  {issue.status}
                </span>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {issue.submitted}
                </span>
              </div>

              <div className="shrink-0 pl-2">
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-500">
            No issues found matching your filters
          </p>
        </div>
      )}
    </div>
  );
}
