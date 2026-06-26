import React from 'react';
import IssueRow from './IssueRow';

const IssueTable = ({
    issues,
    selectedIds,
    onSelectAll,
    onToggleSelection,
    onUpdateStatus,
    onNavigateDetails,
    onDelete,
    darkMode
}) => {
    return (
        <div className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left min-w-[800px]">
                    <thead className={`border-b ${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                        <tr>
                            <th className="px-6 py-5">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                    checked={selectedIds.length === issues.length && issues.length > 0}
                                />
                            </th>
                            <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ID</th>
                            <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Issue Details</th>
                            <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Category</th>
                            <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</th>
                            <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Date</th>
                            <th className={`px-6 py-5 font-bold uppercase text-xs tracking-wider text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                        {issues.map((issue) => (
                            <IssueRow
                                key={issue.id}
                                issue={issue}
                                isSelected={selectedIds.includes(issue.id)}
                                onToggleSelection={() => onToggleSelection(issue.id)}
                                onUpdateStatus={(newStatus) => onUpdateStatus(issue.id, newStatus)}
                                onNavigateDetails={() => onNavigateDetails(issue.id)}
                                onDelete={() => onDelete(issue.id)}
                                darkMode={darkMode}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IssueTable;
