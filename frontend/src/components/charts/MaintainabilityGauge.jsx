import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { GRADE_COLORS } from '../../utils/constants';

export const MaintainabilityGauge = ({ score = 0, grade = 'C' }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const data = [
    { name: 'Score', value: animatedScore },
    { name: 'Remainder', value: 100 - animatedScore }
  ];

  const color = GRADE_COLORS[grade]?.fill || GRADE_COLORS.C.fill;

  return (
    <div className="relative h-[250px] w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="70%"
            startAngle={180}
            endAngle={0}
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={color} style={{ transition: 'all 1s ease-out' }} />
            <Cell fill="#1e293b" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <span className="block text-4xl font-bold text-slate-100">{Math.round(animatedScore)}</span>
        <span className={`block text-sm font-medium mt-1 ${GRADE_COLORS[grade]?.text}`}>Grade {grade}</span>
      </div>
    </div>
  );
};
