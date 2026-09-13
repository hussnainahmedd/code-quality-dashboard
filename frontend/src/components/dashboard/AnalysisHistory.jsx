import React from 'react';
import { Card } from '../common/Card';
import { GradeBadge } from '../common/GradeBadge';
import { formatDate } from '../../utils/formatters';

export const AnalysisHistory = ({ analyses = [], onRowClick }) => {
  if (!analyses || analyses.length === 0) {
    return (
      <Card title="Analysis History">
        <div className="p-8 text-center text-slate-400">
          No analysis history available.
        </div>
      </Card>
    );
  }

  return (
    <Card title="Analysis History" className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/50 border-b border-slate-700/50 text-slate-400 uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Grade</th>
              <th className="px-6 py-4 font-medium text-right">MI Score</th>
              <th className="px-6 py-4 font-medium text-right">Avg Complexity</th>
              <th className="px-6 py-4 font-medium text-right">Files</th>
              <th className="px-6 py-4 font-medium text-right">Lines</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {analyses.map((analysis) => (
              <tr 
                key={analysis.id} 
                className="hover:bg-slate-700/30 transition-colors cursor-pointer group"
                onClick={() => onRowClick && onRowClick(analysis.id)}
              >
                <td className="px-6 py-4 text-slate-300">
                  {formatDate(analysis.created_at)}
                </td>
                <td className="px-6 py-4">
                  <GradeBadge grade={analysis.complexity_grade || 'B'} size="sm" />
                </td>
                <td className="px-4 py-3 text-sm text-slate-200">
                  {(analysis.avg_maintainability || analysis.maintainability_index || 0).toFixed(1)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-200">
                  {(analysis.avg_complexity || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right text-slate-400">
                  {analysis.total_files.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-slate-400">
                  {analysis.total_lines.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
