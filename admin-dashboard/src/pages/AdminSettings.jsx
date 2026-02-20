import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Bell, Shield, Globe, Database, Save, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSettings = () => {
    const { darkMode } = useOutletContext();
    const { user, updateUser } = useAuth();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [profile, setProfile] = useState({
        name: user?.name || 'Administrator',
        email: user?.email || 'admin@civicconnect.gov',
        role: user?.role || 'Administrator',
    });

    const [notifications, setNotifications] = useState({
        systemAlerts: true,
        emailNotifications: true,
        issueUpdates: true,
    });

    const [security, setSecurity] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [regional, setRegional] = useState({
        language: 'English (US)',
        timezone: 'GMT+05:30 IST',
    });

    const [system, setSystem] = useState({
        apiKey: 'sk_admin_live_v8...hidden',
        webhookUrl: 'https://api.civicconnect.gov/hooks/admin',
    });

    const sections = [
        { id: 'profile', title: 'Admin Profile', icon: User, desc: 'Your identity across the municipal network.' },
        { id: 'notifications', title: 'Global Alerts', icon: Bell, desc: 'Master notification controls for system events.' },
        { id: 'security', title: 'Security & Auth', icon: Shield, desc: 'Manage credentials and account protection.' },
        { id: 'regional', title: 'Geo & Language', icon: Globe, desc: 'Set operational timezone and localization.' },
        { id: 'system', title: 'Core System', icon: Database, desc: 'Advanced API and backend integration nodes.' },
    ];

    const [activeSection, setActiveSection] = useState('profile');

    const handleSave = async () => {
        setSaving(true);
        try {
            if (activeSection === 'profile') {
                const response = await fetch(`http://localhost:5000/api/auth/update-profile/${user.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: profile.name }),
                });
                if (!response.ok) throw new Error('Failed to update profile');
                const updatedUserData = await response.json();
                updateUser(updatedUserData);
            } else if (activeSection === 'security' && security.newPassword) {
                if (security.newPassword !== security.confirmPassword) {
                    alert("Passwords do not match!");
                    setSaving(false);
                    return;
                }
                const response = await fetch(`http://localhost:5000/api/auth/update-password/${user.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        currentPassword: security.currentPassword,
                        newPassword: security.newPassword
                    }),
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update password');
                }
                setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const renderSectionContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Admin Name</label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-50 text-gray-900'}`}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    readOnly
                                    className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 opacity-60 ${darkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-50 text-gray-900'}`}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                            <Lock className="text-blue-500 shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-blue-500">Change Admin Password</h4>
                                <p className="text-xs text-blue-400 mt-1">Ensure your password is at least 12 characters and includes symbols.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Current Admin Password</label>
                                <input
                                    type="password"
                                    value={security.currentPassword}
                                    onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                                    className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-50 text-gray-900'}`}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-500 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={security.newPassword}
                                        onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                                        className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-50 text-gray-900'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-500 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={security.confirmPassword}
                                        onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                                        className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-50 text-gray-900'}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'system':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-500 mb-2">Admin API Key</label>
                            <input
                                type="text"
                                value={system.apiKey}
                                readOnly
                                className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 opacity-70 ${darkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-50 text-gray-900'}`}
                            />
                        </div>
                    </div>
                );
            default:
                return <div className="p-8 text-center text-gray-500">Coming soon...</div>;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className={`text-4xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Admin Settings</h1>
                <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage system-wide parameters and admin security.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-3">
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${activeSection === section.id
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                                : darkMode ? 'bg-gray-800/50 border-white/5 hover:border-blue-500/50' : 'bg-white border-gray-100 hover:border-blue-500/50 shadow-sm'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${activeSection === section.id ? 'bg-white/20' : 'bg-blue-500/10 text-blue-500'}`}>
                                    <section.icon size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">{section.title}</h3>
                                    <p className={`text-[10px] ${activeSection === section.id ? 'text-blue-100' : 'text-gray-500'}`}>{section.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`lg:col-span-2 p-8 rounded-3xl shadow-xl border-none flex flex-col ${darkMode ? 'bg-gray-800/50' : 'bg-white shadow-gray-200/50'}`}>
                    <h2 className={`text-xl font-black mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{sections.find(s => s.id === activeSection)?.title}</h2>
                    <div className="flex-1">{renderSectionContent()}</div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`mt-8 py-4 rounded-2xl shadow-xl transition-all font-black ${saved ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                        {saving ? 'Processing...' : saved ? 'Admin Config Updated!' : 'Save Admin Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
