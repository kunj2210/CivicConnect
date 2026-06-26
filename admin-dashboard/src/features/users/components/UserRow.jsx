import React from 'react';
import { Users, Shield, Edit2, Save, RefreshCw, Check, Copy } from 'lucide-react';
import { ROLE_MAP } from '../constants/userRoles';

const UserRow = ({
    u,
    isEditing,
    editData,
    setEditData,
    onSave,
    onCancelEdit,
    onEditClick,
    onResetPassword,
    onCopy,
    copiedId,
    departments,
    wards,
    ulbs,
    isSuperAdmin,
    darkMode
}) => {
    return (
        <tr className="hover:bg-blue-500/5 transition-all duration-300 group">
            <td className="px-6 py-4 flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center mr-4 shadow-lg shadow-blue-500/20 font-bold">
                    <Users size={16} />
                </div>
                <div>
                    <p className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{u.full_name || u.designation || 'Unregistered'}</p>
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
                        u.role === 'authority' || u.role === 'mayor' ? 'bg-blue-500/10 text-blue-500' : 
                        u.role === 'staff' || u.role === 'field_officer' || u.role === 'councilor' ? 'bg-emerald-500/10 text-emerald-500' :
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
                    <div className="space-y-2">
                        <select
                            value={editData.ward_id}
                            onChange={(e) => setEditData({...editData, ward_id: e.target.value})}
                            className={`p-2 rounded-lg border text-sm w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                            <option value="">-- No Ward --</option>
                            {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                        {isSuperAdmin && (
                            <select
                                value={editData.ulb_id}
                                onChange={(e) => setEditData({...editData, ulb_id: e.target.value})}
                                className={`p-2 rounded-lg border text-sm w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            >
                                <option value="">-- No City --</option>
                                {ulbs.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col text-xs gap-1">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {u.ward ? `Ward: ${u.ward.name}` : <span className="text-gray-500 italic">No Ward</span>}
                        </span>
                        {u.ulb_id && (
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                City ID: {u.ulb_id}
                            </span>
                        )}
                    </div>
                )}
            </td>

            <td className="px-6 py-4">
                {u.temp_password_cleartext ? (
                    <div className="flex items-center gap-2">
                        <code className={`px-2.5 py-1.5 rounded-lg text-xs font-mono select-all ${darkMode ? 'bg-gray-900 text-amber-400' : 'bg-amber-50 text-amber-800'}`}>
                            {u.temp_password_cleartext}
                        </code>
                        <button
                            onClick={() => onCopy(u.id, u.temp_password_cleartext)}
                            className={`p-1.5 rounded hover:bg-gray-500/10 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                            title="Copy password"
                        >
                            {copiedId === u.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                    </div>
                ) : (
                    <span className="text-gray-500 text-xs italic">Modified by User</span>
                )}
            </td>

            <td className="px-6 py-4 text-right">
                {isEditing ? (
                    <div className="flex justify-end gap-2">
                        <button onClick={onCancelEdit} className="px-3 py-1.5 text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-all dark:bg-gray-700 dark:text-gray-200">Cancel</button>
                        <button onClick={() => onSave(u.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"><Save size={14}/> Save</button>
                    </div>
                ) : (
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onResetPassword(u.id, u.email)}
                            className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                            title="Regenerate Credentials"
                        >
                            <RefreshCw size={16} />
                        </button>
                        <button
                            onClick={() => onEditClick(u)}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                            title="Edit User jurisdiction"
                        >
                            <Edit2 size={16} />
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
};

export default UserRow;
