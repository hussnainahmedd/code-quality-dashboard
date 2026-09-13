import React, { useState, useEffect } from 'react';
import { repoService } from '../services/repoService';
import { analysisService } from '../services/analysisService';
import { Card } from '../components/common/Card';
import { FileText, Download, Play, FileJson } from 'lucide-react';

export const ReportsPage = () => {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState(null);

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

  const handleGenerate = async (repoId) => {
    setIsGenerating(true);
    setReport(null);
    try {
      const data = await analysisService.generateReport(repoId);
      setReport(data);
      setSelectedRepo(repos.find(r => r.id === repoId));
    } catch (error) {
      console.error('Failed to generate report', error);
      alert('Failed to generate report. Make sure the repository has been analyzed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedRepo) return;
    try {
      const blob = await analysisService.downloadReport(selectedRepo.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedRepo.full_name.replace('/', '_')}_quality_report.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed', error);
      alert('Download failed.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card title="Available Repositories" subtitle="Select a repo to generate a report">
            <div className="space-y-3 mt-4 max-h-[600px] overflow-y-auto pr-2">
              {repos.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No repositories found.</p>
              ) : (
                repos.map(repo => (
                  <div key={repo.id} className="flex flex-col bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 hover:border-emerald-500/30 transition-colors group">
                    <span className="font-medium text-slate-200 mb-3 truncate" title={repo.full_name}>{repo.full_name}</span>
                    <button
                      onClick={() => handleGenerate(repo.id)}
                      disabled={isGenerating}
                      className="w-full flex items-center justify-center px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-sm rounded-lg transition-colors border border-slate-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Generate Report
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {isGenerating ? (
            <Card className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 border-dashed">
              <FileText className="w-12 h-12 mb-4 animate-pulse text-emerald-500/50" />
              <p className="animate-pulse">Compiling comprehensive quality report...</p>
            </Card>
          ) : report ? (
            <Card className="h-full flex flex-col" title={`Report: ${selectedRepo?.full_name}`} action={
              <button 
                onClick={handleDownload}
                className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                Download JSON
              </button>
            }>
              <div className="flex-1 bg-slate-950 rounded-xl p-4 overflow-auto border border-slate-800 relative mt-4 max-h-[600px]">
                <div className="absolute top-4 right-4 text-slate-600">
                  <FileJson className="w-6 h-6" />
                </div>
                <pre className="text-xs text-emerald-400 font-mono">
                  {JSON.stringify(report, null, 2)}
                </pre>
              </div>
            </Card>
          ) : (
            <Card className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-500 border-dashed">
              <FileText className="w-16 h-16 mb-4 text-slate-600" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No Report Generated</h3>
              <p>Select a repository from the list to generate and view its detailed code quality report.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
