import React from 'react';
import { GRADE_COLORS } from '../../utils/constants';

export const GradeBadge = ({ grade, size = 'md' }) => {
  const colors = GRADE_COLORS[grade] || GRADE_COLORS.C;
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-xl font-bold'
  };

  return (
    <div className={`inline-flex items-center justify-center rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]}`}>
      {grade}
    </div>
  );
};
