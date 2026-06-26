import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../utils/api';

export const useAdminSettings = () => {
    const { user, updateUser, logout } = useAuth();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');

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

    // Danger Zone state
    const [wipeConfirm, setWipeConfirm] = useState('');
    const [wiping, setWiping] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (activeSection === 'profile') {
                const updatedUserData = await api.patch(`/auth/update-profile/${user.id}`, {
                    name: profile.name
                });
                updateUser(updatedUserData);
            } else if (activeSection === 'security' && security.newPassword) {
                if (security.newPassword !== security.confirmPassword) {
                    alert("Passwords do not match!");
                    setSaving(false);
                    return;
                }
                await api.post('/auth/change-password', {
                    currentPassword: security.currentPassword,
                    newPassword: security.newPassword
                });
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

    const handleWipeData = async () => {
        if (wipeConfirm !== 'WIPE ALL DATA') return;
        if (!window.confirm('WARNING: THIS IS YOUR FINAL CONFIRMATION. Are you absolutely sure you want to delete all municipal system data, departments, wards, and non-admin users?')) return;
        
        try {
            setWiping(true);
            await api.post('/system/wipe-data');
            alert('System wiped successfully! Logging you out to reset administrative session.');
            logout();
        } catch (err) {
            alert('Wipe failed: ' + err.message);
        } finally {
            setWiping(false);
        }
    };

    return {
        profile,
        setProfile,
        notifications,
        setNotifications,
        security,
        setSecurity,
        regional,
        setRegional,
        system,
        setSystem,
        wipeConfirm,
        setWipeConfirm,
        wiping,
        saving,
        saved,
        activeSection,
        setActiveSection,
        handleSave,
        handleWipeData
    };
};
