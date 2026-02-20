import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Bell, Search, Moon, Sun } from 'lucide-react';

const DashboardLayout = () => {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    return (
        <div className={`flex min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
            <Sidebar darkMode={darkMode} />
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Background Blobs for specific pages if needed */}
                <div className={`absolute top-0 left-0 w-full h-64 bg-gradient-to-b ${darkMode ? 'from-blue-900/20' : 'from-blue-50/50'} to-transparent -z-10`} />

                <header className={`flex justify-between items-center py-4 px-8 backdrop-blur-md border-b z-10 sticky top-0 transition-colors duration-300 ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}`}>
                    <div className="flex items-center w-96">
                        <div className="relative w-full hidden md:block">
                            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                            <input
                                type="text"
                                placeholder="Global Search..."
                                className={`w-full pl-10 pr-4 py-2 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-50 text-gray-800'}`}
                            />
                        </div>
                        <button className="text-gray-500 focus:outline-none md:hidden p-2">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>

                    <div className={`flex items-center gap-4 pl-6 border-l ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            title="Toggle Theme"
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button className="relative text-gray-500 hover:text-blue-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className={`text-sm font-bold leading-none ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Alex Morgan</p>
                                <p className="text-xs text-gray-500 mt-1">Administrator</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 cursor-pointer hover:scale-105 transition-transform">
                                AM
                            </div>
                        </div>
                    </div>
                </header>

                <main className={`flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 scroll-smooth relative transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    <Outlet context={{ darkMode }} />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
