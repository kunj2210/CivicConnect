import { useState, useEffect } from 'react';
import { api } from '../../../utils/api';

export const useAdminJurisdictions = () => {
    const [activeTab, setActiveTab] = useState('wards'); // 'wards' or 'ulbs'
    const [wards, setWards] = useState([]);
    const [ulbs, setUlbs] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedUlb, setSelectedUlb] = useState('');
    const [drawnPoints, setDrawnPoints] = useState([]); // [[lat, lng], ...]
    const [mapCenter] = useState([22.5540, 72.9299]); // Anand default center

    const [showHelp, setShowHelp] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [wardsData, ulbsData, deptsData] = await Promise.all([
                api.get('/system/wards'),
                api.get('/system/ulb-boundaries'),
                api.get('/departments')
            ]);
            setWards(wardsData);
            setUlbs(ulbsData);
            setDepartments(deptsData);
        } catch (error) {
            console.error('Failed to fetch jurisdictional data:', error);
            alert('Failed to load data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMapClick = (lat, lng) => {
        setDrawnPoints(prev => [...prev, [lat, lng]]);
    };

    const handleUndo = () => {
        setDrawnPoints(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        setDrawnPoints([]);
    };

    const handleCreateJurisdiction = async (e) => {
        e.preventDefault();
        if (!name) return alert('Name is required');
        if (drawnPoints.length < 3) return alert('Please mark at least 3 points on the map to define the boundary.');

        try {
            if (activeTab === 'wards') {
                if (!selectedDept) return alert('Please assign a department to the ward');
                await api.post('/system/wards', {
                    name,
                    dept_id: selectedDept,
                    ulb_id: selectedUlb ? parseInt(selectedUlb) : null,
                    boundaryCoordinates: drawnPoints
                });
            } else {
                await api.post('/system/ulb-boundaries', {
                    name,
                    boundaryCoordinates: drawnPoints
                });
            }

            setName('');
            setDrawnPoints([]);
            setSelectedDept('');
            setSelectedUlb('');
            fetchData();
            alert(`${activeTab === 'wards' ? 'Ward' : 'City (ULB)'} created successfully!`);
        } catch (err) {
            alert('Failed to save boundary: ' + err.message);
        }
    };

    return {
        activeTab,
        setActiveTab,
        wards,
        ulbs,
        departments,
        loading,
        name,
        setName,
        selectedDept,
        setSelectedDept,
        selectedUlb,
        setSelectedUlb,
        drawnPoints,
        setDrawnPoints,
        mapCenter,
        showHelp,
        setShowHelp,
        fetchData,
        handleMapClick,
        handleUndo,
        handleClear,
        handleCreateJurisdiction
    };
};
