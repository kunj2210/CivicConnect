import React, { useState, useEffect } from 'react';
// Tactical Meta Tags
import { useOutletContext } from 'react-router-dom';
import { api } from '../utils/api';
import { BrainCircuit, CheckCircle, AlertTriangle, Cpu, Zap, Activity } from 'lucide-react';

const AIRetraining = () => {
    const { darkMode } = useOutletContext();
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const response = await api.get('/reports/retraining-queue');
                // setQueue(response); // Audit Log
                setQueue(response);
                setLoading(false);
            } catch (err) {
                setError(err.message || 'Failed to fetch AI feedback queue');
                setLoading(false);
            }
        };
        fetchQueue();
    }, []);

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Accessing Neural Logs...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
            <div className="p-4 bg-rose-500/10 rounded-full">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Synapse Interrupted</h3>
            <p className="text-slate-500 text-sm max-w-xs">{error}</p>
        </div>
    );

    return (
        <div className="space-y-10 py-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="h-1 w-8 bg-violet-600 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.3)]"></span>
                        <span className={`text-xs font-black uppercase tracking-[0.3em] ${darkMode ? 'text-violet-500' : 'text-violet-600'}`}>Machine Learning Feedback</span>
                    </div>
                    <h1 className={`text-4xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI <span className={`font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Retraining Queue</span></h1>
                    <p className={`text-sm max-w-2xl ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Review instances where human intelligence has corrected autonomous predictions to enhance future model accuracy.
                    </p>
                </div>
                <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${darkMode ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                    <Cpu className="w-4 h-4 text-violet-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Model: CV-Onyx-v2.1</span>
                </div>
            </div>

            <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Timestamp</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Registry ID</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Autonomous Label</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Human Correction</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Visual Proof</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {queue.map((item) => (
                                <tr key={item.id} className="group hover:bg-white/[0.03] transition-all duration-300">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-bold ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>{new Date(item.createdAt).toLocaleDateString()}</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-[11px] font-black font-mono text-slate-600 group-hover:text-violet-500 transition-colors">
                                            {(item.issue_id?.toString() || '').slice(0, 13)}...
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"></div>
                                            <span className={`text-sm font-bold line-through opacity-50 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {item.original_category}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-emerald-500" />
                                            <span className={`text-sm font-black ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                                {item.corrected_category}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-center">
                                            {item.media_url ? (
                                                <div className={`w-14 h-14 rounded-2xl overflow-hidden border p-1 group-hover:scale-105 transition-transform duration-300 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                                                    {item.media_url.startsWith('blob:') ? (
                                                        <div className="w-full h-full flex items-center justify-center bg-violet-500/10 text-violet-500">
                                                            <Activity size={20} />
                                                        </div>
                                                    ) : (
                                                        <img
                                                            src={`${import.meta.env.VITE_MINIO_ENDPOINT}/civic-connect/${item.media_url}`}
                                                            alt="Evidence"
                                                            className="w-full h-full object-cover rounded-xl"
                                                            onError={(e) => { e.target.parentElement.style.display = 'none' }}
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-dashed ${darkMode ? 'border-white/10 text-slate-600' : 'border-gray-300 text-gray-400'}`}>
                                                    <BrainCircuit size={18} />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${darkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                            <CheckCircle className="w-3.5 h-3.5" /> Synchronized
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {queue.length === 0 && (
                    <div className="p-24 text-center">
                        <div className="w-20 h-20 bg-violet-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12 transition-transform hover:rotate-0 duration-500">
                            <BrainCircuit className="w-10 h-10 text-violet-500" />
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Neural Equilibrium Reached</h3>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto">
                            No misclassifications have been flagged by the administrative cluster. Autonomous systems are performing within optimal parameters.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIRetraining;

