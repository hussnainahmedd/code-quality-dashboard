import React from 'react';
import { MetricCard } from '../common/MetricCard';
import { BookOpen, Activity, Code, Clock } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const OverviewPanel = ({ repos = [], analyses = [] }) => {
  const totalRepos = repos.length;
  
  // Calculate average maintainability score
  const avgScore = analyses.length > 0 
    ? (analyses.reduce((acc, curr) => acc + (curr?.avg_maintainability || 0), 0) / analyses.length).toFixed(1)
    : 0;

  const totalLines = analyses.reduce((acc, curr) => acc + (curr?.total_lines || 0), 0);
  
  const latestDate = analyses.length > 0
    ? analyses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0].created_at
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        icon={BookOpen}
        label="Total Repositories"
        value={totalRepos}
      />
      <MetricCard
        icon={Activity}
        label="Avg Quality Score"
        value={avgScore}
        change={avgScore > 75 ? 5.2 : -2.1}
        changeLabel="vs last month"
      />
      <MetricCard
        icon={Code}
        label="Total Lines Analyzed"
        value={totalLines.toLocaleString()}
      />
      <MetricCard
        icon={Clock}
        label="Latest Analysis"
        value={latestDate ? formatDate(latestDate) : 'Never'}
      />
    </div>
  );
};
