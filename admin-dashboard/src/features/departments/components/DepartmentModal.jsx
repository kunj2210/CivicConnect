import React from 'react';
import { AVAILABLE_CATEGORIES } from '../constants/departmentCategories';

const DepartmentModal = ({
    editingId,
    newDept,
    setNewDept,
    onClose,
    onSubmit,
    darkMode
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl ${darkMode ? 'bg-gray-800 border border-white/10' : 'bg-white'}`}>
                <h2 className={`text-2xl font-black mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {editingId ? 'Edit Department' : 'New Department'}
                </h2>
                <form onSubmit={onSubmit} className="space-y-5">
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
                            onClick={onClose}
                            className={`flex-1 py-4 rounded-2xl font-bold transition-all ${darkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
                        >
                            {editingId ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DepartmentModal;
