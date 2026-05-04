import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Zap, Map as MapIcon, Search, Filter, Eye, CheckCircle, ChevronDown } from 'lucide-react';



const StatusDropdown = ({ currentStatus, onUpdate, darkMode, getStatusColor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const statuses = ['Pending', 'In Progress', 'Resolved'];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-full border transition-all whitespace-nowrap ${getStatusColor(currentStatus)}`}
            >
                {currentStatus}
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className={`absolute left-0 mt-2 w-48 rounded-xl shadow-2xl border z-[100] py-1 overflow-hidden animate-in fade-in zoom-in duration-200 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        {statuses.map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    onUpdate(status);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${currentStatus === status
                                    ? (darkMode ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-50 text-blue-600')
                                    : (darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const AuthorityIssueList = () => {
    const { darkMode } = useOutletContext();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const params = {
            ward_id: user?.ward_id,
            department_id: user?.department_id
        };

        api.get('/reports', { params })
            .then(data => {
                setIssues(data.map(i => ({
                    id: i.id,
                    title: i.category,
                    description: i.location && i.location.coordinates
                        ? `Reported at ${i.location.coordinates[1]}, ${i.location.coordinates[0]}`
                        : 'Location unavailable',
                    category: i.category,
                    status: i.status,
                    date: (i.createdAt || i.timestamp || i.reported_at) ? new Date(i.createdAt || i.timestamp || i.reported_at).toLocaleDateString() : 'Unknown'
                })));
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching authority issues:', err);
                setLoading(false);
            });
    }, [user?.id, user?.ward_id]);


    const filteredIssues = issues.filter(issue => {
        const matchesStatus = filterStatus === 'All' || issue.status === filterStatus;
        const matchesCategory = filterCategory === 'All' || issue.category === filterCategory;
        const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.category.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesCategory && matchesSearch;
    });

    const categories = ['All', ...new Set(issues.map(i => i.category))];


    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
            case 'Critical': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.patch(`/reports/${id}`, { status: newStatus });
            setIssues(issues.map(issue =>
                issue.id === id ? { ...issue, status: newStatus } : issue
            ));
        } catch (err) {
            alert('Update failed: ' + err.message);
        }
    };

    const [selectedIds, setSelectedIds] = useState([]);

    const toggleSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBulkAction = async (newStatus) => {
        try {
            const res = await api.patch('/reports/bulk-update', {
                ids: selectedIds,
                status: newStatus
            });
            alert(res.message);
            setIssues(issues.map(i =>
                selectedIds.includes(i.id) ? { ...i, status: newStatus } : i
            ));
            setSelectedIds([]);
        } catch (err) {
            alert('Bulk action failed: ' + err.message);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up relative">
            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-3xl shadow-2xl border flex items-center gap-6 animate-in slide-in-from-bottom-8 duration-500 ${darkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'}`}>
                    <div className="flex flex-col">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>Selected Assets</span>
                        <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedIds.length} Issues Identified</span>
                    </div>
                    <div className="h-8 w-px bg-slate-100 dark:bg-white/10 mx-2"></div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => handleBulkAction('Resolved')}
                            className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 transition-all flex items-center gap-2"
                        >
                            <CheckCircle size={14} /> Mark Resolved
                        </button>
                        <button 
                            onClick={() => handleBulkAction('In Progress')}
                            className="bg-amber-500 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2"
                        >
                            <RefreshCcw className="w-3.5 h-3.5" /> Set In-Progress
                        </button>
                        <button 
                            onClick={() => setSelectedIds([])}
                            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${darkMode ? 'text-slate-400 hover:bg-white/5' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Header content ... */}
            </div>

            <div className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="overflow-x-visible">
                    <table className="w-full text-left">
                        <thead className={`border-b ${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                            <tr>
                                <th className="px-6 py-5">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedIds(filteredIssues.map(i => i.id));
                                            else setSelectedIds([]);
                                        }}
                                        checked={selectedIds.length === filteredIssues.length && filteredIssues.length > 0}
                                    />
                                </th>
                                <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ID</th>
                                <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Issue</th>
                                <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Category</th>
                                <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                                <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                            {filteredIssues.map((issue) => (
                                <tr key={issue.id} className={`transition-colors group ${selectedIds.includes(issue.id) ? (darkMode ? 'bg-blue-600/10' : 'bg-blue-50') : (darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50')}`}>
                                    <td className="px-6 py-4">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedIds.includes(issue.id)}
                                            onChange={() => toggleSelection(issue.id)}
                                        />
                                    </td>
                                    <td className={`px-6 py-4 text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 group-hover:text-blue-400' : 'text-gray-900 group-hover:text-blue-600'}`}>{issue.id.slice(0, 8)}...</td>
                                    {/* ... rest of the row ... */}
                                    <td className="px-6 py-4">
                                        <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{issue.title}</p>
                                        <p className={`text-xs truncate max-w-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{issue.description}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-block whitespace-nowrap text-sm font-medium px-3 py-1 rounded-full border ${darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                            {issue.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusDropdown
                                            currentStatus={issue.status}
                                            onUpdate={(newStatus) => handleUpdateStatus(issue.id, newStatus)}
                                            darkMode={darkMode}
                                            getStatusColor={getStatusColor}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => navigate(`/authority/issues/${issue.id}`)}
                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-800"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {issue.status !== 'Resolved' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(issue.id, 'Resolved')}
                                                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-gray-800"
                                                    title="Mark Resolved"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                            )}
                                        </div>
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

export default AuthorityIssueList;
