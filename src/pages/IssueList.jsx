import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { mockIssues } from '../data/mockData';
import { Filter, Search, MoreVertical, Eye, Trash2, Edit, Download } from 'lucide-react';

const IssueList = () => {
    const { darkMode } = useOutletContext();
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredIssues = mockIssues.filter(issue => {
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
            case 'Submitted': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
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
        link.setAttribute("download", "civic_issues_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Issue Management</h1>
                    <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Track and resolve citizen complaints.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-500/20 transition-all font-medium text-sm"
                    >
                        <Download size={16} />
                        Export CSV
                    </button>

                    <div className={`flex gap-4 w-full md:w-auto p-2 rounded-xl shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search issues..."
                                className={`w-full pl-10 pr-4 py-2 border-none rounded-lg focus:ring-2 focus:ring-blue-500/50 transition-all outline-none ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-800'}`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <select
                                className={`pl-4 pr-10 py-2 border-none rounded-lg appearance-none focus:ring-2 focus:ring-blue-500/50 outline-none cursor-pointer font-medium ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-600'}`}
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="All">All Status</option>
                                <option value="Submitted">Submitted</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className={`backdrop-blur-xl rounded-2xl shadow-lg border overflow-hidden ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/20'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className={`border-b ${darkMode ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50/50 border-gray-100'}`}>
                            <tr>
                                <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ID</th>
                                <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Issue Details</th>
                                <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Category</th>
                                <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                                <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date</th>
                                <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                            {filteredIssues.map((issue) => (
                                <tr key={issue.id} className={`transition-colors group ${darkMode ? 'hover:bg-blue-900/20' : 'hover:bg-blue-50/50'}`}>
                                    <td className={`px-6 py-4 text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 group-hover:text-blue-400' : 'text-gray-900 group-hover:text-blue-600'}`}>{issue.id}</td>
                                    <td className="px-6 py-4">
                                        <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{issue.title}</p>
                                        <p className={`text-xs truncate max-w-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{issue.description}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-medium px-3 py-1 rounded-full border ${darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                            {issue.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(issue.status)}`}>
                                            {issue.status}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{issue.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors dark:text-blue-400 dark:hover:bg-blue-900/30" title="View Details">
                                                <Eye size={18} />
                                            </button>
                                            <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors dark:text-green-400 dark:hover:bg-green-900/30" title="Edit">
                                                <Edit size={18} />
                                            </button>
                                            <button className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors dark:text-red-400 dark:hover:bg-red-900/30" title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredIssues.length === 0 && (
                    <div className="p-12 text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                            <Search size={32} />
                        </div>
                        <h3 className={`text-lg font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>No issues found</h3>
                        <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Try adjusting your matching criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IssueList;
