import { useState, useEffect } from 'react';
import { usersApi } from '../../../services/usersApi';
import { departmentsApi } from '../../../services/departmentsApi';
import { systemApi } from '../../../services/systemApi';

export const useAdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [wards, setWards] = useState([]);
    const [ulbs, setUlbs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editingUserId, setEditingUserId] = useState(null);
    const [editData, setEditData] = useState({});

    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        designation: '',
        role: 'citizen',
        department_id: '',
        ward_id: '',
        ulb_id: ''
    });

    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, deptData, wardsData, ulbsData] = await Promise.all([
                usersApi.getAll(),
                departmentsApi.getAll(),
                systemApi.getWards().catch(() => []),
                systemApi.getUlbs().catch(() => [])
            ]);
            setUsers(usersData);
            setDepartments(deptData);
            setWards(wardsData);
            setUlbs(ulbsData);
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
            ward_id: user.ward_id || '',
            ulb_id: user.ulb_id || ''
        });
    };

    const handleSave = async (userId) => {
        try {
            await usersApi.update(userId, {
                role: editData.role,
                department_id: editData.department_id || null,
                ward_id: editData.ward_id || null,
                ulb_id: editData.ulb_id || null
            });
            setEditingUserId(null);
            fetchData();
        } catch (error) {
            alert('Update failed: ' + error.message);
        }
    };

    const handleAddUserSubmit = async (e) => {
        e.preventDefault();
        try {
            const body = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                phone: formData.phone || null,
                designation: formData.designation || null,
                department_id: formData.department_id || null,
                ward_id: formData.ward_id || null,
                ulb_id: formData.ulb_id || null
            };

            const res = await usersApi.create(body);
            alert(`User registered successfully!\nProvisional Credentials:\nEmail: ${formData.email}\nTemp Password: ${res.temp_password_cleartext}`);
            setShowAddModal(false);
            setFormData({
                name: '',
                email: '',
                phone: '',
                designation: '',
                role: 'citizen',
                department_id: '',
                ward_id: '',
                ulb_id: ''
            });
            fetchData();
        } catch (error) {
            alert('Failed to create user: ' + error.message);
        }
    };

    const handleResetPassword = async (userId, userEmail) => {
        if (!window.confirm(`Are you sure you want to regenerate a temporary password for ${userEmail}?`)) return;
        try {
            const res = await usersApi.resetPassword(userId);
            alert(`Password regenerated successfully!\nNew Password: ${res.temp_password_cleartext}`);
            fetchData();
        } catch (error) {
            alert('Password reset failed: ' + error.message);
        }
    };

    const handleCopy = (id, text) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return {
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
        fetchData,
        handleEditClick,
        handleSave,
        handleAddUserSubmit,
        handleResetPassword,
        handleCopy
    };
};
