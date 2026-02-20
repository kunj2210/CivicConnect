import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, Tag, Calendar } from 'lucide-react';

// Fix for default marker icon not showing
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapView = () => {
    const { darkMode } = useOutletContext();
    const navigate = useNavigate();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Default center (e.g., Delhi area or detected from first report)
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
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Initializing Map Engine...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Map Error: {error}</div>;

    return (
        <div className="h-full flex flex-col space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Live Issue Map</h1>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Real-time geospatial distribution of civic reports.</p>
                </div>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        Live Updates
                    </span>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {issues.map((issue) => {
                        if (!issue.location) return null;
                        const pos = [issue.location.coordinates[1], issue.location.coordinates[0]];

                        return (
                            <Marker key={issue.report_id} position={pos}>
                                <Popup className="custom-popup">
                                    <div className="p-2 min-w-[200px] space-y-3">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-900">{issue.category}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${issue.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                                issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {issue.status}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Calendar className="w-3 h-3 mr-1.5" />
                                                {new Date(issue.timestamp).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <AlertCircle className="w-3 h-3 mr-1.5" />
                                                ID: {issue.report_id.slice(0, 8)}...
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/dashboard/issues/${issue.report_id}`)}
                                            className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                                        >
                                            <Eye size={14} />
                                            View Full Details
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

export default MapView;
