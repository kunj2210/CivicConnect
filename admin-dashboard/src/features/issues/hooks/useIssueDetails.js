import { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import { supabase } from '../../../config/supabase';

export const useIssueDetails = (id, onDeleted) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [remarks, setRemarks] = useState('');
    const [updatingDeps, setUpdatingDeps] = useState(false);
    const [updatingCategory, setUpdatingCategory] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);
    const [staffMembers, setStaffMembers] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [repairData, setRepairData] = useState(null);
    const [isSubmittingProof, setIsSubmittingProof] = useState(false);
    const [proofFile, setProofFile] = useState(null);
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchReport();
        fetchDepartments();
        fetchAuditLogs();
        fetchCurrentUser();
    }, [id]);

    useEffect(() => {
        if (report?.ward_id) {
            fetchStaff(report.ward_id, report.assigned_department_id);
        }
        if (report?.status === 'Pending Confirmation' || report?.status === 'Resolved') {
            fetchRepairData();
        }
    }, [report?.ward_id, report?.assigned_department_id, report?.status]);

    const fetchDepartments = async () => {
        try {
            const data = await api.get('/departments');
            setDepartments(data);
        } catch (err) {
            console.error('Failed to fetch departments:', err);
        }
    };

    const fetchAuditLogs = async () => {
        try {
            const data = await api.get(`/reports/${id}/audit`);
            setAuditLogs(data);
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
        }
    };

    const fetchStaff = async (wardId, deptId) => {
        setLoadingStaff(true);
        try {
            const data = await api.get(`/users?ward_id=${wardId}&department_id=${deptId}&role=staff`);
            setStaffMembers(data);
        } catch (err) {
            console.error('Failed to fetch staff:', err);
        } finally {
            setLoadingStaff(false);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const profile = await api.get('/users/me');
                setCurrentUser(profile);
            }
        } catch (err) {
            console.error('Failed to fetch current user:', err);
        }
    };

    const fetchRepairData = async () => {
        try {
            const logs = await api.get(`/reports/${id}/audit`);
            const resolutionLog = logs.find(log => log.event_type === 'RESOLUTION_SUBMITTED');
            if (resolutionLog) {
                setRepairData(resolutionLog.payload);
            }
        } catch (err) {
            console.error('Failed to fetch repair data:', err);
        }
    };

    const fetchReport = async () => {
        try {
            setLoading(true);
            const data = await api.get(`/reports/${id}`);
            if (data.status === 'Submitted' || !data.status) data.status = 'Pending';
            setReport(data);
            setRemarks(data.remarks || '');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            await api.patch(`/reports/${id}`, { status: newStatus, remarks });
            fetchReport();
        } catch (err) {
            alert('Update failed: ' + err.message);
        }
    };

    const handleReassign = async (deptId) => {
        try {
            setUpdatingDeps(true);
            await api.patch(`/reports/${id}`, { assigned_department_id: deptId ? parseInt(deptId) : null });
            fetchReport();
        } catch (err) {
            alert('Reassignment failed: ' + err.message);
        } finally {
            setUpdatingDeps(false);
        }
    };

    const handleAssignStaff = async (staffId) => {
        try {
            setLoadingStaff(true);
            await api.patch(`/reports/${id}`, { assigned_staff_id: staffId || null });
            fetchReport();
        } catch (err) {
            alert('Staff assignment failed: ' + err.message);
        } finally {
            setLoadingStaff(false);
        }
    };

    const handleCategoryChange = async (newCategory) => {
        if (!window.confirm(`Are you sure you want to change this category to ${newCategory}? This will train the AI.`)) return;
        try {
            setUpdatingCategory(true);
            await api.patch(`/reports/${id}`, { category: newCategory });
            fetchReport();
        } catch (err) {
            alert('Category update failed: ' + err.message);
        } finally {
            setUpdatingCategory(false);
        }
    };

    const handleStatusAction = async (action) => {
        try {
            if (action === 'start_work') {
                await api.patch(`/reports/${id}`, { status: 'In Progress' });
            } else if (action === 'approve') {
                await api.post(`/reports/${id}/confirm-resolution`);
            } else if (action === 'reject') {
                await api.post(`/reports/${id}/reject-resolution`, { reason: rejectionReason });
                setIsRejecting(false);
            }
            fetchReport();
            fetchAuditLogs();
        } catch (err) {
            alert('Action failed: ' + err.message);
        }
    };

    const handleSubmitProof = async (e) => {
        e.preventDefault();
        if (!proofFile) return alert('Please select a photo');

        try {
            setIsSubmittingProof(true);
            const formData = new FormData();
            formData.append('image', proofFile);
            
            await api.post(`/reports/${id}/propose-resolution`, formData);
            
            setProofFile(null);
            setIsSubmittingProof(false);
            fetchReport();
            fetchAuditLogs();
        } catch (err) {
            alert('Submission failed: ' + err.message);
            setIsSubmittingProof(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;
        try {
            await api.delete(`/reports/${id}`);
            if (onDeleted) onDeleted();
        } catch (err) {
            alert('Delete failed: ' + err.message);
        }
    };

    return {
        report,
        loading,
        error,
        departments,
        remarks,
        setRemarks,
        updatingDeps,
        updatingCategory,
        auditLogs,
        staffMembers,
        loadingStaff,
        currentUser,
        repairData,
        isSubmittingProof,
        proofFile,
        setProofFile,
        isRejecting,
        setIsRejecting,
        rejectionReason,
        setRejectionReason,
        handleUpdateStatus,
        handleReassign,
        handleAssignStaff,
        handleCategoryChange,
        handleStatusAction,
        handleSubmitProof,
        handleDelete,
        fetchReport
    };
};
