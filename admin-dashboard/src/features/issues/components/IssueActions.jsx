import React from 'react';
import { Clock, CheckCircle, X, AlertCircle, Camera, Send, MapPin, Calendar, User } from 'lucide-react';

const IssueActions = ({
    report,
    darkMode,
    submitting,
    resPreview,
    staffMembers,
    loadingStaff,
    handleConfirmResolution,
    handleRejectResolution,
    handleUpdateStatus,
    handleFileChange,
    handleProposeResolution,
    handleAssignStaff,
    setResImage,
    setResPreview
}) => {
    const coords = report.location?.coordinates || [0, 0];

    return (
        <div className="space-y-6">
            <div className={`rounded-2xl shadow-sm border p-6 space-y-6 ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white'}`}>
                <h2 className={`font-bold border-b pb-4 ${darkMode ? 'text-gray-200 border-white/5' : 'text-gray-800'}`}>Task Status</h2>
                <div className="space-y-3">
                    {report.status === 'Pending Confirmation' ? (
                        <div className="space-y-3">
                            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                                <div className="flex items-center gap-2 mb-2 font-bold">
                                    <Clock className="w-4 h-4" />
                                    Awaiting Your Review
                                </div>
                                <p className="text-xs opacity-80">The field worker has submitted resolution evidence. Please review the proof and approve or reject the resolution.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleConfirmResolution}
                                    disabled={submitting}
                                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 text-xs flex items-center justify-center gap-1.5"
                                >
                                    <CheckCircle className="w-4 h-4" /> Approve Fix
                                </button>
                                <button
                                    onClick={handleRejectResolution}
                                    disabled={submitting}
                                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 text-xs flex items-center justify-center gap-1.5"
                                >
                                    <X className="w-4 h-4" /> Reject Fix
                                </button>
                            </div>
                        </div>
                    ) : report.status === 'Pending Citizen Confirmation' ? (
                        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
                            <div className="flex items-center gap-2 mb-2 font-bold">
                                <Clock className="w-4 h-4" />
                                Awaiting Citizen Confirmation
                            </div>
                            <p className="text-xs opacity-80">You have approved this resolution. The reporting citizen must verify and confirm the fix to fully close the issue.</p>
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

            {report.status !== 'Resolved' && report.status !== 'Pending Confirmation' && report.status !== 'Pending Citizen Confirmation' && (
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
    );
};

export default IssueActions;
