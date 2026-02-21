import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { TrendingUp, CheckCircle, Clock, AlertCircle, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthorityDashboard = () => {
    const { darkMode } = useOutletContext();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const url = user?.departmentId
            ? `http://localhost:5000/api/reports?departmentId=${user.departmentId}`
            : 'http://localhost:5000/api/reports';

        fetch(url)
            .then(res => res.json())
            .then(data => {
                // For demo, we just show all issues or maybe filter by a mock department
                setIssues(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching authority data:', err);
                setLoading(false);
            });
    }, []);

    const stats = [
        { title: 'My Tasks', value: issues.length, color: 'blue', icon: Clock },
        { title: 'In Progress', value: issues.filter(i => i.status === 'In Progress').length, color: 'yellow', icon: TrendingUp },
        { title: 'Resolved', value: issues.filter(i => i.status === 'Resolved').length, color: 'green', icon: CheckCircle },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Authority Console</h1>
                    <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage and resolve issues assigned to your department.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {stats.map((stat, i) => (
                    <div key={i} className={`p-6 rounded-2xl border transition-all duration-200 ${darkMode ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className={`text-xs font-bold uppercase tracking-widest gap-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{stat.title}</p>
                                <h3 className={`text-4xl font-extrabold mt-2 tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${darkMode ? `bg-gray-800 text-${stat.color}-400` : `bg-gray-100 text-${stat.color}-600`}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Issues Table */}
            <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className={`p-6 border-b flex justify-between items-center ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                    <h2 className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Assigned Issues</h2>
                    <button
                        onClick={() => navigate('/authority/issues')}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        View List
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className={`border-b ${darkMode ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50/50 border-gray-100'}`}>
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Issue</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Timestamp</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right text-gray-500">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {issues.slice(0, 5).map((issue) => (
                                <tr key={issue.report_id} className={`transition-all duration-200 group ${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`}>
                                    <td className="px-6 py-4">
                                        <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{issue.category}</p>
                                        <p className="text-xs text-gray-500 truncate max-w-xs">{issue.report_id}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${issue.status === 'Resolved' ? 'bg-green-100 text-green-700 border-green-200' :
                                            issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                'bg-red-100 text-red-700 border-red-200'
                                            }`}>
                                            {issue.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(issue.timestamp).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/authority/issues/${issue.report_id}`)}
                                            className="text-gray-900 bg-gray-100 hover:bg-gray-200 dark:text-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            Take Action
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuthorityDashboard;
