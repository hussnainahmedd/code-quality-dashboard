import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { repoService } from '../../services/repoService';

export const Header = ({ title }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const data = await repoService.searchRepos(query);
        setResults(data);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelectRepo = async (repo) => {
    setShowDropdown(false);
    setQuery('');
    try {
      const added = await repoService.addRepository(repo.full_name);
      navigate(`/repository/${added.id}`);
    } catch (error) {
      console.error('Failed to add repo:', error);
    }
  };

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 border-b border-slate-700/50">
      <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
      
      <div className="relative w-96" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search repositories..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
          />
        </div>

        {showDropdown && (query.trim() || results.length > 0) && (
          <div className="absolute top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-20">
            {isSearching ? (
              <div className="p-4 flex items-center justify-center text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Searching...
              </div>
            ) : results.length > 0 ? (
              <ul className="max-h-80 overflow-y-auto py-2">
                {results.map((repo) => (
                  <li key={repo.id}>
                    <button
                      onClick={() => handleSelectRepo(repo)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-700/50 text-slate-200 transition-colors flex flex-col"
                    >
                      <span className="font-medium">{repo.full_name}</span>
                      <span className="text-xs text-slate-400 line-clamp-1">{repo.description || 'No description'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : query.trim() ? (
              <div className="p-4 text-center text-slate-400 text-sm">
                No repositories found.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
};
