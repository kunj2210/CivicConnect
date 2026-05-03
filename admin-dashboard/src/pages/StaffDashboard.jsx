import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ClipboardList, CheckCircle, Clock, AlertTriangle, ArrowRight, User, MapPin } from 'lucide-react';
import { api } from '../utils/api';

const StaffDashboard = () => {
    const { darkMode } = useOutletContext();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({ assigned: 0, completed: 0, pending: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const fetchMyTasks = async () => {
        try {
            setLoading(true);
            // Fetch issues assigned to me
            const data = await api.get('/reports'); 
            // Filtering on frontend for now, in a real city we'd use /reports/my-tasks
            const me = await api.get('/users/me');
            const myTasks = data.filter(task => task.assigned_staff_id === me.id);
            
            setTasks(myTasks);
            setStats({
                assigned: myTasks.length,
                completed: myTasks.filter(t => t.status === 'Resolved' || t.status === 'Pending Confirmation').length,
                pending: myTasks.filter(t => t.status === 'Pending').length
            });
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            'Pending': 'bg-red-500/10 text-red-500',
            'In Progress': 'bg-blue-500/10 text-blue-500',
            'Resolved': 'bg-green-500/10 text-green-500',
            'Pending Confirmation': 'bg-amber-500/10 text-amber-500'
        };
        return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${styles[status] || 'bg-gray-500/10 text-gray-500'}`}>{status}</span>;
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Task Board</h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Junior Engineer Persona: Field Resolution View</p>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Assigned Tasks', value: stats.assigned, icon: ClipboardList, color: 'blue' },
                    { label: 'In Review', value: stats.completed, icon: Clock, color: 'amber' },
                    { label: 'High Priority', value: tasks.filter(t => t.priority_score > 70).length, icon: AlertTriangle, color: 'red' },
                ].map((s, i) => (
                    <div key={i} className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase">{s.label}</p>
                                <p className={`text-2xl font-black mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{s.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl bg-${s.color}-500/10 text-${s.color}-500`}>
                                <s.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Task List */}
            <section className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                    <h2 className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Assigned Issues</h2>
                    <span className="text-xs text-gray-400">{tasks.length} Active Tasks</span>
                </div>
                
                <div className="divide-y divide-white/5">
                    {tasks.length > 0 ? tasks.map(task => (
                        <div 
                            key={task.id} 
                            onClick={() => navigate(`/admin/issues/${task.id}`)}
                            className="p-6 hover:bg-white/5 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{task.category}</h3>
                                        <StatusBadge status={task.status} />
                                    </div>
                                    <p className="text-xs text-gray-500">ID: {task.id.slice(0, 8)}...</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                                        <MapPin size={12} />
                                        <span>Ward ID: {task.ward_id}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xs font-bold px-2 py-1 rounded bg-gray-500/10 ${task.priority_score > 70 ? 'text-red-500' : 'text-blue-500'}`}>
                                        Priority: {task.priority_score}
                                    </div>
                                    <button className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-500 group-hover:gap-2 transition-all">
                                        View Details <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-10 text-center text-gray-500">
                            No tasks currently assigned to you.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default StaffDashboard;
