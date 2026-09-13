import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GRADE_COLORS } from '../../utils/constants';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-200 font-medium truncate max-w-[250px]">{data.name}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-slate-400">Complexity:</span>
          <span className="text-slate-100 font-bold">{data.complexity}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${GRADE_COLORS[data.rank]?.bg} ${GRADE_COLORS[data.rank]?.text}`}>
            {data.rank}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const ComplexityChart = ({ data = [] }) => {
  const top15 = [...data].sort((a, b) => b.complexity - a.complexity).slice(0, 15);

  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={top15}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
          <XAxis type="number" stroke="#94a3b8" />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={100} 
            stroke="#94a3b8"
            tickFormatter={(value) => value.split('/').pop()}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.4 }} />
          <Bar dataKey="complexity" radius={[0, 4, 4, 0]}>
            {top15.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.rank]?.fill || GRADE_COLORS.C.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
