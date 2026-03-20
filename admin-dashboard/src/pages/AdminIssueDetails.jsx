import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Trash2, CheckCircle, Clock, AlertCircle, MapPin, User, Calendar, Tag, FileText, Mic, Globe, Zap } from 'lucide-react';

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
    const [auditLogs, setAuditLogs] = useState([]);

    useEffect(() => {
        fetchReport();
        fetchDepartments();
        fetchAuditLogs();
    }, [id]);

    const fetchDepartments = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/departments');
            if (response.ok) {
                const data = await response.json();
                setDepartments(data);
            }
        } catch (err) {
            console.error('Failed to fetch departments:', err);
        }
    };

    const fetchAuditLogs = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/reports/${id}/audit`);
            if (response.ok) {
                const data = await response.json();
                setAuditLogs(data);
            }
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
        }
    };

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/reports/${id}`);
            if (!response.ok) throw new Error('Failed to fetch report details');
            const data = await response.json();
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
            const response = await fetch(`http://localhost:5000/api/reports/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, remarks }),
            });
            if (response.ok) {
                fetchReport();
            }
        } catch (err) {
            alert('Update failed: ' + err.message);
        }
    };

    const handleReassign = async (deptId) => {
        try {
            setUpdatingDeps(true);
            const response = await fetch(`http://localhost:5000/api/reports/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assigned_department_id: parseInt(deptId) }),
            });
            if (response.ok) {
                fetchReport();
            }
        } catch (err) {
            alert('Reassignment failed: ' + err.message);
        } finally {
            setUpdatingDeps(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;
        try {
            const response = await fetch(`http://localhost:5000/api/reports/${id}`, { method: 'DELETE' });
            if (response.ok) {
                navigate('/admin/issues');
            }
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
                                src={report.metadata?.image_url?.startsWith('/uploads')
                                    ? `http://localhost:5000${report.metadata.image_url}`
                                    : report.metadata?.image_url || 'https://via.placeholder.com/800x600'}
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
                        <h2 className={`font-bold flex items-center mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            <Tag className="w-5 h-5 mr-2 text-blue-500" />
                            Case Description
                        </h2>
                        <p className={`leading-relaxed text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {report.metadata?.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* AI Insights Section */}
                    {(report.metadata?.transcription || report.metadata?.ai_insights) && (
                        <div className={`rounded-2xl shadow-sm border p-6 space-y-6 ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white'}`}>
                            <h2 className={`font-bold flex items-center border-b pb-4 ${darkMode ? 'text-gray-200 border-white/5' : 'text-gray-800'}`}>
                                <Zap className="w-5 h-5 mr-2 text-amber-500" />
                                AI-Powered Insights
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {report.metadata?.ai_insights && (
                                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                                        <p className="text-xs font-bold uppercase text-amber-600 mb-1">AI Priority Score</p>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-2xl font-black text-amber-700">{report.metadata.ai_insights.urgency_score}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${darkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-200 text-amber-800'}`}>
                                                {report.metadata.ai_insights.urgency_label}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {report.metadata?.ai_insights?.suggested_category && (
                                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                                        <p className="text-xs font-bold uppercase text-blue-600 mb-1">Suggested Category</p>
                                        <p className="text-lg font-bold text-blue-700">{report.metadata.ai_insights.suggested_category}</p>
                                    </div>
                                )}
                            </div>

                            {report.metadata?.audio_url && (
                                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-900/50 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className="flex items-center mb-3">
                                        <Mic className="w-4 h-4 mr-2 text-red-500" />
                                        <span className="text-xs font-bold text-gray-500 uppercase">Voice Complaint Record</span>
                                    </div>
                                    <audio
                                        controls
                                        src={report.metadata.audio_url.startsWith('/uploads')
                                            ? `http://localhost:5000${report.metadata.audio_url}`
                                            : report.metadata.audio_url}
                                        className="w-full h-10"
                                    />
                                </div>
                            )}

                            {report.metadata?.transcription && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            <Mic className="w-3 h-3 mr-1" /> Original Transcription
                                        </div>
                                        <p className={`p-4 rounded-xl italic ${darkMode ? 'bg-white/5 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                                            "{report.metadata.transcription}"
                                        </p>
                                    </div>

                                    {report.metadata?.translation && report.metadata.translation !== report.metadata.transcription && (
                                        <div className="space-y-2">
                                            <div className="flex items-center text-xs font-bold text-emerald-600 uppercase tracking-wider">
                                                <Globe className="w-3 h-3 mr-1" /> English Translation
                                            </div>
                                            <p className={`p-4 rounded-xl font-medium ${darkMode ? 'bg-emerald-500/10 text-emerald-100' : 'bg-emerald-50 text-emerald-900'}`}>
                                                {report.metadata.translation}
                                            </p>
                                        </div>
                                    )}

                                    {report.metadata?.ai_insights?.summary && (
                                        <div className="space-y-2">
                                            <div className="flex items-center text-xs font-bold text-blue-600 uppercase tracking-wider">
                                                <Zap className="w-3 h-3 mr-1" /> AI Brief
                                            </div>
                                            <p className={`p-4 rounded-xl font-bold bg-blue-500/5 border border-blue-500/20 ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                                                {report.metadata.ai_insights.summary}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

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
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Lodged At</p>
                                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{new Date(report.timestamp).toLocaleString()}</p>
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
                                    <div key={log.audit_id || idx} className={`flex items-start space-x-3 p-3 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                                        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${idx === 0 ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                {log.lifecycle_state_change}
                                            </p>
                                            <div className="flex justify-between items-center text-[10px] text-gray-500">
                                                <span>Actor: {log.initiating_actor_id}</span>
                                                <span>{new Date(log.timestamp).toLocaleString()}</span>
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
