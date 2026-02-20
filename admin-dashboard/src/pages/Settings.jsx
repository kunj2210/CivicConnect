import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Bell, Shield, Globe, Database, Save } from 'lucide-react';

const Settings = () => {
    const { darkMode } = useOutletContext();

    const sections = [
        { title: 'Profile Settings', icon: User, desc: 'Manage your personal information and account details.' },
        { title: 'Notifications', icon: Bell, desc: 'Configure how you receive alerts and system updates.' },
        { title: 'Security & Access', icon: Shield, desc: 'Manage password, 2FA and role-based permissions.' },
        { title: 'Regional & Language', icon: Globe, desc: 'Set your preferred language and time zone.' },
        { title: 'System & API', icon: Database, desc: 'Backend connection settings and API key management.' },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
                <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Configure system preferences and account management.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    {sections.map((section, i) => (
                        <div key={i} className={`p-5 rounded-2xl shadow-sm border cursor-pointer hover:border-blue-500/50 transition-all ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-white/20'}`}>
                            <div className="flex items-start">
                                <div className={`p-3 rounded-xl bg-blue-500/10 text-blue-500 mr-4`}>
                                    <section.icon size={22} />
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{section.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{section.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`p-8 rounded-2xl shadow-lg border space-y-6 flex flex-col ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-white/20'}`}>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>General Settings</h2>

                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Organization Name</label>
                            <input
                                type="text"
                                defaultValue="CivicConnect Municipal Corp"
                                className={`w-full p-3 rounded-xl border-none ring-1 ring-gray-100 dark:ring-gray-700 outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Support Email</label>
                            <input
                                type="email"
                                defaultValue="support@civicconnect.gov"
                                className={`w-full p-3 rounded-xl border-none ring-1 ring-gray-100 dark:ring-gray-700 outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'}`}
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                            <div>
                                <h4 className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Dark Mode Preference</h4>
                                <p className="text-xs text-gray-500">Sync app theme with system settings</p>
                            </div>
                            <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                            </div>
                        </div>
                    </div>

                    <button className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/30 transition-all font-bold w-full">
                        <Save size={20} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
