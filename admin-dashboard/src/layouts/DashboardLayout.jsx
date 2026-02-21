import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
    const { user } = useAuth();
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    // ... rest of state
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    // ... useEffects and handlers


    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/notifications');
                const data = await response.json();
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.read).length);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const markAllAsRead = async () => {
        // Implementation for marking all as read (could be an API call)
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    return (
        <div className={`flex min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'dark bg-gray-950 text-gray-100' : 'bg-white text-gray-900'}`}>
            <Sidebar darkMode={darkMode} />
            <div className="flex-1 flex flex-col overflow-hidden relative">

                <header className={`flex justify-between items-center py-4 px-8 border-b z-10 sticky top-0 transition-colors duration-300 ${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center w-96">
                        <div className="relative w-full hidden md:block">
                            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                            <input
                                type="text"
                                placeholder="Search system..."
                                className={`w-full pl-10 pr-4 py-2 border rounded-none text-sm focus:ring-1 focus:ring-gray-400 outline-none transition-all ${darkMode ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                            />
                        </div>
                        <button className="text-gray-500 focus:outline-none md:hidden p-2">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>

                    <div className={`flex items-center gap-4 pl-6 border-l ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2 transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                            title="Toggle Theme"
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative text-gray-500 hover:text-blue-600 transition-colors p-2"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className={`absolute right-0 mt-4 w-80 border overflow-hidden shadow-2xl ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                                    <div className={`p-4 border-b flex justify-between items-center ${darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-gray-50'}`}>
                                        <h3 className="font-bold text-sm">Notifications</h3>
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Mark all as read</button>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif._id || notif.id}
                                                    className={`p-4 border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                                >
                                                    <p className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{notif.title}</p>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                                                    <p className="text-[10px] text-gray-400 mt-2">{new Date(notif.timestamp || notif.createdAt).toLocaleString()}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-500 text-sm font-medium">
                                                No notifications found
                                            </div>
                                        )}
                                    </div>
                                    <div className={`p-3 text-center border-t ${darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-gray-50'}`}>
                                        <button className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">View All Notifications</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className={`text-sm font-bold leading-none ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{user?.name || 'Guest User'}</p>
                                <div className="flex justify-end mt-1.5">
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 border ${darkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-600 border-gray-200'
                                        }`}>
                                        {user?.role || 'Observer'}
                                    </span>
                                </div>
                            </div>
                            <div className={`h-10 w-10 flex items-center justify-center text-sm font-bold border transition-colors cursor-pointer ${darkMode ? 'bg-gray-900 text-white border-gray-700 hover:border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-300 hover:border-gray-400'
                                }`}>
                                {getInitials(user?.name)}
                            </div>
                        </div>
                    </div>
                </header>

                <main className={`flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 scroll-smooth relative transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
                    <Outlet context={{ darkMode }} />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
