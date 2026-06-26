import React from 'react';
import { Lock, AlertTriangle, Trash2 } from 'lucide-react';

const SettingsSection = ({
    activeSection,
    profile,
    setProfile,
    security,
    setSecurity,
    system,
    wipeConfirm,
    setWipeConfirm,
    wiping,
    onWipe,
    darkMode
}) => {
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
        case 'danger':
            return (
                <div className="space-y-6">
                    {/* Wiping Full-Screen Overlay */}
                    {wiping && (
                        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-md flex flex-col items-center justify-center gap-6">
                            <div className="relative flex items-center justify-center">
                                <div className="w-20 h-20 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
                                <div className="absolute w-12 h-12 rounded-full border-4 border-rose-400/20 border-t-rose-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-white text-xl font-black tracking-tight">Wiping System Data</h3>
                                <p className="text-rose-300 text-sm font-medium">Deleting all records, wards, departments and non-admin users…</p>
                                <p className="text-gray-500 text-xs">Do not close this window.</p>
                            </div>
                            <div className="flex gap-1.5 mt-2">
                                {[0, 1, 2, 3, 4].map(i => (
                                    <div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce"
                                        style={{ animationDelay: `${i * 0.1}s` }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-4 animate-pulse">
                        <AlertTriangle className="text-rose-500 shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-rose-500">Irreversible Administration Event</h4>
                            <p className="text-xs text-rose-400 mt-1">
                                Wiping out system data will delete <strong>all</strong> issues, repairs, notifications, departments, wards, cities (ULBs), and all non-admin user accounts.
                                Once executed, the platform will require re-configuring city boundaries and departments from scratch.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black uppercase text-gray-500 mb-2">Confirmation Verification</label>
                            <p className="text-xs text-gray-400 mb-3">To proceed, please type <code className="font-mono bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-black">WIPE ALL DATA</code> below:</p>
                            <input
                                type="text"
                                value={wipeConfirm}
                                onChange={(e) => setWipeConfirm(e.target.value)}
                                disabled={wiping}
                                placeholder="Type 'WIPE ALL DATA'"
                                className={`w-full p-4 rounded-xl border-none ring-1 ring-rose-500/30 outline-none focus:ring-2 focus:ring-rose-500 font-bold transition-opacity ${wiping ? 'opacity-40 cursor-not-allowed' : ''} ${darkMode ? 'bg-gray-700/50 text-white' : 'bg-rose-50 text-gray-900'}`}
                            />
                        </div>
                        <button
                            type="button"
                            disabled={wipeConfirm !== 'WIPE ALL DATA' || wiping}
                            onClick={onWipe}
                            className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                                wiping
                                    ? 'bg-rose-900/50 text-rose-300 cursor-not-allowed'
                                    : wipeConfirm === 'WIPE ALL DATA'
                                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-500/20 active:scale-95'
                                        : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {wiping ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-rose-300/40 border-t-rose-300 rounded-full animate-spin" />
                                    Wiping System…
                                </>
                            ) : (
                                <>
                                    <Trash2 size={16} />
                                    Wipe Out System Data
                                </>
                            )}
                        </button>
                    </div>
                </div>
            );
        default:
            return <div className="p-8 text-center text-gray-500">Coming soon...</div>;
    }
};

export default SettingsSection;
