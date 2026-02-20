import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
// import { mockStats, categoryData } from '../data/mockData';
import { TrendingUp, CheckCircle, Clock, AlertCircle, MoreHorizontal } from 'lucide-react';

const Dashboard = () => {
    const { darkMode } = useOutletContext();
    const navigate = useNavigate();
    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const [stats, setStats] = useState({ summary: [], categoryData: [] });
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('http://localhost:5000/api/reports/stats').then(res => res.json()),
            fetch('http://localhost:5000/api/reports').then(res => res.json())
        ])
            .then(([statsData, issuesData]) => {
                setStats(statsData);
                setIssues(issuesData);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching dashboard data:', err);
                setLoading(false);
            });
    }, []);

    const StatCard = ({ title, value, color, icon: Icon, trend }) => (
        <div className={`relative overflow-hidden p-6 rounded-2xl shadow-lg border transition-transform hover:-translate-y-1 hover:shadow-xl group backdrop-blur-xl ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity bg-${color}-500 rounded-bl-full w-24 h-24 -mr-4 -mt-4`} />
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className={`text-sm font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
                    <h3 className={`text-3xl font-extrabold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{value}</h3>
                </div>
                <div className={`p-3 rounded-xl shadow-inner ${darkMode ? `bg-${color}-900/30 text-${color}-400` : `bg-${color}-100 text-${color}-600`}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className="flex items-center text-xs font-medium text-gray-400">
                <span className={`flex items-center px-2 py-0.5 rounded-full mr-2 ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-500'}`}>
                    <TrendingUp className="w-3 h-3 mr-1" /> {trend}%
                </span>
                <span>vs last month</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard Overview</h1>
                    <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Welcome back, Admin. Here's what's happening in your city.</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-500/30 transition-all">
                    Download Report
                </button>
            </div>

            {/* Loading state */}
            {loading && <div className="p-8 text-center">Loading dashboard...</div>}

            {/* Stats Grid */}
            {!loading && stats.summary && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {stats.summary.map((stat, i) => (
                        <StatCard
                            key={i}
                            title={stat.title}
                            value={stat.value}
                            color={stat.color}
                            icon={stat.title === 'Resolved' ? CheckCircle : stat.title === 'Pending' ? AlertCircle : stat.title === 'In Progress' ? Clock : TrendingUp}
                            trend={stat.trend}
                        />
                    ))}
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Bar Chart */}
                <div className={`lg:col-span-2 p-6 backdrop-blur-xl rounded-2xl shadow-lg border ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Issues by Category</h2>
                        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal /></button>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.categoryData} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#374151' : '#E5E7EB'} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: darkMode ? '#374151' : '#F3F4F6' }}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                                        color: darkMode ? '#FFFFFF' : '#000000'
                                    }}
                                />
                                <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                                    {(stats.categoryData || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className={`p-6 backdrop-blur-xl rounded-2xl shadow-lg border ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
                    <h2 className={`mb-6 text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Resolution Status</h2>
                    <div className="h-64 flex justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.categoryData || []}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {(stats.categoryData || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                                        border: 'none'
                                    }}
                                />
                                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ color: '#9CA3AF' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                            <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stats.summary && stats.summary[0] ? stats.summary[0].value : 0}</span>
                            <p className="text-xs text-gray-500">Total</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className={`p-6 backdrop-blur-xl rounded-2xl shadow-lg border ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Recent Activity</h2>
                    <button
                        onClick={() => navigate('/dashboard/issues')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                        View All
                    </button>
                </div>
                <div className="space-y-4">
                    {issues.slice(0, 5).map((issue) => (
                        <div
                            key={issue.report_id}
                            onClick={() => navigate(`/dashboard/issues/${issue.report_id}`)}
                            className={`flex items-center justify-between p-4 rounded-xl transition-colors border cursor-pointer ${darkMode ? 'bg-gray-700/50 hover:bg-blue-900/20 border-transparent hover:border-blue-800' : 'bg-gray-50/50 hover:bg-blue-50/50 border-transparent hover:border-blue-100'}`}
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white mr-4 shadow-md shadow-blue-300/50">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <p className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>New Report: {issue.category}</p>
                                    <p className="text-sm text-gray-500 truncate max-w-xs">ID: {issue.report_id.slice(0, 8)}...</p>
                                </div>
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-md shadow-sm ${darkMode ? 'text-gray-300 bg-gray-600' : 'text-gray-400 bg-white'}`}>
                                {new Date(issue.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                    {issues.length === 0 && <p className="text-center text-gray-500 py-4">No recent activity found.</p>}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
