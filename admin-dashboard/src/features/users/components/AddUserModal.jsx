import React from 'react';
import { X, Plus } from 'lucide-react';
import { ROLE_MAP } from '../constants/userRoles';

const AddUserModal = ({
    show,
    onClose,
    formData,
    setFormData,
    onSubmit,
    departments,
    wards,
    ulbs,
    isSuperAdmin,
    darkMode
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-xl p-8 rounded-3xl shadow-2xl relative ${darkMode ? 'bg-gray-900 border border-white/10 text-white' : 'bg-white text-gray-900'}`}>
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-lg hover:bg-gray-500/10 transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                    <Plus className="text-blue-500" />
                    Register Municipal User
                </h2>

                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-500 mb-2">Full Name</label>
                            <input
                                type="text"
                                placeholder="e.g. John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-500 mb-2">Email Address</label>
                            <input
                                type="email"
                                placeholder="e.g. john@civicconnect.gov"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-500 mb-2">Phone</label>
                            <input
                                type="text"
                                placeholder="e.g. +919999999999"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-500 mb-2">Official Designation</label>
                            <input
                                type="text"
                                placeholder="e.g. Sanitary Inspector"
                                value={formData.designation}
                                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                                className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase text-gray-500 mb-2">Account Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                            className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}
                            required
                        >
                            {ROLE_MAP.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-500 mb-2">Department Assignment</label>
                            <select
                                value={formData.department_id}
                                onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                                className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}
                            >
                                <option value="">-- None --</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-500 mb-2">Ward Assignment</label>
                            <select
                                value={formData.ward_id}
                                onChange={(e) => setFormData({...formData, ward_id: e.target.value})}
                                className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}
                            >
                                <option value="">-- None --</option>
                                {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {isSuperAdmin && (
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-500 mb-2">City / ULB Scope</label>
                            <select
                                value={formData.ulb_id}
                                onChange={(e) => setFormData({...formData, ulb_id: e.target.value})}
                                className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}
                            >
                                <option value="">-- None (Global / State Scope) --</option>
                                {ulbs.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black shadow-xl shadow-blue-500/20 transition-all text-sm"
                    >
                        Register Account
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;
