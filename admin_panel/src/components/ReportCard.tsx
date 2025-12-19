import React from 'react'

interface Props {
  id: string
  title: string
  department?: string
  completedDate?: string
  satisfactionScore?: number
  category?: string
  categoryColor?: string
  categoryIcon?: string
  onClick?: () => void
  onDelete?: () => void
  onRequestDelete?: () => void
}

export default function ReportCard({ id, title, department, completedDate, satisfactionScore, category, categoryColor, categoryIcon, onClick, onDelete, onRequestDelete }: Props) {
  return (
    <article
      onClick={onClick}
      className="h-full cursor-pointer transform-gpu transition-all duration-300 hover:shadow-lg flex"
    >
      <div className="relative w-full h-full">
        <div className="sticky-note h-full flex flex-col p-6">
          <div className="note-pin" aria-hidden />

          <div className="flex-1 flex items-start justify-start">
            <div className="w-full note-lines p-4 rounded-md">
              <h3 className="text-xl sm:text-2xl font-semibold text-[#333333] leading-tight mb-2">{title}</h3>
              {category ? (
                <div className="text-base font-semibold text-[#2D3F7B] mb-2">{category}</div>
              ) : (
                <div className="text-sm text-slate-700 mb-2">{department}</div>
              )}
              <div className="text-sm text-slate-600">{completedDate}</div>
            </div>
          </div>

        </div>

        {/* Delete (dustbin) button */}
        {(onDelete || onRequestDelete) && (
          <div className="absolute bottom-3 right-3 z-40">
            <button
              onClick={(e) => { e.stopPropagation(); if (onRequestDelete) onRequestDelete(); else if (onDelete) onDelete(); }}
              title="Delete report"
              aria-label="Delete report"
              className="w-8 h-8 text-red-700 flex items-center justify-center transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden>
                <path d="M3 6h18v2H3V6zm2 3h14l-1 11H6L5 9zm3-6h6l1 1H7l1-1z" />
              </svg>
            </button>
          </div>
        )}

      </div>
    </article>
  )
}
