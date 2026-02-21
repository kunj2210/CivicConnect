import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Map, Users, Settings, LogOut, Hexagon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ darkMode }) => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const isActive = (path) => location.pathname === path;

    const isAdmin = user?.role === 'Admin';
    const prefix = isAdmin ? '/admin' : '/authority';

    const navItems = [
        { path: `${prefix}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
        { path: `${prefix}/issues`, label: 'Issues', icon: FileText },
        { path: `${prefix}/map`, label: 'Live Map', icon: Map },
        ...(isAdmin ? [{ path: '/admin/departments', label: 'Departments', icon: Users }] : []),
        { path: `${prefix}/settings`, label: 'Settings', icon: Settings },
    ];

    return (
        <aside className={`hidden md:flex flex-col w-72 h-screen px-5 py-8 border-r z-20 transition-all duration-300 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3 px-2 mb-10">
                <div className={`p-1.5 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
                    <img src="/src/assets/logo.png" className="w-7 h-7 object-contain mix-blend-multiply dark:mix-blend-normal" alt="Logo" />
                </div>
                <div>
                    <h1 className={`text-xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        CivicConnect
                    </h1>
                    <p className={`text-[10px] font-bold tracking-widest uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>MUNICIPAL SYSTEM</p>
                </div>
            </div>

            <div className="flex flex-col justify-between flex-1">
                <nav className="space-y-2">
                    {navItems && navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`group flex items-center px-4 py-3 mb-1 transition-all duration-200 rounded-lg font-bold text-sm ${active
                                    ? darkMode ? 'bg-gray-800 text-white shadow-none' : 'bg-gray-100 text-gray-900 shadow-none'
                                    : darkMode ? 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-300' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className={`w-4 h-4 mr-3 transition-colors ${active ? (darkMode ? 'text-white' : 'text-gray-900') : 'text-gray-400 group-hover:text-current'}`} strokeWidth={active ? 2.5 : 2} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto">
                    <div className={`p-4 mb-4 rounded-xl border ${darkMode ? 'bg-gray-800/50 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                        <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>Need Help?</h4>
                        <p className="text-xs text-gray-500 mb-3 font-medium">Check system docs.</p>
                        <button className={`text-xs font-bold ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Documentation &rarr;</button>
                    </div>
                    <button
                        onClick={logout}
                        className={`flex items-center w-full px-4 py-3 transition-colors rounded-lg font-bold text-sm ${darkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-red-400' : 'text-gray-500 hover:bg-gray-100 hover:text-red-600'}`}
                    >
                        <LogOut className="w-4 h-4 mr-3" strokeWidth={2.5} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
