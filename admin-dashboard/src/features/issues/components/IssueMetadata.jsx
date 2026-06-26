import React from 'react';
import { MapPin, User, Calendar, AlertCircle, Zap } from 'lucide-react';

const IssueMetadata = ({
    report,
    coords,
    departments,
    staffMembers,
    updatingDeps,
    loadingStaff,
    onReassign,
    onAssignStaff,
    darkMode
}) => {
    return (
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
                                    onChange={(e) => onReassign(e.target.value)}
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
                                    onChange={(e) => onAssignStaff(e.target.value)}
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
    );
};

export default IssueMetadata;
