import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Building2, Users, CheckCircle2, MoreVertical, Plus } from 'lucide-react';

const Departments = () => {
    const { darkMode } = useOutletContext();

    const depts = [
        { id: 1, name: 'Waste Management', head: 'Rajesh Kumar', staff: 124, status: 'Active' },
        { id: 2, name: 'Roads & Infrastructure', head: 'Sushila Devi', staff: 85, status: 'Active' },
        { id: 3, name: 'Street Lighting', head: 'Amit Shah', staff: 42, status: 'Active' },
        { id: 4, name: 'Water & Sewage', head: 'Priya Singh', staff: 67, status: 'Active' },
        { id: 5, name: 'Horticulture', head: 'Manoj Tyagi', staff: 31, status: 'Maintenance' },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Departments</h1>
                    <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage municipal departments and staff.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all font-medium">
                    <Plus size={18} />
                    Add Department
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Total Depts', value: '12', icon: Building2, color: 'blue' },
                    { title: 'Active Staff', value: '452', icon: Users, color: 'green' },
                    { title: 'Operational', value: '98%', icon: CheckCircle2, color: 'purple' },
                ].map((stat, i) => (
                    <div key={i} className={`p-6 rounded-2xl shadow-sm border transition-all ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-white/20'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={`rounded-2xl shadow-lg border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-white/20'}`}>
                <table className="w-full text-left">
                    <thead className={`border-b ${darkMode ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50/50 border-gray-100'}`}>
                        <tr>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-500">Department Name</th>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-500">Dept Head</th>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-500">Staff Count</th>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-right text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                        {depts.map((dept) => (
                            <tr key={dept.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="px-6 py-4 flex items-center">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center mr-3 font-bold">
                                        {dept.name[0]}
                                    </div>
                                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{dept.name}</span>
                                </td>
                                <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{dept.head}</td>
                                <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{dept.staff}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${dept.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                        }`}>
                                        {dept.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                        <MoreVertical size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Departments;
