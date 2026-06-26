import React from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Trash2, Tag, FileText } from 'lucide-react';
import { useIssueDetails } from '../features/issues/hooks/useIssueDetails';
import IssueAuditComparison from '../features/issues/components/IssueAuditComparison';
import IssueAIFusion from '../features/issues/components/IssueAIFusion';
import IssueMetadata from '../features/issues/components/IssueMetadata';
import IssueWorkflowActions from '../features/issues/components/IssueWorkflowActions';

const AdminIssueDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { darkMode } = useOutletContext();

    const {
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
        handleDelete
    } = useIssueDetails(id, () => navigate('/admin/issues'));

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
                    <IssueAuditComparison
                        report={report}
                        repairData={repairData}
                        darkMode={darkMode}
                    />
                    
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

                    <IssueAIFusion
                        report={report}
                        darkMode={darkMode}
                    />

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
                    <IssueWorkflowActions
                        report={report}
                        currentUser={currentUser}
                        isRejecting={isRejecting}
                        setIsRejecting={setIsRejecting}
                        rejectionReason={rejectionReason}
                        setRejectionReason={setRejectionReason}
                        onStatusAction={handleStatusAction}
                        onUpdateStatus={handleUpdateStatus}
                        proofFile={proofFile}
                        setProofFile={setProofFile}
                        isSubmittingProof={isSubmittingProof}
                        onSubmitProof={handleSubmitProof}
                        darkMode={darkMode}
                    />

                    <IssueMetadata
                        report={report}
                        coords={coords}
                        departments={departments}
                        staffMembers={staffMembers}
                        updatingDeps={updatingDeps}
                        loadingStaff={loadingStaff}
                        onReassign={handleReassign}
                        onAssignStaff={handleAssignStaff}
                        darkMode={darkMode}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdminIssueDetails;
