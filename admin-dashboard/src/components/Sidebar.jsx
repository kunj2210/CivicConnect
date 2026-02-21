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
        <aside className={`hidden md:flex flex-col w-72 h-screen px-5 py-8 backdrop-blur-xl border-r shadow-xl z-20 transition-all duration-300 ${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'}`}>
            <div className="flex items-center gap-3 px-2 mb-10">
                <div className="p-1 bg-white rounded-xl shadow-sm border border-gray-100">
                    <img src="/src/assets/logo.png" className="w-8 h-8 object-contain" alt="Logo" />
                </div>
                <div>
                    <h1 className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${darkMode ? 'from-white to-gray-400' : 'from-gray-800 to-gray-600'}`}>
                        Civic<span className="text-blue-600">Connect</span>
                    </h1>
                    <p className="text-xs text-gray-500 font-medium tracking-wide">MUNICIPAL DASHBOARD</p>
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
                                className={`group flex items-center px-4 py-3.5 transition-all duration-200 rounded-xl font-medium ${active
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 translate-x-1'
                                    : `${darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-blue-400' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'} hover:translate-x-1`
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 mr-3.5 transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-current'}`} />
                                <span>{item.label}</span>
                                {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto">
                    <div className={`p-4 mb-4 rounded-2xl border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-br from-indigo-50 to-blue-50 border-blue-100'}`}>
                        <h4 className={`text-sm font-bold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Need Help?</h4>
                        <p className="text-xs text-gray-500 mb-3">Check our docs for support.</p>
                        <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">Documentation &rarr;</button>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-3 text-red-500 transition-colors rounded-xl hover:bg-red-50/10 hover:text-red-600 font-medium"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
