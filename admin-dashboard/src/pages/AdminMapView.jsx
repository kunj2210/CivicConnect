import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, Calendar } from 'lucide-react';

// Status-based icons
const getIcon = (status, darkMode) => {
    let color = '#3B82F6'; // Default Blue
    if (status === 'Resolved') color = '#10B981'; // Green
    if (status === 'In Progress') color = '#F59E0B'; // Amber
    if (status === 'Pending') color = '#EF4444'; // Red

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9z"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
        </svg>
    `;

    return L.divIcon({
        html: svg,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

const AdminMapView = () => {
    const { darkMode } = useOutletContext();
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [center, setCenter] = useState([22.5540, 72.9299]);

    useEffect(() => {
        fetch('http://localhost:5000/api/reports')
            .then(res => res.json())
            .then(data => {
                setIssues(data);
                if (data.length > 0 && data[0].location) {
                    setCenter([data[0].location.coordinates[1], data[0].location.coordinates[0]]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Admin map error:', err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Admin Intelligence Map...</div>;

    return (
        <div className="h-full flex flex-col space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Admin Strategic Map</h1>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Global view of all municipal infrastructure reports.</p>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {issues.map((issue) => {
                        if (!issue.location) return null;
                        const pos = [issue.location.coordinates[1], issue.location.coordinates[0]];
                        return (
                            <Marker
                                key={issue.report_id}
                                position={pos}
                                icon={getIcon(issue.status, darkMode)}
                            >
                                <Popup className="custom-popup">
                                    <div className="p-1 min-w-[220px] space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm leading-tight">{issue.category}</h3>
                                                <p className="text-[10px] text-gray-500 mt-0.5">#{issue.report_id.slice(0, 8)}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${issue.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                                                    issue.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-rose-100 text-rose-700'
                                                }`}>
                                                {issue.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-[11px] text-gray-600 bg-gray-50 p-2 rounded-lg">
                                            <Calendar size={12} className="text-gray-400" />
                                            {new Date(issue.timestamp).toLocaleDateString()}
                                        </div>

                                        <button
                                            onClick={() => navigate(`/admin/issues/${issue.report_id}`)}
                                            className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                                        >
                                            <Eye size={14} />
                                            Admin Inspect
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
};

export default AdminMapView;
