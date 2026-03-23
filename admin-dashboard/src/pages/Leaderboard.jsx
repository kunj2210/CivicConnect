import { useState, useEffect } from 'react';
import { Trophy, Medal, Star, User, ShieldCheck } from 'lucide-react';
import { api } from '../utils/api';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get('/users/leaderboard');
                setLeaderboard(response);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const getRankBadge = (index) => {
        if (index === 0) return <Trophy className="text-yellow-500" size={20} />;
        if (index === 1) return <Medal className="text-gray-400" size={20} />;
        if (index === 2) return <Medal className="text-amber-600" size={20} />;
        return <span className="font-bold text-gray-400">{index + 1}</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col">
                <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Community Leaderboard</h2>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Recognizing our most active civic contributors.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {leaderboard.slice(0, 3).map((citizen, index) => (
                    <div key={citizen.id} className={`p-6 border-2 relative overflow-hidden bg-white dark:bg-gray-900 ${
                        index === 0 ? 'border-yellow-500/30' : index === 1 ? 'border-gray-400/30' : 'border-amber-600/30'
                    }`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            {index === 0 ? <Trophy size={80} /> : <Medal size={80} />}
                        </div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-12 h-12 flex items-center justify-center rounded-none border-2 ${
                                index === 0 ? 'bg-yellow-50 border-yellow-500 text-yellow-600' : 
                                index === 1 ? 'bg-gray-50 border-gray-400 text-gray-500' : 
                                'bg-amber-50 border-amber-600 text-amber-700'
                            }`}>
                                <span className="text-xl font-black">{index + 1}</span>
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 dark:text-white truncate max-w-[150px]">
                                    {citizen.phone || citizen.email || 'Anonymous Hero'}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                        {citizen.green_credits} XP
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Rank</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Citizen</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500 text-center">Badges</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Contribution XP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {leaderboard.map((citizen, index) => (
                            <tr key={citizen.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center justify-center w-8 h-8">
                                        {getRankBadge(index)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500 border border-gray-200 dark:border-gray-700">
                                            <User size={16} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                                            {citizen.phone || citizen.email || `Citizen #${citizen.id.slice(0, 4)}`}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        {citizen.achievements && citizen.achievements.length > 0 ? (
                                            citizen.achievements.slice(0, 3).map((badge, bIdx) => (
                                                <span key={bIdx} title={badge.name} className="text-lg cursor-help">
                                                    {badge.icon}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400 font-medium italic">No badges yet</span>
                                        )}
                                        {citizen.achievements?.length > 3 && (
                                            <span className="text-[10px] font-bold text-gray-400 ml-1">
                                                +{citizen.achievements.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black tracking-widest border border-blue-100 dark:border-blue-800/50">
                                        {citizen.green_credits} XP
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {leaderboard.length === 0 && (
                <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <ShieldCheck className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500 font-medium">No community activity recorded yet.</p>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
