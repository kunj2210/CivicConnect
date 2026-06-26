import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAdminUsers } from '../features/users/hooks/useAdminUsers';
import AddUserModal from '../features/users/components/AddUserModal';
import UserRow from '../features/users/components/UserRow';

const AdminUsers = () => {
    const { darkMode } = useOutletContext();
    const { user: currentUser } = useAuth();
    
    const {
        users,
        departments,
        wards,
        ulbs,
        loading,
        editingUserId,
        setEditingUserId,
        editData,
        setEditData,
        showAddModal,
        setShowAddModal,
        formData,
        setFormData,
        copiedId,
        handleEditClick,
        handleSave,
        handleAddUserSubmit,
        handleResetPassword,
        handleCopy
    } = useAdminUsers();

    if (loading && users.length === 0) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-gray-500 font-medium">Loading Identity Matrix...</p>
        </div>
    );

    const isSuperAdmin = currentUser?.role?.toLowerCase() === 'super_admin';

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className={`text-4xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>User Management</h1>
                    <p className={`mt-2 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Assign roles, departments, and administrative privileges globally.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black shadow-lg shadow-blue-500/20 transition-all text-sm"
                >
                    <Plus size={16} />
                    Add New User
                </button>
            </div>

            <div className={`rounded-3xl shadow-2xl overflow-hidden border-none ${darkMode ? 'bg-gray-800/30 backdrop-blur-2xl' : 'bg-white shadow-gray-200/60'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`${darkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-50/80 text-gray-500'}`}>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em]">Identity / Phone</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em]">Role</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em]">Department</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em]">Ward / City</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em]">Temp Credentials</th>
                                <th className="px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
                            {users.map((u) => (
                                <UserRow
                                    key={u.id}
                                    u={u}
                                    isEditing={editingUserId === u.id}
                                    editData={editData}
                                    setEditData={setEditData}
                                    onSave={handleSave}
                                    onCancelEdit={() => setEditingUserId(null)}
                                    onEditClick={handleEditClick}
                                    onResetPassword={handleResetPassword}
                                    onCopy={handleCopy}
                                    copiedId={copiedId}
                                    departments={departments}
                                    wards={wards}
                                    ulbs={ulbs}
                                    isSuperAdmin={isSuperAdmin}
                                    darkMode={darkMode}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddUserModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleAddUserSubmit}
                departments={departments}
                wards={wards}
                ulbs={ulbs}
                isSuperAdmin={isSuperAdmin}
                darkMode={darkMode}
            />
        </div>
    );
};

export default AdminUsers;
