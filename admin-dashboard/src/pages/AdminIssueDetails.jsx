import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Trash2, CheckCircle, Clock, AlertCircle, MapPin, User, Calendar, Tag, FileText, Mic, Globe, Zap } from 'lucide-react';
import { api } from '../utils/api';


const AdminIssueDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useOutletContext();
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


    useEffect(() => {
        fetchReport();
        fetchDepartments();
        fetchAuditLogs();
    }, [id]);

    useEffect(() => {
        if (report?.ward_id) {
            fetchStaff(report.ward_id, report.assigned_department_id);
        }
    }, [report?.ward_id, report?.assigned_department_id]);


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
        try {
            setLoadingStaff(true);
            const data = await api.get('/users/staff', { 
                params: { ward_id: wardId, department_id: deptId } 
            });
            setStaffMembers(data);
        } catch (err) {
            console.error('Failed to fetch staff:', err);
        } finally {
            setLoadingStaff(false);
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



    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;
        try {
            await api.delete(`/reports/${id}`);
            navigate('/admin/issues');
        } catch (err) {
            alert('Delete failed: ' + err.message);
        }
    };


    if (loading) return <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading issue details...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    if (!report) return <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Issue not found.</div>;

    const coords = report.location?.coordinates || [0, 0];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/issues')}
                    className={`flex items-center font-medium transition-colors ${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Case List
                </button>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleDelete}
                        className={`flex items-center px-4 py-2 rounded-lg border transition-all font-medium ${darkMode ? 'text-red-400 border-red-500/30 hover:bg-red-500/10' : 'text-red-600 border-red-200 hover:bg-red-50'}`}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Case
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className={`rounded-2xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white'}`}>
                        <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50'}`}>
                            <h2 className={`font-bold flex items-center ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                                Evidence & Visuals
                            </h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${report.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                report.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                {report.status}
                            </span>
                        </div>
                        <div className={`p-1 min-h-[300px] flex items-center justify-center rounded-xl ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                            <img
                                src={report.minio_pre_key || 'https://via.placeholder.com/800x600'}
                                alt="Report Evidence"
                                className="w-full aspect-video object-cover rounded-xl shadow-inner"
                            />
                        </div>

                    </div>

                    {(report.status === 'Pending Confirmation' || report.status === 'Resolved') && report.metadata?.resolution_image_url && (
                        <div className={`rounded-2xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white'}`}>
                            <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50'}`}>
                                <h2 className={`font-bold flex items-center ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
                                    Resolution Proof
                                </h2>
                                <span className="text-xs font-bold text-emerald-600 uppercase">Verification Required</span>
                            </div>
                            <div className={`p-1 min-h-[300px] flex items-center justify-center rounded-xl ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
                                <img
                                    src={report.metadata.resolution_image_url.startsWith('/uploads')
                                        ? `http://localhost:5000${report.metadata.resolution_image_url}`
                                        : report.metadata.resolution_image_url}
                                    alt="Resolution Proof"
                                    className="w-full aspect-video object-cover rounded-xl shadow-inner"
                                />
                            </div>
                        </div>
                    )}

                    <div className={`rounded-2xl shadow-sm border p-6 space-y-4 ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white'}`}>
                        <div className="flex items-center justify-between pointer-events-auto">
                             <h2 className={`font-bold flex items-center ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                <Tag className="w-5 h-5 mr-2 text-blue-500" />
                                Case Category
                            </h2>
                        </div>
                        <div className="flex items-center space-x-4">
                            {updatingCategory ? (
                                <span className="text-sm animate-pulse text-blue-500 font-bold">Logging to Retraining Queue...</span>
                            ) : (
                                <select
                                    value={report.category || ''}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className={`text-lg font-bold bg-transparent border-none outline-none focus:ring-0 p-0 cursor-pointer ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                                >
                                    {['Road/Potholes', 'Waste Management', 'Street Light', 'Water Leakage', 'Drainage', 'Other'].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <p className={`text-xs italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>* Editing this logs the original AI prediction into the Retraining Queue.</p>
                    </div>


                    {/* Multimodal AI Fusion Section */}
                    <div className={`rounded-2xl shadow-sm border p-6 space-y-6 ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white'}`}>
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className={`font-bold flex items-center ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                <Zap className="w-5 h-5 mr-2 text-amber-500" />
                                Multimodal Data Fusion Analysis
                            </h2>
                            {report.needs_human_review && (
                                <span className="flex items-center px-3 py-1 bg-red-500/20 text-red-500 text-[10px] font-black uppercase rounded-full animate-pulse border border-red-500/30">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    High Conflict - Manual Review Required
                                </span>
                            )}
                        </div>

                        {/* Winning Fusion Result */}
                        <div className={`p-5 rounded-2xl border-2 ${report.needs_human_review ? 'border-red-500/20 bg-red-500/5' : 'border-blue-500/20 bg-blue-500/5'}`}>
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Final Fused Verdict</p>
                                    <h3 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{report.fusion_final_category || 'Calculating...'}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Aggregated Confidence</p>
                                    <span className="text-3xl font-black text-blue-500">{(report.fusion_confidence_score * 100).toFixed(1)}%</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${report.needs_human_review ? 'bg-red-500' : 'bg-blue-500'}`}
                                    style={{ width: `${report.fusion_confidence_score * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Modal Confidence Matrix */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Image Modality (Top 3) */}
                            <div className="space-y-4">
                                <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <FileText className="w-3 h-3 mr-1 text-blue-500" /> Image Preds (50% Weight)
                                </div>
                                <div className="space-y-3">
                                    {(report.ai_image_top3 || []).map((p, i) => (
                                        <div key={i} className="space-y-1">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{p.class || p.category || p.label || p.name || 'Unknown'}</span>
                                                <span className="text-blue-500">{((Number(p.confidence || p.score || p.probability) || 0) * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-gray-900 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-blue-500/50 h-full" style={{ width: `${(Number(p.confidence) || 0) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Text Modality (Top 3) */}
                            <div className="space-y-4">
                                <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <Mic className="w-3 h-3 mr-1 text-emerald-500" /> Text Analysis (20% Weight)
                                </div>
                                <div className="space-y-3">
                                    {(report.ai_text_top3 || []).map((p, i) => (
                                        <div key={i} className="space-y-1">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{p.class || p.category || p.label || p.name || 'Unknown'}</span>
                                                <span className="text-emerald-500">{((Number(p.confidence || p.score || p.probability) || 0) * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-gray-900 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-emerald-500/50 h-full" style={{ width: `${(Number(p.confidence) || 0) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Audio Modality (Top 3) */}
                            <div className="space-y-4">
                                <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <Mic className="w-3 h-3 mr-1 text-purple-500" /> Audio Mood (30% Weight)
                                </div>
                                <div className="space-y-3">
                                    {(report.ai_audio_top3 || []).length > 0 ? (report.ai_audio_top3.map((p, i) => (
                                        <div key={i} className="space-y-1">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{p.class || p.category || p.label || p.name || 'Unknown'}</span>
                                                <span className="text-purple-500">{((Number(p.confidence || p.score || p.probability) || 0) * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-gray-900 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-purple-500/50 h-full" style={{ width: `${(Number(p.confidence) || 0) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))) : (
                                        <p className="text-xs italic text-gray-500">No audio data processed</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {report.description && (
                            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-black/20 border-white/5 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                                <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Original Citizen Description</p>
                                <p className="text-sm italic">"{report.description}"</p>
                            </div>
                        )}
                    </div>


                    <div className={`rounded-2xl shadow-sm border p-6 space-y-4 ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white'}`}>
                        <h2 className={`font-bold flex items-center mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            <FileText className="w-5 h-5 mr-2 text-blue-500" />
                            Administrative Remarks
                        </h2>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Add internal notes or instructions for the authority..."
                            className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] transition-all ${darkMode ? 'bg-gray-900/50 text-white' : 'bg-gray-50 text-gray-900'}`}
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={() => handleUpdateStatus(report.status)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
                            >
                                Save Remarks
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className={`rounded-2xl shadow-sm border p-6 space-y-6 ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white'}`}>
                        <h2 className={`font-bold border-b pb-4 ${darkMode ? 'text-gray-200 border-white/5' : 'text-gray-800'}`}>Triage Actions</h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleUpdateStatus('Pending')}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${report.status === 'Pending' ? 'bg-red-500/10 border-red-500/30 text-red-500' : darkMode ? 'hover:bg-white/5 border-white/5 text-gray-400' : 'hover:bg-gray-50 border-gray-100'}`}
                            >
                                <div className="flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-3" />
                                    <span className="font-medium">Mark as Pending</span>
                                </div>
                                {report.status === 'Pending' && <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => handleUpdateStatus('In Progress')}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${report.status === 'In Progress' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : darkMode ? 'hover:bg-white/5 border-white/5 text-gray-400' : 'hover:bg-gray-50 border-gray-100'}`}
                            >
                                <div className="flex items-center">
                                    <Clock className="w-5 h-5 mr-3" />
                                    <span className="font-medium">Move to In-Progress</span>
                                </div>
                                {report.status === 'In Progress' && <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => handleUpdateStatus('Resolved')}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${report.status === 'Resolved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : darkMode ? 'hover:bg-white/5 border-white/5 text-gray-400' : 'hover:bg-gray-50 border-gray-100'}`}
                            >
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 mr-3" />
                                    <span className="font-medium">Sign-off Resolved</span>
                                </div>
                                {report.status === 'Resolved' && <CheckCircle className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className={`rounded-2xl shadow-sm border p-6 space-y-4 ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white'}`}>
                        <h2 className={`font-bold border-b pb-4 ${darkMode ? 'text-gray-200 border-white/5' : 'text-gray-800'}`}>Incident Metadata</h2>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Geolocation</p>
                                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{coords[1]}, {coords[0]}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <User className="w-5 h-5 text-gray-400 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Reporter Contact</p>
                                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>+{report.metadata?.citizen_phone || 'Anonymous'}</p>
                                </div>
                            </div>
                             <div className="flex items-start space-x-3">
                                <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Reported At</p>
                                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{new Date(report.createdAt || report.reported_at || report.timestamp).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs text-emerald-600 uppercase font-bold tracking-wider">Assigned Jurisdiction</p>
                                    <div className="flex items-center justify-between mt-1">
                                        {updatingDeps ? (
                                            <span className="text-sm animate-pulse text-gray-500 font-bold">Updating...</span>
                                        ) : (
                                            <select
                                                value={report.assigned_department_id || ''}
                                                onChange={(e) => handleReassign(e.target.value)}
                                                className={`text-sm font-bold bg-transparent border-none outline-none focus:ring-0 p-0 cursor-pointer ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}
                                            >
                                                <option value="">Unassigned</option>
                                                {departments.map(dept => (
                                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1 italic">Automatically routed by GIS logic</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Zap className="w-5 h-5 text-amber-500 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs text-amber-600 uppercase font-bold tracking-wider">Assigned Field Worker</p>
                                    <div className="flex items-center justify-between mt-1">
                                        {loadingStaff ? (
                                            <span className="text-sm animate-pulse text-gray-500 font-bold">Loading...</span>
                                        ) : (
                                            <select
                                                value={report.assigned_staff_id || ''}
                                                onChange={(e) => handleAssignStaff(e.target.value)}
                                                className={`text-sm font-bold bg-transparent border-none outline-none focus:ring-0 p-0 cursor-pointer ${darkMode ? 'text-amber-400' : 'text-amber-700'}`}
                                            >
                                                <option value="">Unassigned</option>
                                                {staffMembers.map(staff => (
                                                    <option key={staff.id} value={staff.id}>{staff.phone || staff.email || 'Worker'}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1 italic">Manual delegation for resolution</p>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className={`rounded-2xl shadow-sm border p-6 space-y-4 ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white'}`}>
                        <h2 className={`font-bold flex items-center mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            <Clock className="w-5 h-5 mr-2 text-blue-500" />
                            Systemic Audit Ledger
                        </h2>
                        <div className="space-y-4">
                            {auditLogs.length > 0 ? (
                                 auditLogs.map((log, idx) => (
                                    <div key={log.id || idx} className={`flex items-start space-x-3 p-3 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${idx === 0 ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                {log.event_type}
                                            </p>
                                            <div className="flex justify-between items-center text-[10px] text-gray-500">
                                                <span>Actor: {log.actor_id?.slice(0, 8)}...</span>
                                                <span>{new Date(log.createdAt || log.ts).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))

                            ) : (
                                <p className="text-sm text-gray-500 italic">No audit records found for this case.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminIssueDetails;
