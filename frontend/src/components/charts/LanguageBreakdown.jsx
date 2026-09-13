import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { LANGUAGE_COLORS, CHART_COLORS } from '../../utils/constants';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-800 border border-slate-700 p-2 rounded-lg shadow-xl text-sm">
        <span className="font-medium text-slate-200">{data.name}: </span>
        <span className="text-slate-400">{data.value.toLocaleString()} bytes</span>
      </div>
    );
  }
  return null;
};

export const LanguageBreakdown = ({ data = {} }) => {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => {
              const langKey = entry.name.replace(/^\./, '').toLowerCase();
              const matchedColor = Object.entries(LANGUAGE_COLORS).find(
                ([key]) => key.toLowerCase() === langKey
              )?.[1];
              
              const color = matchedColor || LANGUAGE_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length];
              
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={color} 
                />
              );
            })}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => <span className="text-slate-300 text-sm ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
