import React from 'react';
import { motion } from 'motion/react';
import { Badge } from './ui/Badge';

interface CircularMeterProps {
  value: number; // 0 to 1
  jaccard: number; // 0 to 1
  category: 'identical' | 'high' | 'moderate' | 'low' | 'distinct';
  docALabel?: string;
  docBLabel?: string;
}

export const CircularMeter: React.FC<CircularMeterProps> = ({
  value,
  jaccard,
  category,
  docALabel,
  docBLabel,
}) => {
  const percentage = Math.round(value * 1000) / 10;
  const jaccardPct = Math.round(jaccard * 1000) / 10;

  const size = 200;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value * circumference);

  const categoryLabels = {
    identical: 'Identical (100%)',
    high: 'High Overlap',
    moderate: 'Moderate Overlap',
    low: 'Low Overlap',
    distinct: 'Distinct',
  };

  const categoryBadgeVariant: Record<string, 'copper' | 'neutral' | 'warning' | 'success'> = {
    identical: 'copper',
    high: 'copper',
    moderate: 'warning',
    low: 'neutral',
    distinct: 'neutral',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#0e0e12] rounded-xl border border-[#222228] relative overflow-hidden">
      {/* Background radial ambient glow */}
      <div
        className="absolute w-48 h-48 rounded-full pointer-events-none opacity-20 blur-3xl transition-all duration-700"
        style={{
          backgroundColor: '#d47a3a',
          transform: `scale(${0.7 + value * 0.6})`,
        }}
      />

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1c1c24"
            strokeWidth={strokeWidth}
          />
          {/* Animated active progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#d47a3a"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <motion.div
            key={`${percentage}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-baseline"
          >
            <span className="text-4xl font-semibold tracking-tight text-[#efe6d4] font-mono">
              {percentage.toFixed(1)}
            </span>
            <span className="text-xl font-mono text-[#d47a3a] ml-0.5">%</span>
          </motion.div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#8e8579] mt-1">
            TF-IDF Cosine
          </span>
        </div>
      </div>

      {/* Metric Breakdown & Badges */}
      <div className="mt-5 flex flex-col items-center gap-2 w-full max-w-[240px]">
        <Badge variant={categoryBadgeVariant[category] || 'neutral'} className="text-[11px] px-2.5 py-1">
          {categoryLabels[category]}
        </Badge>

        <div className="flex items-center justify-between w-full pt-3 mt-1 border-t border-[#1c1c24] text-xs">
          <span className="text-[#8e8579]">Jaccard Similarity</span>
          <span className="font-mono text-[#efe6d4] font-medium">
            {jaccardPct.toFixed(1)}%
          </span>
        </div>

        {docALabel && docBLabel && (
          <div className="flex items-center justify-between w-full text-xs">
            <span className="text-[#8e8579]">Active Pair</span>
            <span className="font-mono text-[#d47a3a] font-medium">
              {docALabel} ↔ {docBLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
