import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Filter, Search, Eye, Trash2, Download, CheckCircle, ChevronDown } from 'lucide-react';

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

const AdminIssueList = () => {
    const { darkMode } = useOutletContext();
    const navigate = useNavigate();
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/reports')
            .then(res => res.json())
            .then(data => {
                setIssues(data.map(i => ({
                    id: i.report_id,
                    title: i.category,
                    description: i.location && i.location.coordinates
                        ? `Reported at ${i.location.coordinates[1]}, ${i.location.coordinates[0]}`
                        : 'Location unavailable',
                    category: i.category,
                    status: (i.status === 'Submitted' || !i.status) ? 'Pending' : i.status,
                    date: i.timestamp ? new Date(i.timestamp).toLocaleDateString() : 'Unknown'
                })));
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching admin issues:', err);
                setLoading(false);
            });
    }, []);

    const filteredIssues = issues.filter(issue => {
        const matchesStatus = filterStatus === 'All' || issue.status === filterStatus;
        const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.category.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
            case 'Critical': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
        }
    };

    const handleExport = () => {
        const headers = ["ID", "Title", "Category", "Status", "Date", "Description"];
        const rows = filteredIssues.map(issue => [
            issue.id,
            `"${issue.title}"`,
            issue.category,
            issue.status,
            issue.date,
            `"${issue.description}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "admin_issues_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5000/api/reports/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (response.ok) {
                setIssues(issues.map(issue =>
                    issue.id === id ? { ...issue, status: newStatus } : issue
                ));
            }
        } catch (err) {
            alert('Update failed: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;
        try {
            const response = await fetch(`http://localhost:5000/api/reports/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setIssues(issues.filter(issue => issue.id !== id));
            }
        } catch (err) {
            alert('Delete failed: ' + err.message);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Admin Issue Control</h1>
                    <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Global oversight of municipal complaints.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all font-bold text-sm ${darkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'}`}
                    >
                        <Download size={16} />
                        Export Data
                    </button>

                    <div className={`flex gap-4 w-full md:w-auto p-1.5 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search all issues..."
                                className={`w-full pl-10 pr-4 py-2 text-sm border-none rounded-md focus:ring-1 focus:ring-gray-400 transition-all outline-none ${darkMode ? 'bg-gray-900 text-white placeholder-gray-500' : 'bg-white text-gray-900'}`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <select
                                className={`pl-4 pr-10 py-2 text-sm border-none rounded-md appearance-none focus:ring-1 focus:ring-gray-400 outline-none cursor-pointer font-bold ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800'}`}
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="overflow-x-visible">
                    <table className="w-full text-left">
                        <thead className={`border-b ${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                            <tr>
                                <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ID</th>
                                <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Issue Details</th>
                                <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Category</th>
                                <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                                <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date</th>
                                <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                            {filteredIssues.map((issue) => (
                                <tr key={issue.id} className={`transition-colors group ${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`}>
                                    <td className={`px-6 py-4 text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 group-hover:text-blue-400' : 'text-gray-900 group-hover:text-blue-600'}`}>{issue.id}</td>
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
                                    <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{issue.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => navigate(`/admin/issues/${issue.id}`)}
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
                                            <button
                                                onClick={() => handleDelete(issue.id)}
                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-gray-800"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
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

export default AdminIssueList;
