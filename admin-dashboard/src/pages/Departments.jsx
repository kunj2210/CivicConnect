import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Building2, Users, CheckCircle2, Plus, Loader2 } from 'lucide-react';
import { useDepartments } from '../features/departments/hooks/useDepartments';
import DepartmentCard from '../features/departments/components/DepartmentCard';
import DepartmentModal from '../features/departments/components/DepartmentModal';
import DepartmentTable from '../features/departments/components/DepartmentTable';

const Departments = () => {
    const { darkMode } = useOutletContext();
    const {
        depts,
        loading,
        error,
        showModal,
        setShowModal,
        newDept,
        setNewDept,
        editingId,
        handleEditClick,
        handleCreateOrUpdate,
        handleDelete,
        handleOpenCreateModal
    } = useDepartments();

    if (loading && depts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-gray-500 font-medium tracking-wide">Initializing Department Data...</p>
            </div>
        );
    }

    const stats = [
        { title: 'Total Depts', value: depts.length, icon: Building2, color: 'blue' },
        { title: 'Active Staff', value: depts.reduce((acc, curr) => acc + (parseInt(curr.staff_count) || 0), 0), icon: Users, color: 'green' },
        { title: 'Operational', value: '98%', icon: CheckCircle2, color: 'purple' },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className={`text-4xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Departments</h1>
                    <p className={`mt-2 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage municipal departments and operational staff.</p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 font-bold"
                >
                    <Plus size={20} />
                    Add Department
                </button>
            </div>

            {showModal && (
                <DepartmentModal
                    editingId={editingId}
                    newDept={newDept}
                    setNewDept={setNewDept}
                    onClose={() => {
                        setShowModal(false);
                    }}
                    onSubmit={handleCreateOrUpdate}
                    darkMode={darkMode}
                />
            )}

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-medium">
                    Error: {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stats.map((stat, i) => (
                    <DepartmentCard
                        key={i}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                        darkMode={darkMode}
                    />
                ))}
            </div>

            <DepartmentTable
                depts={depts}
                onEdit={handleEditClick}
                onDelete={handleDelete}
                darkMode={darkMode}
            />
        </div>
    );
};

export default Departments;
