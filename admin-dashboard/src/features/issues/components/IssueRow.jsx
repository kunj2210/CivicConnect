import React, { useState } from 'react';
import { ChevronDown, Eye, CheckCircle, Trash2, Zap, Clock } from 'lucide-react';

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

const getStatusColor = (status) => {
    switch (status) {
        case 'Resolved': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        case 'Critical': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
};

const IssueRow = ({
    issue,
    isSelected,
    onToggleSelection,
    onUpdateStatus,
    onNavigateDetails,
    onDelete,
    darkMode
}) => {
    return (
        <tr className={`transition-colors group ${isSelected ? (darkMode ? 'bg-blue-600/10' : 'bg-blue-50') : (darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50')}`}>
            <td className="px-6 py-4">
                <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={isSelected}
                    onChange={onToggleSelection}
                />
            </td>
            <td className={`px-6 py-4 text-sm font-medium transition-colors ${darkMode ? 'text-gray-300 group-hover:text-blue-400' : 'text-gray-900 group-hover:text-blue-600'}`}>
                {issue.id.slice(0, 8)}...
            </td>
            <td className="px-6 py-4">
                <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {issue.fusion_final_category === 'processing' ? 'Processing...' : issue.title}
                </p>
                <p className={`text-xs truncate max-w-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{issue.description}</p>
            </td>
            <td className="px-6 py-4">
                {issue.fusion_final_category === 'processing' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
                        <Zap className="w-3.5 h-3.5 animate-bounce" /> AI Classifying
                    </span>
                ) : (
                    <span className={`inline-block whitespace-nowrap text-sm font-medium px-3 py-1 rounded-full border ${darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {issue.category}
                    </span>
                )}
            </td>
            <td className="px-6 py-4">
                <StatusDropdown
                    currentStatus={issue.status}
                    onUpdate={onUpdateStatus}
                    darkMode={darkMode}
                    getStatusColor={getStatusColor}
                />
            </td>
            <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{issue.date}</td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onNavigateDetails}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-800"
                        title="View Details"
                    >
                        <Eye size={16} />
                    </button>
                    {issue.status !== 'Resolved' && (
                        <button
                            onClick={() => onUpdateStatus('Resolved')}
                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-gray-800"
                            title="Mark Resolved"
                        >
                            <CheckCircle size={16} />
                        </button>
                    )}
                    <button
                        onClick={onDelete}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-gray-800"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default IssueRow;
export { getStatusColor };
