import React from 'react';

const DepartmentCard = ({ title, value, icon: Icon, color, darkMode }) => {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-500/10',
            text: 'text-blue-500'
        },
        green: {
            bg: 'bg-green-500/10',
            text: 'text-green-500'
        },
        purple: {
            bg: 'bg-purple-500/10',
            text: 'text-purple-500'
        }
    };

    const classes = colorClasses[color] || colorClasses.blue;

    return (
        <div className={`p-8 rounded-3xl shadow-xl border-none transition-all hover:translate-y-[-4px] ${darkMode ? 'bg-gray-800/50 backdrop-blur-xl border-white/5' : 'bg-white shadow-gray-200/50'}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-gray-500">{title}</p>
                    <p className={`text-4xl font-black mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                </div>
                <div className={`p-5 rounded-2xl ${classes.bg} ${classes.text}`}>
                    <Icon size={32} />
                </div>
            </div>
        </div>
    );
};

export default DepartmentCard;
