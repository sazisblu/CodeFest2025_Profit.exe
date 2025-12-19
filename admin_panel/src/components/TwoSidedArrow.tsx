import React from 'react';

type Item = {
  label: string;
  value?: string;
  side?: 'left' | 'right';
};

interface Props {
  items?: Item[]; // up to 3 items recommended
  className?: string;
}

export default function TwoSidedArrow({ items = [], className = '' }: Props) {
  // default three items placeholder
  const list: Item[] = items.length ? items : [
    { label: 'Revenue', value: '$2.4M', side: 'right' },
    { label: 'Growth', value: '+24%', side: 'left' },
    { label: 'Users', value: '12.5K', side: 'right' },
    { label: 'Retention', value: '89%', side: 'left' }
  ];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg width="1000" height="440" viewBox="0 0 1000 440" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#3a2a1f" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* vertical trunk (tree) */}
        <g transform="translate(500,220)">
          <rect x="-46" y="-190" width="92" height="380" rx="20" fill="#d3b789" filter="url(#shadow)" />
          <rect x="-42" y="-186" width="84" height="372" rx="18" fill="#d3b789" opacity="0.14" />

          {/* branches (three), positioned vertically */}
          {list.map((it, idx) => {
            const verticalOffset = -136; // move all arrows a bit up
            const y = verticalOffset + idx * 78; // spacing between branches
            const isLeft = it.side === 'left' || (it.side === undefined && idx % 2 === 1);
            const branchLength = 240;
            const branchWidth = 38;
            const arrowSize = 30;
            const branchX = isLeft ? -46 - branchLength : 46;

            return (
              <g key={idx} transform={`translate(${branchX}, ${y})`}>
                {/* branch body */}
                <rect x={0} y={-branchWidth / 2} width={branchLength} height={branchWidth} rx={6} fill="#d3b789" />
                {/* small fold face near head */}
                {isLeft ? (
                  <g>
                    <polygon points={`0,${-branchWidth/2} ${-arrowSize},0 0,${branchWidth/2}`} fill="#d3b789" />
                    <polygon points={`0,${-branchWidth/2} 8,${-branchWidth/2} 8,${branchWidth/2} 0,${branchWidth/2}`} fill="#c7a770" opacity="0.12" />
                  </g>
                ) : (
                  <g>
                    <polygon points={`${branchLength},${-branchWidth/2} ${branchLength + arrowSize},0 ${branchLength},${branchWidth/2}`} fill="#d3b789" />
                    <polygon points={`${branchLength},${-branchWidth/2} ${branchLength - 8},${-branchWidth/2} ${branchLength - 8},${branchWidth/2} ${branchLength},${branchWidth/2}`} fill="#c7a770" opacity="0.12" />
                  </g>
                )}

                {/* inner label centered on branch */}
                <text x={branchLength / 2} y={6} textAnchor="middle" fontSize={18} fontWeight={600} fill="#2f1f12" fontFamily="Inter, Arial, sans-serif">
                  {it.label}
                </text>

              </g>
            );
          })}
        </g>

        {/* render numeric values outside transform group at fixed positions */}
        {list.map((it, idx) => {
          const verticalOffset = -136;
          const yLocal = verticalOffset + idx * 78;
          const absY = 220 + yLocal + 6;
          const isLeft = it.side === 'left' || (it.side === undefined && idx % 2 === 1);
          const numX = isLeft ? 100 : 910;
          const boxWidth = 140;

          return it.value ? (
            <g key={`num-${idx}`}>
              <rect
                x={numX - boxWidth / 2}
                y={absY - 20}
                width={boxWidth}
                height={40}
                rx={8}
                fill="#ffffff"
                opacity={0.98}
              />
              <text
                x={numX}
                y={absY + 6}
                textAnchor="middle"
                fontSize={18}
                fontWeight={700}
                fill="#000000"
                fontFamily="Inter, Arial, sans-serif"
              >
                {it.value}
              </text>
            </g>
          ) : null;
        })}
      </svg>
    </div>
  );
}
