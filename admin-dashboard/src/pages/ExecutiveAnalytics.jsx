import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
    Send, 
    Bot, 
    User, 
    Sparkles, 
    History, 
    Search, 
    TrendingUp, 
    AlertCircle,
    ChevronRight,
    ExternalLink,
    Quote
} from 'lucide-react';
import { api } from '../utils/api';

const ExecutiveAnalytics = () => {
    const { darkMode } = useOutletContext();
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([
        { 
            role: 'assistant', 
            content: "Welcome, Commissioner. I am your RAG-powered City Assistant. You can ask me anything about the city's current state, such as 'What are the top recurring issues in Ward 5?' or 'Give me a summary of unresolved infrastructure problems.'",
            timestamp: new Date().toISOString()
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [sources, setSources] = useState([]);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!query.trim() || loading) return;

        const userMessage = { role: 'user', content: query, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMessage]);
        setQuery('');
        setLoading(true);

        try {
            const data = await api.post('/analytics/query', { query: userMessage.content });
            
            const assistantMessage = { 
                role: 'assistant', 
                content: data.summary, 
                timestamp: new Date().toISOString(),
                sources: data.sources 
            };
            
            setMessages(prev => [...prev, assistantMessage]);
            setSources(data.sources || []);
        } catch (err) {
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "I apologize, but I encountered an error while analyzing the city data. Please ensure the vector database is synchronized.",
                isError: true,
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-6">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className={`text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Executive <span className="text-violet-600">Analytics</span>
                    </h1>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Semantic RAG Intelligence Platform (Pilot Phase)
                    </p>
                </div>
                <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${darkMode ? 'bg-white/5 border-white/5 text-violet-400' : 'bg-violet-50 border-violet-100 text-violet-600'}`}>
                    <Sparkles size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">GPT-4o + PGVector Enabled</span>
                </div>
            </div>

            <div className="flex flex-1 gap-6 min-h-0">
                {/* Chat Interface */}
                <div className={`flex-[2] flex flex-col rounded-3xl border overflow-hidden ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`}>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                                    msg.role === 'user' 
                                        ? 'bg-violet-600 text-white' 
                                        : (darkMode ? 'bg-white/5 text-violet-400' : 'bg-violet-50 text-violet-600')
                                }`}>
                                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                                </div>
                                <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user'
                                            ? 'bg-violet-600 text-white'
                                            : (darkMode ? 'bg-gray-700/50 text-gray-200' : 'bg-gray-50 text-gray-800')
                                    } ${msg.isError ? 'border border-red-500/50 bg-red-500/10 text-red-500' : ''}`}>
                                        {msg.content.split('\n').map((line, li) => (
                                            <p key={li} className={li > 0 ? 'mt-2' : ''}>{line}</p>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-4 animate-pulse">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                                    <Bot size={20} className="text-violet-400" />
                                </div>
                                <div className="space-y-2">
                                    <div className={`h-10 w-64 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}></div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 italic">Analyzing City Pulse...</span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className={`p-4 border-t ${darkMode ? 'border-white/5 bg-gray-800/50' : 'border-gray-100 bg-gray-50/50'}`}>
                        <div className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ask about trends, ward reports, or infrastructure health..."
                                className={`w-full pl-6 pr-16 py-4 rounded-2xl border text-sm font-medium transition-all outline-none ${
                                    darkMode 
                                        ? 'bg-gray-900 border-white/5 text-white focus:border-violet-500/50' 
                                        : 'bg-white border-gray-200 text-gray-900 focus:border-violet-500 shadow-sm'
                                }`}
                            />
                            <button
                                type="submit"
                                disabled={!query.trim() || loading}
                                className={`absolute right-2 top-2 bottom-2 px-4 rounded-xl flex items-center justify-center transition-all ${
                                    query.trim() && !loading
                                        ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-600/20'
                                        : 'bg-gray-500/10 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar Context */}
                <div className="w-80 flex flex-col gap-6">
                    {/* Insights Box */}
                    <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="text-violet-500" size={18} />
                            <h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Live Context</h3>
                        </div>
                        <div className="space-y-4">
                            {sources.length > 0 ? sources.map((src, i) => (
                                <div key={i} className={`p-3 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-black text-violet-500 uppercase tracking-wider">{src.category}</span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                            src.status === 'Resolved' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                                        }`}>{src.status}</span>
                                    </div>
                                    <p className={`text-[11px] line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        ID: {src.id.slice(0, 8)}...
                                    </p>
                                    <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-gray-500">
                                        <ChevronRight size={12} />
                                        <span>Similarity: {(src.similarity * 100).toFixed(1)}%</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 opacity-40">
                                    <Quote size={24} className="mx-auto mb-2" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Sources will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Query Box */}
                    <div className={`p-6 rounded-3xl border flex-1 ${darkMode ? 'bg-gray-800 border-white/5' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`}>
                        <div className="flex items-center gap-2 mb-4">
                            <History className="text-violet-500" size={18} />
                            <h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Suggested Queries</h3>
                        </div>
                        <div className="space-y-2">
                            {[
                                "Top issues in Ward 5 this month",
                                "Summary of water leakage cases",
                                "Performance of waste management staff",
                                "Recent infrastructure alerts"
                            ].map((q, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setQuery(q)}
                                    className={`w-full text-left p-3 rounded-xl text-[11px] font-medium transition-all ${
                                        darkMode ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-violet-50 text-gray-600 hover:text-violet-600'
                                    }`}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExecutiveAnalytics;
