import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Building2, Users, TrendingUp, ShieldAlert, Map, PieChart, Activity, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';

const CommissionerDashboard = () => {
    const { darkMode } = useOutletContext();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalIssues: 0, resolved: 0, efficiency: '0%', wardsActive: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGlobalStats();
    }, []);

    const fetchGlobalStats = async () => {
        try {
            setLoading(true);
            const data = await api.get('/reports/kpi');
            setStats({
                totalIssues: data.totalIssues || 0,
                resolved: data.resolvedCount || 0,
                efficiency: data.slaCompliance ? `${data.slaCompliance}%` : '85%',
                wardsActive: 24 // Placeholder for total wards
            });
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>City Command Center</h1>
                    <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Municipal Commissioner Persona: Global Policy & Action View</p>
                </div>
                <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${darkMode ? 'bg-gray-800 border-white/5 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                    <Activity size={20} />
                    <span className="font-bold text-sm tracking-widest uppercase">System Online</span>
                </div>
            </header>

            {/* Commissioner-Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'City-Wide Issues', value: stats.totalIssues, icon: ShieldAlert, color: 'red' },
                    { label: 'Overall Efficiency', value: stats.efficiency, icon: TrendingUp, color: 'blue' },
                    { label: 'Active Personnel', value: '42', icon: Users, color: 'purple' },
                    { label: 'Municipal Coverage', value: '100%', icon: Map, color: 'emerald' },
                ].map((s, i) => (
                    <div key={i} className={`p-8 rounded-3xl border transition-all hover:translate-y-[-4px] ${darkMode ? 'bg-gray-800/50 backdrop-blur-xl border-white/10' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-500">{s.label}</p>
                                <p className={`text-4xl font-extrabold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{s.value}</p>
                            </div>
                            <div className={`p-5 rounded-2xl bg-${s.color}-500/10 text-${s.color}-500`}>
                                <s.icon size={32} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Strategy & High-Level Views */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div 
                    onClick={() => navigate('/admin/map')}
                    className={`p-10 rounded-3xl border cursor-pointer group transition-all ${darkMode ? 'bg-gray-800/20 border-white/5 hover:bg-gray-800/40' : 'bg-white border-gray-100 hover:shadow-2xl'}`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>City-Wide Heatmap</h2>
                            <p className="text-gray-500 mt-2">Analyze problem clusters across all 24 wards.</p>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:translate-x-2 transition-all" size={32} />
                    </div>
                    <div className="mt-10 h-40 bg-gray-500/5 rounded-2xl flex items-center justify-center border border-dashed border-gray-500/20">
                        <Map className="text-gray-500/20" size={64} />
                    </div>
                </div>

                <div 
                    onClick={() => navigate('/admin/leaderboard')}
                    className={`p-10 rounded-3xl border cursor-pointer group transition-all ${darkMode ? 'bg-gray-800/20 border-white/5 hover:bg-gray-800/40' : 'bg-white border-gray-100 hover:shadow-2xl'}`}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Governance Leaderboard</h2>
                            <p className="text-gray-500 mt-2">Performance rankings of Departments and Staff.</p>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:translate-x-2 transition-all" size={32} />
                    </div>
                    <div className="mt-10 h-40 bg-gray-500/5 rounded-2xl flex items-center justify-center border border-dashed border-gray-500/20">
                        <TrendingUp className="text-gray-500/20" size={64} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommissionerDashboard;
