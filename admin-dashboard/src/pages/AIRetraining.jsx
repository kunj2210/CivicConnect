import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Bot, 
  Database, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  ChevronRight,
  ShieldCheck,
  Filter,
  Check,
  ThumbsUp,
  ThumbsDown,
  BrainCircuit,
  Cpu,
  Zap,
  Activity,
  Search
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AIRetraining = () => {
  const { darkMode } = useOutletContext();
  const { session } = useAuth();
  const [feedbackQueue, setFeedbackQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/reports/retraining-queue`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      setFeedbackQueue(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to sync with neural feedback queue');
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      setProcessingId(id);
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/reports/retraining-queue/${id}`, 
        { status },
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );
      
      // Update local state
      setFeedbackQueue(prev => prev.map(item => 
        item.id === id ? { ...item, status } : item
      ));
      
      setProcessingId(null);
    } catch (err) {
      console.error('Action failed:', err);
      setProcessingId(null);
    }
  };

  const filteredQueue = feedbackQueue.filter(item => {
    const matchesFilter = filter === 'all' || item.status.toLowerCase().includes(filter.toLowerCase());
    const matchesSearch = item.corrected_category.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.issue_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading && feedbackQueue.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCcw className="w-10 h-10 text-violet-500 animate-spin" />
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Neural Logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1 w-8 bg-violet-600 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.3)]"></span>
            <span className={`text-xs font-black uppercase tracking-[0.3em] ${darkMode ? 'text-violet-500' : 'text-violet-600'}`}>Machine Learning Feedback</span>
          </div>
          <h1 className={`text-4xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI <span className={`font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Reinforcement Queue</span></h1>
          <p className={`text-sm max-w-2xl ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Audit human corrections to autonomously retrain models and optimize predictive accuracy across all civic domains.
          </p>
        </div>
        <div className={`px-4 py-3 rounded-2xl border flex items-center gap-4 ${darkMode ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-violet-100 flex items-center justify-center">
                <Bot size={14} className="text-violet-600" />
              </div>
            ))}
          </div>
          <div>
            <div className="text-lg font-black leading-none">{feedbackQueue.length}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Awaiting Human Audit</div>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className={`glass-panel rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative ${darkMode ? 'bg-slate-900/50' : 'bg-white'}`}>
        {/* Toolbar */}
        <div className="px-8 py-6 border-b border-white/5 flex flex-col lg:flex-row items-center justify-between gap-6 bg-white/[0.02]">
          <div className="flex items-center gap-6 w-full lg:w-auto">
            <div className="flex bg-slate-100 dark:bg-white/5 rounded-2xl p-1 border border-white/5">
              {['all', 'Pending', 'Processed', 'Dismissed'].map((f) => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2 text-xs font-bold rounded-xl transition-all duration-300 uppercase tracking-wider ${filter === f ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'text-slate-500 hover:text-violet-500'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-11 pr-6 py-2.5 rounded-2xl border text-xs font-bold transition-all w-64 ${darkMode ? 'bg-white/5 border-white/5 text-white focus:bg-white/10' : 'bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-violet-500/10'}`}
              />
            </div>
          </div>
          <button onClick={fetchQueue} className="p-3 text-slate-500 hover:text-violet-500 hover:bg-violet-500/10 rounded-2xl transition-all group">
            <RefreshCcw className={`w-5 h-5 group-hover:rotate-180 transition-transform duration-700`} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Registry Detail</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">AI Detection</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Correction</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Human Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredQueue.map((item) => (
                <tr key={item.id} className="group hover:bg-violet-600/[0.02] transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-2xl overflow-hidden border p-1 transition-all duration-500 group-hover:rotate-3 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                          {item.media_url ? (
                            <img src={item.media_url} alt="Proof" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Database size={20} />
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-violet-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                          <Bot size={10} />
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] font-black font-mono text-slate-500 uppercase tracking-tighter">
                          ISSUE_#{item.issue_id.slice(-8).toUpperCase()}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                          Detected: {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20 line-through opacity-60">
                      {item.original_category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                      <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        {item.corrected_category}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      {item.status.includes('Pending') ? (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                      ) : item.status === 'Dismissed' ? (
                        <XCircle className="w-4 h-4 text-slate-500" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-violet-500" />
                      )}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        item.status.includes('Pending') ? 'text-amber-500' : 
                        item.status === 'Dismissed' ? 'text-slate-500' : 'text-violet-500'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                      {item.status.includes('Pending') && (
                        <>
                          <button 
                            disabled={processingId === item.id}
                            onClick={() => handleAction(item.id, 'Processed')}
                            className="bg-violet-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-500 shadow-xl shadow-violet-600/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                          >
                            {processingId === item.id ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <ThumbsUp className="w-3 h-3" />}
                            Train Model
                          </button>
                          <button 
                            disabled={processingId === item.id}
                            onClick={() => handleAction(item.id, 'Dismissed')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 disabled:opacity-50 ${darkMode ? 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-slate-600 hover:bg-gray-100'}`}
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                      {!item.status.includes('Pending') && (
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                          <Check className="w-3 h-3" /> Result Recorded
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQueue.length === 0 && (
          <div className="py-32 text-center">
            <div className="w-24 h-24 bg-violet-600/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 rotate-12 hover:rotate-0 transition-transform duration-700">
              <BrainCircuit className="w-12 h-12 text-violet-600" />
            </div>
            <h3 className={`text-2xl font-black mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Synapses Synchronized</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">
              No misclassifications detected by the audit cluster. Local neural parameters are within nominal bounds.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className={`p-6 rounded-3xl border border-dashed flex flex-col md:flex-row items-center gap-6 ${darkMode ? 'bg-violet-500/5 border-violet-500/20' : 'bg-violet-50 border-violet-200'}`}>
        <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center shadow-lg">
          <ShieldCheck className="text-violet-600" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className={`text-sm font-black uppercase tracking-wider mb-1 ${darkMode ? 'text-violet-400' : 'text-violet-900'}`}>Human-in-the-Loop Optimization</h4>
          <p className="text-xs text-slate-500 font-medium">
            Confirming samples directly updates the high-fidelity training dataset. These weights are prioritized during the next automated hyperparameter tuning cycle (Sunday 03:00 IST).
          </p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-white dark:bg-white/5 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest text-violet-600">
            v2.1 Stable
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRetraining;
