import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const DepartmentTable = ({ depts, onEdit, onDelete, darkMode }) => {
    return (
        <div className={`rounded-3xl shadow-2xl overflow-hidden border-none ${darkMode ? 'bg-gray-800/30 backdrop-blur-2xl' : 'bg-white shadow-gray-200/60'}`}>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className={`${darkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-50/80 text-gray-500'}`}>
                        <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em]">Department Name</th>
                        <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em]">Dept Head</th>
                        <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em]">Staff Count</th>
                        <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em]">Handled Categories</th>
                        <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em]">Status</th>
                        <th className="px-8 py-6 text-xs font-black uppercase tracking-[0.2em] text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
                    {depts.map((dept) => (
                        <tr key={dept.id} className="hover:bg-blue-500/5 transition-all duration-300 group">
                            <td className="px-8 py-6 flex items-center">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mr-4 shadow-lg shadow-blue-500/20 font-black text-lg">
                                    {dept.name ? dept.name[0] : 'D'}
                                </div>
                                <span className={`font-bold text-lg ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{dept.name}</span>
                            </td>
                            <td className={`px-8 py-6 text-base font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{dept.head}</td>
                            <td className={`px-8 py-6 text-base font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{dept.staff_count}</td>
                            <td className="px-8 py-6">
                                <div className="flex flex-wrap gap-2">
                                    {(dept.handled_categories && dept.handled_categories.length > 0) ? dept.handled_categories.map(cat => (
                                        <span key={cat} className={`whitespace-nowrap px-3 py-1 text-xs font-bold rounded-full ${darkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                            {cat}
                                        </span>
                                    )) : <span className="text-gray-400 text-sm italic">None</span>}
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <span className={`px-4 py-1.5 text-xs font-black rounded-xl uppercase tracking-wider ${dept.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                    {dept.status}
                                </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onEdit(dept.id)}
                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(dept.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {depts.length === 0 && (
                <div className="p-10 text-center text-gray-400 font-medium">
                    No departments found. Click "Add Department" to get started.
                </div>
            )}
        </div>
    );
};

export default DepartmentTable;
