import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { repoService } from '../services/repoService';
import { analysisService } from '../services/analysisService';
import { Loading } from '../components/common/Loading';
import { Card } from '../components/common/Card';
import { MetricCard } from '../components/common/MetricCard';
import { GradeBadge } from '../components/common/GradeBadge';
import { ComplexityChart } from '../components/charts/ComplexityChart';
import { LanguageBreakdown } from '../components/charts/LanguageBreakdown';
import { CodeMetricsRadar } from '../components/charts/CodeMetricsRadar';
import { TrendLineChart } from '../components/charts/TrendLineChart';
import { Star, GitFork, ExternalLink, Activity, Hash, AlertTriangle, Play, Download, Code } from 'lucide-react';
import { LANGUAGE_COLORS } from '../utils/constants';
import { formatDate } from '../utils/formatters';

export const RepositoryPage = () => {
  const { id } = useParams();
  const [repo, setRepo] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRepoData = async () => {
    try {
      const repoData = await repoService.getRepository(id);
      setRepo(repoData);
      
      try {
        const [latestAnalysis, historyData] = await Promise.all([
          analysisService.getLatestAnalysis(id),
          analysisService.getAnalysisHistory(id)
        ]);
        setAnalysis(latestAnalysis);
        setHistory(historyData);
      } catch (e) {
        // No analysis yet
      }
    } catch (error) {
      console.error('Failed to fetch repo data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchRepoData();
  }, [id]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await repoService.analyzeRepository(id);
      await fetchRepoData();
    } catch (error) {
      console.error('Analysis failed', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const blob = await analysisService.downloadReport(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${repo.full_name.replace('/', '_')}_report.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report', error);
      alert('Failed to download report.');
    }
  };

  if (isLoading) return <Loading text="Loading Repository..." />;
  if (!repo) return <div className="text-slate-400 p-8 text-center">Repository not found.</div>;

  const langColor = LANGUAGE_COLORS[repo.language] || LANGUAGE_COLORS.default;

  // Transform historical data for TrendLineChart
  // Backend fields: avg_maintainability, avg_complexity
  const trendData = [...history]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map(h => ({
      date: formatDate(h.created_at),
      maintainability: parseFloat((h.avg_maintainability || 0).toFixed(1)),
      complexity: parseFloat((h.avg_complexity || 0).toFixed(2))
    }));

  // Prepare radar data — use backend field names
  const radarData = analysis ? [
    { metric: 'Maintainability', score: Math.min(100, analysis.avg_maintainability || 0) },
    { metric: 'Simplicity', score: Math.max(0, 100 - ((analysis.avg_complexity || 0) * 5)) },
    { metric: 'Modularity', score: Math.min(100, (analysis.total_files || 1) > 5 ? 75 : 40) },
    { metric: 'Documentation', score: analysis.raw_metrics ? Math.min(100, (analysis.raw_metrics.comments / Math.max(1, analysis.raw_metrics.sloc)) * 400) : 50 },
    { metric: 'Size Score', score: Math.min(100, Math.max(20, 100 - ((analysis.total_lines || 0) / 500))) }
  ] : [];

  // Filter file results — backend sends file_results with fields: file_path, avg_complexity, maintainability_score, maintainability_rank, complexity_rank, loc
  const fileResults = analysis?.file_results || [];
  const filteredFiles = fileResults.filter(file =>
    file.file_path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            <h1 className="text-3xl font-bold text-slate-100">{repo.full_name}</h1>
            {analysis && <GradeBadge grade={analysis.complexity_grade || 'B'} size="lg" />}
          </div>
          <p className="text-slate-400 mb-4 max-w-2xl">{repo.description || 'No description available.'}</p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <span className="flex items-center bg-slate-800 px-2 py-1 rounded border border-slate-700"><Star className="w-4 h-4 mr-1.5 text-yellow-500" />{repo.stars} Stars</span>
            <span className="flex items-center bg-slate-800 px-2 py-1 rounded border border-slate-700"><GitFork className="w-4 h-4 mr-1.5 text-slate-400" />{repo.forks} Forks</span>
            <span className="flex items-center bg-slate-800 px-2 py-1 rounded border border-slate-700">
              <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: langColor }}></span>
              {repo.language || 'Unknown'}
            </span>
            <a href={`https://github.com/${repo.full_name}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-emerald-400 hover:text-emerald-300 hover:underline">
              <Code className="w-4 h-4 mr-1.5" /> View on GitHub <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 min-w-[150px]">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            {isAnalyzing ? <span className="animate-pulse">Analyzing...</span> : <><Play className="w-4 h-4 mr-2" /> Run Analysis</>}
          </button>
          {analysis && (
            <button
              onClick={handleDownloadReport}
              className="flex items-center justify-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors font-medium"
            >
              <Download className="w-4 h-4 mr-2" /> Report
            </button>
          )}
          {analysis && (
            <div className="text-xs text-right text-slate-500 mt-2">
              Last analyzed: {formatDate(analysis.created_at)}
            </div>
          )}
        </div>
      </div>

      {!analysis && !isAnalyzing && (
        <Card className="text-center py-16 bg-slate-800/30 border-dashed">
          <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-200 mb-2">No Analysis Data</h3>
          <p className="text-slate-400 mb-6">Run an analysis to generate code quality metrics for this repository.</p>
          <button
            onClick={handleAnalyze}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors font-medium inline-flex items-center"
          >
            <Play className="w-5 h-5 mr-2" /> Start Analysis Now
          </button>
        </Card>
      )}

      {isAnalyzing && (
        <Card className="py-16"><Loading text="Analyzing repository code... This may take a few minutes." /></Card>
      )}

      {analysis && !isAnalyzing && (
        <>
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              icon={Activity}
              label="Maintainability Index"
              value={(analysis.avg_maintainability || 0).toFixed(1)}
              change={history.length > 1 ? (analysis.avg_maintainability || 0) - (history[1]?.avg_maintainability || 0) : null}
            />
            <MetricCard
              icon={AlertTriangle}
              label="Avg Complexity"
              value={(analysis.avg_complexity || 0).toFixed(2)}
              change={history.length > 1 ? (analysis.avg_complexity || 0) - (history[1]?.avg_complexity || 0) : null}
            />
            <MetricCard
              icon={Hash}
              label="Total Files"
              value={(analysis.total_files || 0).toLocaleString()}
            />
            <MetricCard
              icon={Code}
              label="Total Lines"
              value={(analysis.total_lines || 0).toLocaleString()}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Quality Dimensions" subtitle="Multi-axis evaluation of code health">
              <CodeMetricsRadar data={radarData} />
            </Card>
            
            <Card title="Language Distribution" subtitle="Files per language identified">
              {analysis.language_breakdown && Object.keys(analysis.language_breakdown).length > 0 ? (
                <LanguageBreakdown data={analysis.language_breakdown} />
              ) : (
                <div className="flex h-[300px] items-center justify-center text-slate-500">No language data</div>
              )}
            </Card>

            <Card title="Complexity Hotspots" subtitle="Top 15 most complex files">
              {fileResults.length > 0 ? (
                <ComplexityChart 
                  data={fileResults.map(f => ({ 
                    name: f.file_path, 
                    complexity: f.avg_complexity || 0, 
                    rank: f.complexity_rank || 'A'
                  }))} 
                />
              ) : (
                <div className="flex h-[300px] items-center justify-center text-slate-500">No complexity data</div>
              )}
            </Card>

            <Card title="Historical Trends" subtitle="Maintainability and complexity over time">
              {trendData.length > 0 ? (
                <TrendLineChart data={trendData} />
              ) : (
                <div className="flex h-[300px] items-center justify-center text-slate-500">Insufficient historical data</div>
              )}
            </Card>
          </div>

          {/* File Analysis Table */}
          <Card title="File Breakdown" action={
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
            />
          } className="p-0 overflow-hidden">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/90 border-b border-slate-700/50 text-slate-400 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 font-medium w-1/2">File Path</th>
                    <th className="px-6 py-4 font-medium text-right">Grade</th>
                    <th className="px-6 py-4 font-medium text-right">Complexity</th>
                    <th className="px-6 py-4 font-medium text-right">MI Score</th>
                    <th className="px-6 py-4 font-medium text-right">LOC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredFiles.map((file, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-3 font-mono text-slate-300 text-xs truncate max-w-md" title={file.file_path}>
                        {file.file_path}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <GradeBadge grade={file.complexity_rank || file.maintainability_rank || 'B'} size="sm" />
                      </td>
                      <td className="px-6 py-3 text-right text-slate-300 font-medium">
                        {(file.avg_complexity || 0).toFixed(1)}
                      </td>
                      <td className="px-6 py-3 text-right text-slate-400">
                        {(file.maintainability_score || 0).toFixed(1)}
                      </td>
                      <td className="px-6 py-3 text-right text-slate-400">
                        {file.loc || 0}
                      </td>
                    </tr>
                  ))}
                  {filteredFiles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        No files match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
