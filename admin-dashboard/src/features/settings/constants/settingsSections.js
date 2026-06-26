import { User, Bell, Shield, Globe, Database, AlertTriangle } from 'lucide-react';

export const SETTINGS_SECTIONS = [
    { id: 'profile', title: 'Admin Profile', icon: User, desc: 'Your identity across the municipal network.' },
    { id: 'notifications', title: 'Global Alerts', icon: Bell, desc: 'Master notification controls for system events.' },
    { id: 'security', title: 'Security & Auth', icon: Shield, desc: 'Manage credentials and account protection.' },
    { id: 'regional', title: 'Geo & Language', icon: Globe, desc: 'Set operational timezone and localization.' },
    { id: 'system', title: 'Core System', icon: Database, desc: 'Advanced API and backend integration nodes.' },
    { id: 'danger', title: 'Danger Zone', icon: AlertTriangle, desc: 'Destructive system-wide maintenance.' },
];
