import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Building2, Users, CheckCircle2, MoreVertical, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';

const Departments = () => {
    const { darkMode } = useOutletContext();
    const [depts, setDepts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newDept, setNewDept] = useState({ name: '', head: '', staff_count: 0, status: 'Active', handled_categories: [] });

    // Based on mobile app hardcoded categories
    const AVAILABLE_CATEGORIES = [
        'Waste Management',
        'Road/Potholes',
        'Street Light',
        'Water Leakage',
        'Other'
    ];

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/departments');
            if (!response.ok) throw new Error('Failed to fetch departments');
            const data = await response.json();
            setDepts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/departments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDept),
            });
            if (response.ok) {
                setShowModal(false);
                setNewDept({ name: '', head: '', staff_count: 0, status: 'Active', handled_categories: [] });
                fetchDepartments();
            }
        } catch (err) {
            alert('Create failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this department?')) return;
        try {
            const response = await fetch(`http://localhost:5000/api/departments/${id}`, { method: 'DELETE' });
            if (response.ok) fetchDepartments();
        } catch (err) {
            alert('Delete failed');
        }
    };

    if (loading && depts.length === 0) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-gray-500 font-medium tracking-wide">Initializing Department Data...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className={`text-4xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Departments</h1>
                    <p className={`mt-2 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage municipal departments and operational staff.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 font-bold"
                >
                    <Plus size={20} />
                    Add Department
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl ${darkMode ? 'bg-gray-800 border border-white/10' : 'bg-white'}`}>
                        <h2 className={`text-2xl font-black mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>New Department</h2>
                        <form onSubmit={handleCreate} className="space-y-5">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Department Name</label>
                                <input
                                    type="text"
                                    required
                                    className={`w-full p-4 rounded-2xl border-none ring-2 ring-gray-100 dark:ring-white/5 outline-none focus:ring-4 focus:ring-blue-500/50 transition-all ${darkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-50 text-gray-900'}`}
                                    value={newDept.name}
                                    onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                                    placeholder="e.g. Waste Management"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Department Head</label>
                                <input
                                    type="text"
                                    required
                                    className={`w-full p-4 rounded-2xl border-none ring-2 ring-gray-100 dark:ring-white/5 outline-none focus:ring-4 focus:ring-blue-500/50 transition-all ${darkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-50 text-gray-900'}`}
                                    value={newDept.head}
                                    onChange={(e) => setNewDept({ ...newDept, head: e.target.value })}
                                    placeholder="e.g. Rajesh Kumar"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Initial Staff Count</label>
                                <input
                                    type="number"
                                    className={`w-full p-4 rounded-2xl border-none ring-2 ring-gray-100 dark:ring-white/5 outline-none focus:ring-4 focus:ring-blue-500/50 transition-all ${darkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-50 text-gray-900'}`}
                                    value={newDept.staff_count}
                                    onChange={(e) => setNewDept({ ...newDept, staff_count: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Handled Issue Categories</label>
                                <div className={`p-4 rounded-2xl ring-2 ring-gray-100 dark:ring-white/5 space-y-3 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    {AVAILABLE_CATEGORIES.map(cat => (
                                        <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded hover:ring-2 hover:ring-blue-500/50 transition-all cursor-pointer accent-blue-600"
                                                checked={newDept.handled_categories.includes(cat)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setNewDept({ ...newDept, handled_categories: [...newDept.handled_categories, cat] });
                                                    } else {
                                                        setNewDept({ ...newDept, handled_categories: newDept.handled_categories.filter(c => c !== cat) });
                                                    }
                                                }}
                                            />
                                            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className={`flex-1 py-4 rounded-2xl font-bold transition-all ${darkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-medium">
                    Error: {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { title: 'Total Depts', value: depts.length, icon: Building2, color: 'blue' },
                    { title: 'Active Staff', value: depts.reduce((acc, curr) => acc + curr.staff_count, 0), icon: Users, color: 'green' },
                    { title: 'Operational', value: '98%', icon: CheckCircle2, color: 'purple' },
                ].map((stat, i) => (
                    <div key={i} className={`p-8 rounded-3xl shadow-xl border-none transition-all hover:translate-y-[-4px] ${darkMode ? 'bg-gray-800/50 backdrop-blur-xl border-white/5' : 'bg-white shadow-gray-200/50'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-widest text-gray-500">{stat.title}</p>
                                <p className={`text-4xl font-black mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                            </div>
                            <div className={`p-5 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500`}>
                                <stat.icon size={32} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

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
                                        {dept.name[0]}
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
                                        <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all">
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept.id)}
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
        </div>
    );
};

export default Departments;
