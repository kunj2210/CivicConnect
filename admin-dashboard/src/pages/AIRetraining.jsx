import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { BrainCircuit, CheckCircle, AlertTriangle } from 'lucide-react';

const AIRetraining = () => {
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const response = await api.get('/reports/retraining-queue');
                setQueue(response);
                setLoading(false);
            } catch (err) {
                setError(err.message || 'Failed to fetch AI feedback queue');
                setLoading(false);
            }
        };
        fetchQueue();
    }, []);

    if (loading) return <div className="p-8 font-bold text-gray-500">Loading AI Data...</div>;
    if (error) return <div className="p-8 text-red-500 font-bold">Error: {error}</div>;

    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <BrainCircuit className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-black text-gray-900">AI Retraining Queue</h1>
            </div>
            
            <p className="text-gray-500 mb-8 font-medium">
                This table logs instances where human admins corrected the AI's predictions. This dataset actively trains future iterations of the model.
            </p>

            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 font-black text-xs text-gray-400 uppercase tracking-widest border-b">
                            <th className="p-4">Date</th>
                            <th className="p-4">Issue ID</th>
                            <th className="p-4">Original (AI)</th>
                            <th className="p-4">Corrected (Human)</th>
                            <th className="p-4">Image</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {queue.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-sm font-medium text-gray-500">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-sm font-mono text-gray-900">
                                    {item.issue_id.substring(0, 8)}...
                                </td>
                                <td className="p-4 text-sm font-bold text-red-500 line-through">
                                    {item.original_category}
                                </td>
                                <td className="p-4 text-sm font-black text-green-600">
                                    {item.corrected_category}
                                </td>
                                <td className="p-4">
                                    {item.media_url ? (
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border">
                                           {item.media_url.startsWith('blob:') ? <span className="text-xs text-blue-500 p-1">Uploaded</span> : <img src={`${import.meta.env.VITE_MINIO_ENDPOINT}/civic-connect/${item.media_url}`} alt="Evidence" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }}/>}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400 font-bold uppercase">No Image</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-600">
                                        <CheckCircle className="w-3 h-3" /> Processed
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {queue.length === 0 && (
                    <div className="p-12 text-center text-gray-400 font-bold flex flex-col items-center">
                        <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                        No misclassifications logged yet. Model is performing well!
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIRetraining;
