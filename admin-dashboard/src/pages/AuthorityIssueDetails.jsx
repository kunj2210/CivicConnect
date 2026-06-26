import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Tag } from 'lucide-react';

import { reportsApi } from '../services/reportsApi';
import { usersApi } from '../services/usersApi';

import IssueVisuals from '../features/issues/components/IssueVisuals';
import IssueAIReport from '../features/issues/components/IssueAIReport';
import IssueActions from '../features/issues/components/IssueActions';

const AuthorityIssueDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useOutletContext();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [resImage, setResImage] = useState(null);
    const [resPreview, setResPreview] = useState(null);
    const [staffMembers, setStaffMembers] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(false);

    useEffect(() => {
        fetchReport();
    }, [id]);

    useEffect(() => {
        if (report?.ward_id) {
            fetchStaff(report.ward_id, report.assigned_department_id);
        }
    }, [report?.ward_id, report?.assigned_department_id]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const data = await reportsApi.getById(id);
            if (data.status === 'Submitted' || !data.status) data.status = 'Pending';
            setReport(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async (wardId, deptId) => {
        try {
            setLoadingStaff(true);
            const data = await usersApi.getStaff({ ward_id: wardId, department_id: deptId });
            setStaffMembers(data);
        } catch (err) {
            console.error('Failed to fetch staff:', err);
        } finally {
            setLoadingStaff(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            await reportsApi.update(id, { status: newStatus });
            fetchReport();
        } catch (err) {
            alert('Update failed: ' + err.message);
        }
    };

    const handleAssignStaff = async (staffId) => {
        try {
            setLoadingStaff(true);
            await reportsApi.update(id, { assigned_staff_id: staffId || null });
            fetchReport();
        } catch (err) {
            alert('Staff assignment failed: ' + err.message);
        } finally {
            setLoadingStaff(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResImage(file);
            setResPreview(URL.createObjectURL(file));
        }
    };

    const handleProposeResolution = async () => {
        if (!resImage) {
            alert('Please select a resolution image');
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('image', resImage);

            await reportsApi.proposeResolution(id, formData);

            setResImage(null);
            setResPreview(null);
            fetchReport();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmResolution = async () => {
        try {
            setSubmitting(true);
            await reportsApi.confirmResolution(id);
            fetchReport();
        } catch (err) {
            alert('Confirmation failed: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRejectResolution = async () => {
        const reason = prompt('Please enter the reason for rejection:');
        if (reason === null) return;

        try {
            setSubmitting(true);
            await reportsApi.rejectResolution(id, { reason });
            fetchReport();
        } catch (err) {
            alert('Rejection failed: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const extractPredictions = (data) => {
        if (!data) return [];
        let raw = Array.isArray(data) ? (data.length === 1 ? data[0] : data) : data;
        let list = raw.top_3 || raw.predictions || raw.issues || (Array.isArray(raw) ? raw : null);
        if (!list && raw.citizen_requests && Array.isArray(raw.citizen_requests)) {
            list = raw.citizen_requests[0]?.category;
        }
        if (!list) list = [raw];
        return Array.isArray(list) ? list.map(item => ({
            label: item.class || item.category || item.label || item.name || 'Unknown',
            score: Number(item.confidence || item.score || item.probability || 0)
        })) : [];
    };

    if (loading) return <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading issue details...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    if (!report) return <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Issue not found.</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/authority/issues')}
                    className={`flex items-center font-medium transition-colors ${darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600 hover:text-blue-600'}`}
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Tasks
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <IssueVisuals report={report} darkMode={darkMode} />

                    <div className={`rounded-2xl shadow-sm border p-6 space-y-4 ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white'}`}>
                        <h2 className={`font-bold flex items-center mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            <Tag className="w-5 h-5 mr-2 text-indigo-500" />
                            Issue Category
                        </h2>
                        <p className={`leading-relaxed text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {report.category || 'No category provided.'}
                        </p>
                    </div>

                    <IssueAIReport report={report} darkMode={darkMode} extractPredictions={extractPredictions} />
                </div>

                <div className="space-y-6">
                    <IssueActions
                        report={report}
                        darkMode={darkMode}
                        submitting={submitting}
                        resPreview={resPreview}
                        staffMembers={staffMembers}
                        loadingStaff={loadingStaff}
                        handleConfirmResolution={handleConfirmResolution}
                        handleRejectResolution={handleRejectResolution}
                        handleUpdateStatus={handleUpdateStatus}
                        handleFileChange={handleFileChange}
                        handleProposeResolution={handleProposeResolution}
                        handleAssignStaff={handleAssignStaff}
                        setResImage={setResImage}
                        setResPreview={setResPreview}
                    />
                </div>
            </div>
        </div>
    );
};

export default AuthorityIssueDetails;
