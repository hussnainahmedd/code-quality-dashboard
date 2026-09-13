import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { repoService } from '../services/repoService';
import { analysisService } from '../services/analysisService';
import { OverviewPanel } from '../components/dashboard/OverviewPanel';
import { Loading } from '../components/common/Loading';
import { Card } from '../components/common/Card';
import { GradeBadge } from '../components/common/GradeBadge';
import { Star, GitFork, ChevronRight, Plus, Terminal } from 'lucide-react';
import { LANGUAGE_COLORS } from '../utils/constants';
import { formatDate } from '../utils/formatters';

export const DashboardPage = () => {
  const [repos, setRepos] = useState([]);
  const [analyses, setAnalyses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const reposData = await repoService.getRepositories();
      setRepos(reposData);
      
      const analysesData = {};
      for (const repo of reposData) {
        try {
          const analysis = await analysisService.getLatestAnalysis(repo.id);
          analysesData[repo.id] = analysis;
        } catch (e) {
          // ignore if no analysis exists
        }
      }
      setAnalyses(analysesData);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [myRepos, setMyRepos] = useState([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);

  useEffect(() => {
    if (isAdding && myRepos.length === 0) {
      setIsLoadingRepos(true);
      repoService.getMyRepos()
        .then(setMyRepos)
        .catch(err => console.error("Failed to load my repos", err))
        .finally(() => setIsLoadingRepos(false));
    }
  }, [isAdding, myRepos.length]);

  const handleSelectMyRepo = async (fullName) => {
    try {
      await repoService.addRepository(fullName);
      setIsAdding(false);
      fetchData();
    } catch (error) {
      console.error('Failed to add repo', error);
      alert('Failed to add repository.');
    }
  };

  const handleAddRepo = async (e) => {
    e.preventDefault();
    if (!newRepoName.trim()) return;
    try {
      await repoService.addRepository(newRepoName);
      setNewRepoName('');
      setIsAdding(false);
      fetchData();
    } catch (error) {
      console.error('Failed to add repo', error);
      alert('Failed to add repository. Please check the name format (owner/repo).');
    }
  };

  const handleAnalyze = async (e, id) => {
    e.stopPropagation();
    try {
      await repoService.analyzeRepository(id);
      fetchData(); // Refresh to get the new analysis
    } catch (error) {
      console.error('Analysis failed', error);
      alert('Analysis failed to start.');
    }
  };

  if (isLoading) return <Loading text="Loading Dashboard..." />;

  const analysesList = Object.values(analyses).filter(Boolean);

  return (
    <div className="space-y-8 animate-fade-in">
      <OverviewPanel repos={repos} analyses={analysesList} />
      
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-100 flex items-center">
            <Terminal className="w-5 h-5 mr-2 text-emerald-400" />
            Your Repositories
          </h2>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Repository
          </button>
        </div>

        {isAdding && (
          <Card className="mb-6 bg-slate-800/90 border-emerald-500/30">
            <form onSubmit={handleAddRepo} className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-400 mb-1">Add by Name (e.g. facebook/react)</label>
                <input
                  type="text"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  placeholder="owner/repo"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-4 text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  autoFocus
                />
              </div>
              <div className="flex space-x-2 mt-6">
                <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium">Add</button>
                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors font-medium">Cancel</button>
              </div>
            </form>

            <div className="border-t border-slate-700/50 pt-4">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Or select from your GitHub repositories:</h4>
              {isLoadingRepos ? (
                <div className="text-emerald-400 text-sm animate-pulse flex items-center">
                  <Terminal className="w-4 h-4 mr-2" /> Fetching your repositories...
                </div>
              ) : (myRepos && myRepos.length > 0) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2">
                  {myRepos.map(r => (
                    <button
                      key={r.full_name}
                      type="button"
                      onClick={() => handleSelectMyRepo(r.full_name)}
                      className="text-left px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg hover:border-emerald-500/50 hover:bg-slate-800 transition-colors flex flex-col group"
                    >
                      <span className="text-sm font-medium text-slate-200 truncate w-full group-hover:text-emerald-400 transition-colors">{r.name}</span>
                      <div className="flex justify-between items-center mt-2 w-full text-xs text-slate-500">
                        <span>{r.language || 'Unknown'}</span>
                        <span className="flex items-center"><Star className="w-3 h-3 mr-1" />{r.stars}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No repositories found on your account.</div>
              )}
            </div>
          </Card>
        )}

        {repos.length === 0 && !isAdding ? (
          <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50 border-dashed">
            <Terminal className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No repositories yet</h3>
            <p className="text-slate-500 mt-2 mb-6">Add a GitHub repository to start analyzing its code quality.</p>
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors font-medium inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Repository
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.map(repo => {
              const analysis = analyses[repo.id];
              const langColor = LANGUAGE_COLORS[repo.language] || LANGUAGE_COLORS.default;
              
              return (
                <Card 
                  key={repo.id} 
                  className="group hover:border-emerald-500/50 hover:shadow-emerald-500/5 transition-all cursor-pointer p-0 overflow-hidden flex flex-col"
                >
                  <div className="p-5 flex-1" onClick={() => navigate(`/repository/${repo.id}`)}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-slate-100 truncate pr-2 text-lg" title={repo.full_name}>
                        {repo.full_name.split('/')[1]}
                        <span className="block text-xs font-normal text-slate-500 truncate mt-0.5">{repo.full_name.split('/')[0]}</span>
                      </h3>
                      {analysis ? (
                        <GradeBadge grade={analysis.complexity_grade || 'B'} size="md" />
                      ) : (
                        <span className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs">Unanalyzed</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-400 mb-6">
                      <span className="flex items-center"><Star className="w-4 h-4 mr-1" />{repo.stars}</span>
                      <span className="flex items-center"><GitFork className="w-4 h-4 mr-1" />{repo.forks}</span>
                      <span className="flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: langColor }}></span>
                        {repo.language || 'Unknown'}
                      </span>
                    </div>

                    {analysis ? (
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Maintainability</span>
                            <span className="text-slate-200">{(analysis.avg_maintainability || 0).toFixed(1)}</span>
                          </div>
                          <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.max(0, analysis.avg_maintainability || 0))}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Avg Complexity</span>
                            <span className="text-slate-200">{(analysis.avg_complexity || 0).toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, ((analysis.avg_complexity || 0) / 20) * 100)}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-center text-sm text-slate-500 italic border border-slate-700/50 border-dashed rounded-lg">
                        Click 'Analyze' to generate metrics
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-slate-800 border-t border-slate-700/50 p-3 px-5 flex justify-between items-center mt-auto">
                    <span className="text-xs text-slate-500">
                      {analysis ? `Analyzed ${formatDate(analysis.created_at)}` : 'Never analyzed'}
                    </span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={(e) => handleAnalyze(e, repo.id)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded transition-colors"
                      >
                        {analysis ? 'Re-analyze' : 'Analyze'}
                      </button>
                      <button 
                        onClick={() => navigate(`/repository/${repo.id}`)}
                        className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs rounded transition-colors flex items-center"
                      >
                        View <ChevronRight className="w-3 h-3 ml-1" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
