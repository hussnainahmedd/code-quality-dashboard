import React, { useState, useEffect } from 'react';
import { repoService } from '../services/repoService';
import { analysisService } from '../services/analysisService';
import { Card } from '../components/common/Card';
import { Loading } from '../components/common/Loading';
import { ComparisonBar } from '../components/charts/ComparisonBar';
import { CodeMetricsRadar } from '../components/charts/CodeMetricsRadar';
import { GradeBadge } from '../components/common/GradeBadge';
import { GitCompare, AlertCircle } from 'lucide-react';

export const ComparePage = () => {
  const [repos, setRepos] = useState([]);
  const [repo1Id, setRepo1Id] = useState('');
  const [repo2Id, setRepo2Id] = useState('');
  const [comparisonData, setComparisonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const data = await repoService.getRepositories();
        setRepos(data);
      } catch (err) {
        console.error('Failed to fetch repos', err);
      }
    };
    fetchRepos();
  }, []);

  const handleCompare = async () => {
    if (!repo1Id || !repo2Id) {
      setError('Please select two repositories to compare.');
      return;
    }
    if (repo1Id === repo2Id) {
      setError('Please select different repositories.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const data = await analysisService.compareRepositories(repo1Id, repo2Id);
      setComparisonData(data);
    } catch (err) {
      setError('Failed to compare repositories. Make sure both have been analyzed.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Find repo name by id
  const getRepoName = (repoId) => {
    const repo = repos.find(r => r.id === parseInt(repoId));
    return repo?.full_name || `Repo ${repoId}`;
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <Card className="bg-slate-800/80 border-emerald-500/20">
        <div className="flex flex-col md:flex-row items-end gap-6">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-400 mb-2">First Repository (Base)</label>
            <select 
              value={repo1Id} 
              onChange={(e) => setRepo1Id(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-emerald-500/50 appearance-none"
            >
              <option value="">Select a repository...</option>
              {repos.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
            </select>
          </div>
          
          <div className="hidden md:flex pb-3 items-center justify-center px-4">
            <div className="p-3 bg-slate-700/50 rounded-full border border-slate-600">
              <GitCompare className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-400 mb-2">Second Repository (Compare)</label>
            <select 
              value={repo2Id} 
              onChange={(e) => setRepo2Id(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:border-blue-500/50 appearance-none"
            >
              <option value="">Select a repository...</option>
              {repos.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
            </select>
          </div>
          
          <button
            onClick={handleCompare}
            disabled={isLoading || !repo1Id || !repo2Id}
            className="w-full md:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
          >
            {isLoading ? 'Comparing...' : 'Compare'}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center text-red-400">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}
      </Card>

      {isLoading && <Card className="py-12"><Loading text="Generating comparison report..." /></Card>}

      {comparisonData && !isLoading && (() => {
        // Backend returns: { repo1: AnalysisResponse, repo2: AnalysisResponse }
        // AnalysisResponse has: avg_maintainability, avg_complexity, complexity_grade, total_files, total_lines
        const r1 = comparisonData.repo1;
        const r2 = comparisonData.repo2;
        const r1Name = getRepoName(repo1Id);
        const r2Name = getRepoName(repo2Id);

        const barData = [
          { metric: 'Maintainability', repo1: r1.avg_maintainability || 0, repo2: r2.avg_maintainability || 0 },
          { metric: 'Simplicity', repo1: Math.max(0, 100 - ((r1.avg_complexity || 0) * 5)), repo2: Math.max(0, 100 - ((r2.avg_complexity || 0) * 5)) },
          { metric: 'Total Files', repo1: r1.total_files || 0, repo2: r2.total_files || 0 },
        ];

        const radarData = [
          { metric: 'Maintainability', score: r1.avg_maintainability || 0 },
          { metric: 'Simplicity', score: Math.max(0, 100 - ((r1.avg_complexity || 0) * 5)) },
          { metric: 'Size', score: Math.min(100, Math.max(20, 100 - ((r1.total_lines || 0) / 500))) },
        ];

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Repo 1 Summary */}
              <Card className="border-emerald-500/30 bg-slate-800/90 text-center">
                <h3 className="text-xl font-bold text-emerald-400 mb-4 truncate">{r1Name}</h3>
                <div className="flex justify-center mb-6">
                  <GradeBadge grade={r1.complexity_grade || 'B'} size="lg" />
                </div>
                <div className="space-y-3 text-sm text-left px-4">
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-slate-400">Maintainability</span>
                    <span className="font-bold text-slate-100">{(r1.avg_maintainability || 0).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-slate-400">Complexity</span>
                    <span className="font-bold text-slate-100">{(r1.avg_complexity || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-slate-400">Files</span>
                    <span className="font-bold text-slate-100">{r1.total_files || 0}</span>
                  </div>
                </div>
              </Card>

              {/* Radar Comparison */}
              <Card className="col-span-1 border-slate-700" title="Quality Radar">
                <CodeMetricsRadar data={radarData} />
              </Card>

              {/* Repo 2 Summary */}
              <Card className="border-blue-500/30 bg-slate-800/90 text-center">
                <h3 className="text-xl font-bold text-blue-400 mb-4 truncate">{r2Name}</h3>
                <div className="flex justify-center mb-6">
                  <GradeBadge grade={r2.complexity_grade || 'B'} size="lg" />
                </div>
                <div className="space-y-3 text-sm text-left px-4">
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-slate-400">Maintainability</span>
                    <span className="font-bold text-slate-100">{(r2.avg_maintainability || 0).toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-slate-400">Complexity</span>
                    <span className="font-bold text-slate-100">{(r2.avg_complexity || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-slate-400">Files</span>
                    <span className="font-bold text-slate-100">{r2.total_files || 0}</span>
                  </div>
                </div>
              </Card>
            </div>

            <Card title="Head-to-Head Metric Comparison">
              <ComparisonBar 
                repo1Name={r1Name}
                repo2Name={r2Name}
                data={barData} 
              />
            </Card>

            {/* Summary */}
            <Card className="bg-slate-800/60">
              <h3 className="font-semibold text-slate-200 mb-3">Summary</h3>
              <div className="space-y-2 text-sm text-slate-400">
                {(r1.avg_maintainability || 0) > (r2.avg_maintainability || 0) ? (
                  <p>📊 <span className="text-emerald-400">{r1Name}</span> has better maintainability ({(r1.avg_maintainability||0).toFixed(1)} vs {(r2.avg_maintainability||0).toFixed(1)})</p>
                ) : (
                  <p>📊 <span className="text-blue-400">{r2Name}</span> has better maintainability ({(r2.avg_maintainability||0).toFixed(1)} vs {(r1.avg_maintainability||0).toFixed(1)})</p>
                )}
                {(r1.avg_complexity || 0) < (r2.avg_complexity || 0) ? (
                  <p>⚡ <span className="text-emerald-400">{r1Name}</span> has lower complexity ({(r1.avg_complexity||0).toFixed(2)} vs {(r2.avg_complexity||0).toFixed(2)})</p>
                ) : (
                  <p>⚡ <span className="text-blue-400">{r2Name}</span> has lower complexity ({(r2.avg_complexity||0).toFixed(2)} vs {(r1.avg_complexity||0).toFixed(2)})</p>
                )}
              </div>
            </Card>
          </div>
        );
      })()}
    </div>
  );
};
