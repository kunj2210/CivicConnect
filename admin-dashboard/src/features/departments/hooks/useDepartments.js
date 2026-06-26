import { useState, useEffect } from 'react';
import { departmentsApi } from '../../../services/departmentsApi';

export const useDepartments = () => {
    const [depts, setDepts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newDept, setNewDept] = useState({
        name: '',
        head: '',
        staff_count: 0,
        status: 'Active',
        handled_categories: []
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const data = await departmentsApi.getAll();
            setDepts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = async (id) => {
        try {
            setLoading(true);
            const dept = await departmentsApi.getById(id);
            setNewDept({
                name: dept.name || '',
                head: dept.head || '',
                staff_count: dept.staff_count || 0,
                status: dept.status || 'Active',
                handled_categories: dept.handled_categories || []
            });
            setEditingId(id);
            setShowModal(true);
        } catch (error) {
            alert('Failed to load department details: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        try {
            if (editingId) {
                await departmentsApi.update(editingId, newDept);
            } else {
                await departmentsApi.create(newDept);
            }
            setShowModal(false);
            setEditingId(null);
            setNewDept({ name: '', head: '', staff_count: 0, status: 'Active', handled_categories: [] });
            fetchDepartments();
        } catch (err) {
            alert('Save failed: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this department?')) return;
        try {
            await departmentsApi.delete(id);
            fetchDepartments();
        } catch (err) {
            alert('Delete failed: ' + err.message);
        }
    };

    const handleOpenCreateModal = () => {
        setEditingId(null);
        setNewDept({ name: '', head: '', staff_count: 0, status: 'Active', handled_categories: [] });
        setShowModal(true);
    };

    return {
        depts,
        loading,
        error,
        showModal,
        setShowModal,
        newDept,
        setNewDept,
        editingId,
        setEditingId,
        fetchDepartments,
        handleEditClick,
        handleCreateOrUpdate,
        handleDelete,
        handleOpenCreateModal
    };
};
