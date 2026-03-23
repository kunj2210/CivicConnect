import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, MapPin, User, Calendar, Tag, FileText, Camera, Send, X, Zap, Mic } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

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
            const data = await api.get(`/reports/${id}`);
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



    const handleUpdateStatus = async (newStatus) => {
        try {
            await api.patch(`/reports/${id}`, { status: newStatus });
            fetchReport();
        } catch (err) {
            alert('Update failed: ' + err.message);
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

            await api.post(`/reports/${id}/propose-resolution`, formData);

            setResImage(null);
            setResPreview(null);
            fetchReport();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
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
                    onClick={() => navigate('/authority/issues')}
                    className={`flex items-center font-medium transition-colors ${darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600 hover:text-blue-600'}`}
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Tasks
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className={`rounded-2xl shadow-sm border overflow-hidden ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white'}`}>
                        <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50'}`}>
                            <h2 className={`font-bold flex items-center ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                <FileText className="w-5 h-5 mr-2 text-indigo-500" />
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

                    <div className={`rounded-2xl shadow-sm border p-6 space-y-4 ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white'}`}>
                        <h2 className={`font-bold flex items-center mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            <Tag className="w-5 h-5 mr-2 text-indigo-500" />
                            Issue Category
                        </h2>
                        <p className={`leading-relaxed text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {report.category || 'No category provided.'}
                        </p>
                    </div>

                    {/* Multimodal AI Fusion Section */}
                    <div className={`rounded-2xl shadow-sm border p-6 space-y-6 ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white'}`}>
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className={`font-bold flex items-center ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                <Zap className="w-5 h-5 mr-2 text-indigo-500" />
                                AI Decision Matrix
                            </h2>
                            {report.needs_human_review && (
                                <span className="flex items-center px-3 py-1 bg-red-500/20 text-red-500 text-[10px] font-black uppercase rounded-full animate-pulse border border-red-500/30">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Review Required
                                </span>
                            )}
                        </div>

                        {/* Fused Verdict */}
                        <div className={`p-5 rounded-2xl border-2 ${report.needs_human_review ? 'border-red-500/20 bg-red-500/5' : 'border-indigo-500/20 bg-indigo-500/5'}`}>
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Recommended Category</p>
                                    <h3 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{report.fusion_final_category || 'Assessing...'}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Fusion Confidence</p>
                                    <span className="text-3xl font-black text-indigo-500">{(report.fusion_confidence_score * 100).toFixed(1)}%</span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${report.needs_human_review ? 'bg-red-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${report.fusion_confidence_score * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Top-3 Matrix */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <FileText className="w-3 h-3 mr-1 text-indigo-500" /> Image Confidence
                                </div>
                                <div className="space-y-3">
                                    {(report.ai_image_top3 || []).map((p, i) => (
                                        <div key={i} className="space-y-1">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{p.class || p.category}</span>
                                                <span className="text-indigo-500">{(p.confidence * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-gray-900 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-indigo-500/50 h-full" style={{ width: `${p.confidence * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <Mic className="w-3 h-3 mr-1 text-emerald-500" /> Text/Audio Confidence
                                </div>
                                <div className="space-y-3">
                                    {(report.ai_text_top3 || []).map((p, i) => (
                                        <div key={i} className="space-y-1">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{p.category}</span>
                                                <span className="text-emerald-500">{(p.confidence * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-gray-900 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-emerald-500/50 h-full" style={{ width: `${p.confidence * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

                <div className="space-y-6">
                    <div className={`rounded-2xl shadow-sm border p-6 space-y-6 ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white'}`}>
                        <h2 className={`font-bold border-b pb-4 ${darkMode ? 'text-gray-200 border-white/5' : 'text-gray-800'}`}>Task Status</h2>
                        <div className="space-y-3">
                            {report.status === 'Pending Confirmation' ? (
                                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
                                    <div className="flex items-center gap-2 mb-2 font-bold">
                                        <Clock className="w-4 h-4" />
                                        Awaiting Citizen Confirmation
                                    </div>
                                    <p className="text-xs opacity-80">Resolution image has been uploaded. The citizen must confirm to close the issue.</p>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => handleUpdateStatus('Pending')}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${report.status === 'Pending' ? 'bg-red-500/10 border-red-500/30 text-red-500' : darkMode ? 'hover:bg-white/5 border-white/5 text-gray-400' : 'hover:bg-gray-50 border-gray-100'}`}
                                    >
                                        <div className="flex items-center">
                                            <AlertCircle className="w-5 h-5 mr-3" />
                                            <span className="font-medium">Stay Pending</span>
                                        </div>
                                        {report.status === 'Pending' && <CheckCircle className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus('In Progress')}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${report.status === 'In Progress' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : darkMode ? 'hover:bg-white/5 border-white/5 text-gray-400' : 'hover:bg-gray-50 border-gray-100'}`}
                                    >
                                        <div className="flex items-center">
                                            <Clock className="w-5 h-5 mr-3" />
                                            <span className="font-medium">Keep In-Progress</span>
                                        </div>
                                        {report.status === 'In Progress' && <CheckCircle className="w-4 h-4" />}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {report.status !== 'Resolved' && report.status !== 'Pending Confirmation' && (
                        <div className={`rounded-2xl shadow-sm border p-6 space-y-4 ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white'}`}>
                            <h2 className={`font-bold border-b pb-4 ${darkMode ? 'text-gray-200 border-white/5' : 'text-gray-800'}`}>Propose Resolution</h2>
                            <div className="space-y-4">
                                {!resPreview ? (
                                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${darkMode ? 'border-gray-700 hover:border-indigo-500 bg-gray-900/50 hover:bg-gray-900' : 'border-gray-200 hover:border-indigo-500 bg-gray-50 hover:bg-white'}`}>
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Camera className={`w-8 h-8 mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                                            <p className={`text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Upload Resolution Photo</p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                ) : (
                                    <div className="relative group">
                                        <img src={resPreview} alt="Preview" className="w-full h-32 object-cover rounded-xl border border-indigo-500/20 shadow-sm" />
                                        <button
                                            onClick={() => { setResImage(null); setResPreview(null); }}
                                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                                <button
                                    onClick={handleProposeResolution}
                                    disabled={submitting || !resImage}
                                    className={`w-full py-4 rounded-xl shadow-lg transition-all font-black flex items-center justify-center gap-2 ${submitting || !resImage ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 active:scale-95'}`}
                                >
                                    {submitting ? 'Submitting...' : (
                                        <>
                                            <Send size={18} />
                                            Submit Resolution Fix
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className={`rounded-2xl shadow-sm border p-6 space-y-4 ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white'}`}>
                        <h2 className={`font-bold border-b pb-4 ${darkMode ? 'text-gray-200 border-white/5' : 'text-gray-800'}`}>Assignment Info</h2>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Site Location</p>
                                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{coords[1]}, {coords[0]}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Reported At</p>
                                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{new Date(report.reported_at).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 pt-2 border-t border-white/5">
                                <User className="w-5 h-5 text-indigo-500 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs text-indigo-600 uppercase font-bold tracking-wider">Assigned Staff</p>
                                    <div className="flex items-center justify-between mt-1">
                                        {loadingStaff ? (
                                            <span className="text-sm animate-pulse text-gray-500 font-bold">Loading...</span>
                                        ) : (
                                            <select
                                                value={report.assigned_staff_id || ''}
                                                onChange={(e) => handleAssignStaff(e.target.value)}
                                                className={`text-sm font-bold bg-transparent border-none outline-none focus:ring-0 p-0 cursor-pointer ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}
                                            >
                                                <option value="">Unassigned</option>
                                                {staffMembers.map(staff => (
                                                    <option key={staff.id} value={staff.id}>{staff.phone || staff.email || 'Worker'}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1 italic">Delegate to field worker</p>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthorityIssueDetails;
