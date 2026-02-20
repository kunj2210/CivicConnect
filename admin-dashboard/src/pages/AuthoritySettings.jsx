import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Bell, Shield, Globe, Save, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthoritySettings = () => {
    const { darkMode } = useOutletContext();
    const { user, updateUser } = useAuth();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [profile, setProfile] = useState({
        name: user?.name || 'Officer J. Doe',
        email: user?.email || 'authority@civicconnect.gov',
        role: user?.role || 'Field Authority',
        unit: 'West Zone Operations'
    });

    const [notifications, setNotifications] = useState({
        newTasks: true,
        urgentEscalations: true,
    });

    const [security, setSecurity] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const sections = [
        { id: 'profile', title: 'My Profile', icon: User, desc: 'Manage your field officer identity.' },
        { id: 'notifications', title: 'Task Alerts', icon: Bell, desc: 'Configure how you get notified of new reports.' },
        { id: 'security', title: 'Password & Security', icon: Shield, desc: 'Update your login credentials.' },
        { id: 'regional', title: 'Regional Set', icon: Globe, desc: 'Local time and language preferences.' },
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
                                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-50 text-gray-900'}`}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Authority Unit</label>
                                <input
                                    type="text"
                                    value={profile.unit}
                                    onChange={(e) => setProfile({ ...profile, unit: e.target.value })}
                                    className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-50 text-gray-900'}`}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4">
                            <Lock className="text-indigo-500 shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-indigo-500">Update Authority Password</h4>
                                <p className="text-xs text-indigo-400 mt-1">Changing your password will require Re-Login on all devices.</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Current Password</label>
                                <input
                                    type="password"
                                    value={security.currentPassword}
                                    onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                                    className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-50 text-gray-900'}`}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-500 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={security.newPassword}
                                        onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                                        className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-50 text-gray-900'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-500 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={security.confirmPassword}
                                        onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                                        className={`w-full p-4 rounded-xl border-none ring-1 ring-gray-200 dark:ring-white/10 outline-none focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-50 text-gray-900'}`}
                                    />
                                </div>
                            </div>
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
                <h1 className={`text-4xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Operational Settings</h1>
                <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Personalize your work dashboard and security.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-3">
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${activeSection === section.id
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                                : darkMode ? 'bg-gray-800/50 border-white/5 hover:border-indigo-500/50' : 'bg-white border-gray-100 hover:border-indigo-500/50 shadow-sm'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${activeSection === section.id ? 'bg-white/20' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                    <section.icon size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">{section.title}</h3>
                                    <p className={`text-[10px] ${activeSection === section.id ? 'text-indigo-100' : 'text-gray-500'}`}>{section.desc}</p>
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
                        className={`mt-8 py-4 rounded-2xl shadow-xl transition-all font-black ${saved ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                    >
                        {saving ? 'UPDATING...' : saved ? 'Operations Profile Updated!' : 'Apply Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthoritySettings;
