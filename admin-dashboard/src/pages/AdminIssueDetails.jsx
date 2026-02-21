import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Trash2, CheckCircle, Clock, AlertCircle, MapPin, User, Calendar, Tag, FileText } from 'lucide-react';

const AdminIssueDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useOutletContext();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReport();
    }, [id]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:5000/api/reports/${id}`);
            if (!response.ok) throw new Error('Failed to fetch report details');
            const data = await response.json();
            if (data.status === 'Submitted' || !data.status) data.status = 'Pending';
            setReport(data);
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
                body: JSON.stringify({ status: newStatus }),
            });
            if (response.ok) {
                fetchReport();
            }
        } catch (err) {
            alert('Update failed: ' + err.message);
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
                                src={report.metadata?.image_url || 'https://via.placeholder.com/800x600'}
                                alt="Report Evidence"
                                className="w-full aspect-video object-cover rounded-xl shadow-inner"
                            />
                        </div>
                    </div>

                    <div className={`rounded-2xl shadow-sm border p-6 space-y-4 ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white'}`}>
                        <h2 className={`font-bold flex items-center mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            <Tag className="w-5 h-5 mr-2 text-blue-500" />
                            Case Description
                        </h2>
                        <p className={`leading-relaxed text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {report.metadata?.description || 'No description provided.'}
                        </p>
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
                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${report.status === 'Resolved' ? 'bg-green-500/10 border-green-500/30 text-green-500' : darkMode ? 'hover:bg-white/5 border-white/5 text-gray-400' : 'hover:bg-gray-50 border-gray-100'}`}
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminIssueDetails;
