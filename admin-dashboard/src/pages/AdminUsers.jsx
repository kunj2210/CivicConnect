import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, Shield, Edit2, Loader2, Save } from 'lucide-react';
import { api } from '../utils/api';

const AdminUsers = () => {
    const { darkMode } = useOutletContext();
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editData, setEditData] = useState({});

    const ROLE_MAP = ['citizen', 'staff', 'authority', 'admin', 'super_admin'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, deptData] = await Promise.all([
                api.get('/users'),
                api.get('/departments')
            ]);
            setUsers(usersData);
            setDepartments(deptData);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            alert('Failed to load users: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user) => {
        setEditingUserId(user.id);
        setEditData({
            role: user.role || 'citizen',
            department_id: user.department_id || '',
            ward_id: user.ward_id || ''
        });
    };

    const handleSave = async (userId) => {
        try {
            await api.patch(`/users/${userId}`, {
                role: editData.role,
                department_id: editData.department_id ? parseInt(editData.department_id) : null,
                ward_id: editData.ward_id ? parseInt(editData.ward_id) : null,
            });
            setEditingUserId(null);
            fetchData();
        } catch (error) {
            alert('Update failed: ' + error.message);
        }
    };

    if (loading && users.length === 0) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-gray-500 font-medium">Loading Identity Matrix...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className={`text-4xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>User Management</h1>
                    <p className={`mt-2 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Assign roles, departments, and administrative privileges globally.</p>
                </div>
            </div>

            <div className={`rounded-3xl shadow-2xl overflow-hidden border-none ${darkMode ? 'bg-gray-800/30 backdrop-blur-2xl' : 'bg-white shadow-gray-200/60'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`${darkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-50/80 text-gray-500'}`}>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em]">Identity / Phone</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em]">Role</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em]">Department</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em]">Ward Config</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
                            {users.map((u) => {
                                const isEditing = editingUserId === u.id;
                                
                                return (
                                    <tr key={u.id} className="hover:bg-blue-500/5 transition-all duration-300 group">
                                        <td className="px-6 py-4 flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center mr-4 shadow-lg shadow-blue-500/20 font-bold">
                                                <Users size={16} />
                                            </div>
                                            <div>
                                                <p className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{u.full_name || 'Unregistered'}</p>
                                                <p className="text-xs text-gray-500">{u.phone || u.email || 'N/A'}</p>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            {isEditing ? (
                                                <select
                                                    value={editData.role}
                                                    onChange={(e) => setEditData({...editData, role: e.target.value})}
                                                    className={`p-2 rounded-lg border text-sm w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                                >
                                                    {ROLE_MAP.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                                                </select>
                                            ) : (
                                                <span className={`px-3 py-1 text-xs font-black rounded-full uppercase tracking-wider ${
                                                    u.role === 'super_admin' ? 'bg-purple-500/10 text-purple-500' : 
                                                    u.role === 'authority' ? 'bg-blue-500/10 text-blue-500' : 
                                                    u.role === 'staff' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    'bg-gray-500/10 text-gray-500'
                                                }`}>
                                                    {u.role === 'super_admin' && <Shield size={10} className="inline mr-1 mb-0.5" />}
                                                    {u.role || 'citizen'}
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            {isEditing ? (
                                                <select
                                                    value={editData.department_id}
                                                    onChange={(e) => setEditData({...editData, department_id: e.target.value})}
                                                    className={`p-2 rounded-lg border text-sm w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                                >
                                                    <option value="">-- None --</option>
                                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                </select>
                                            ) : (
                                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {u.department ? u.department.name : <span className="text-gray-500 text-xs italic">Unassigned</span>}
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={editData.ward_id}
                                                    onChange={(e) => setEditData({...editData, ward_id: e.target.value})}
                                                    placeholder="Ward ID"
                                                    className={`p-2 rounded-lg border text-sm w-24 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                                />
                                            ) : (
                                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {u.ward ? `Ward ${u.ward.name}` : u.ward_id ? `Ward ID: ${u.ward_id}` : <span className="text-gray-500 text-xs italic">Global</span>}
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            {isEditing ? (
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setEditingUserId(null)} className="px-3 py-1.5 text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-all dark:bg-gray-700 dark:text-gray-200">Cancel</button>
                                                    <button onClick={() => handleSave(u.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"><Save size={14}/> Save</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => handleEditClick(u)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                    <Edit2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
