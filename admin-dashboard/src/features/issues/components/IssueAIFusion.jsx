import React from 'react';
import { Zap, AlertCircle, FileText, Mic } from 'lucide-react';

const extractPredictions = (data) => {
    if (!data) return [];
    let raw = Array.isArray(data) ? (data.length === 1 ? data[0] : data) : data;
    let list = raw.top_3 || raw.predictions || raw.issues || (Array.isArray(raw) ? raw : null);
    if (!list && raw.citizen_requests && Array.isArray(raw.citizen_requests)) {
        list = raw.citizen_requests[0]?.category;
    }
    if (!list) list = [raw];
    return Array.isArray(list) ? list.map(item => ({
        label: item.class || item.category || item.label || item.name || 'Unknown',
        score: Number(item.confidence || item.score || item.probability || 0)
    })) : [];
};

const IssueAIFusion = ({ report, darkMode }) => {
    return (
        <div className={`rounded-2xl shadow-sm border p-6 space-y-6 ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white'}`}>
            <div className="flex items-center justify-between border-b pb-4">
                <h2 className={`font-bold flex items-center ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    <Zap className="w-5 h-5 mr-2 text-amber-500" />
                    Multimodal Data Fusion Analysis
                </h2>
                {report.needs_human_review && (
                    <span className="flex items-center px-3 py-1 bg-red-500/20 text-red-500 text-[10px] font-black uppercase rounded-full animate-pulse border border-red-500/30">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        High Conflict - Manual Review Required
                    </span>
                )}
            </div>

            {/* Winning Fusion Result */}
            <div className={`p-5 rounded-2xl border-2 ${report.needs_human_review ? 'border-red-500/20 bg-red-500/5' : 'border-blue-500/20 bg-blue-500/5'}`}>
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">Final Fused Verdict</p>
                        <h3 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{report.fusion_final_category || 'Calculating...'}</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Aggregated Confidence</p>
                        <span className="text-3xl font-black text-blue-500">{(report.fusion_confidence_score * 100).toFixed(1)}%</span>
                    </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ${report.needs_human_review ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${report.fusion_confidence_score * 100}%` }}
                    />
                </div>
            </div>

            {/* Modal Confidence Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Image Modality (Top 3) */}
                <div className="space-y-4">
                    <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <FileText className="w-3 h-3 mr-1 text-blue-500" /> Image Preds (50% Weight)
                    </div>
                    <div className="space-y-3">
                        {extractPredictions(report.ai_image_top3).length > 0 ? (extractPredictions(report.ai_image_top3).map((p, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{p.label}</span>
                                    <span className="text-blue-500">{(p.score * 100).toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-900 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-500/50 h-full" style={{ width: `${p.score * 100}%` }} />
                                </div>
                            </div>
                        ))) : (
                            <p className="text-xs italic text-gray-500">No image data processed</p>
                        )}
                    </div>
                </div>

                {/* Text Modality (Top 3) */}
                <div className="space-y-4">
                    <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Mic className="w-3 h-3 mr-1 text-emerald-500" /> Text Analysis (20% Weight)
                    </div>
                    <div className="space-y-3">
                        {extractPredictions(report.ai_text_top3).length > 0 ? (extractPredictions(report.ai_text_top3).map((p, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{p.label}</span>
                                    <span className="text-emerald-500">{(p.score * 100).toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-900 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500/50 h-full" style={{ width: `${p.score * 100}%` }} />
                                </div>
                            </div>
                        ))) : (
                            <p className="text-xs italic text-gray-500">No text data processed</p>
                        )}
                    </div>
                </div>

                {/* Audio Modality (Top 3) */}
                <div className="space-y-4">
                    <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Mic className="w-3 h-3 mr-1 text-purple-500" /> Audio Mood (30% Weight)
                    </div>
                    <div className="space-y-3">
                        {extractPredictions(report.ai_audio_top3).length > 0 ? (extractPredictions(report.ai_audio_top3).map((p, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{p.label}</span>
                                    <span className="text-purple-500">{(p.score * 100).toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-900 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-purple-500/50 h-full" style={{ width: `${p.score * 100}%` }} />
                                </div>
                            </div>
                        ))) : (
                            <p className="text-xs italic text-gray-500">No audio data processed</p>
                        )}
                    </div>
                </div>
            </div>

            {report.description && (
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-black/20 border-white/5 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Original Citizen Description</p>
                    <p className="text-sm italic">"{report.description}"</p>
                </div>
            )}
        </div>
    );
};

export default IssueAIFusion;
