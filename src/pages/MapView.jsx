import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { mockIssues } from '../data/mockData';
import L from 'leaflet';

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
    // Default center (e.g., New Delhi or generic city center)
    const center = [28.6139, 77.2090];

    return (
        <div className="h-full flex flex-col space-y-4">
            <h1 className="text-2xl font-bold text-gray-800">Geospatial Issue Tracker</h1>
            <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden border">
                <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* 
                        Note: Mock data doesn't have lat/lng yet, so we will generate random offsets 
                        around the center for demonstration purposes.
                    */}
                    {mockIssues.map((issue, index) => {
                        // Generate slight random offset for demo
                        const lat = center[0] + (Math.random() - 0.5) * 0.1;
                        const lng = center[1] + (Math.random() - 0.5) * 0.1;

                        return (
                            <Marker key={issue.id} position={[lat, lng]}>
                                <Popup>
                                    <div className="p-1">
                                        <h3 className="font-bold text-sm">{issue.title}</h3>
                                        <p className="text-xs text-gray-600">{issue.category}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${issue.priority === 'High' ? 'bg-red-100 text-red-800' :
                                            issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {issue.priority}
                                        </span>
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
