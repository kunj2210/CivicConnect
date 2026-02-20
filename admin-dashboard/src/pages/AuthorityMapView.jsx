import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const AuthorityMapView = () => {
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
                console.error('Authority map error:', err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Operations Map...</div>;

    return (
        <div className="h-full flex flex-col space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Field Operations Map</h1>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Operational view of active civic issues in the field.</p>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {issues.map((issue) => {
                        if (!issue.location) return null;
                        const pos = [issue.location.coordinates[1], issue.location.coordinates[0]];
                        return (
                            <Marker key={issue.report_id} position={pos}>
                                <Popup className="custom-popup">
                                    <div className="p-2 min-w-[200px] space-y-3">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-900">{issue.category}</h3>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700">
                                                {issue.status}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/authority/issues/${issue.report_id}`)}
                                            className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                                        >
                                            <Eye size={14} />
                                            View Task
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

export default AuthorityMapView;
