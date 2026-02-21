import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Hexagon, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const isDark = localStorage.getItem('theme') === 'dark';
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const userData = await login(credentials.email, credentials.password);
        if (userData) {
            if (userData.role === 'Admin') {
                navigate('/admin/dashboard');
            } else if (userData.role === 'Authority') {
                navigate('/authority/dashboard');
            } else {
                setError('Unknown user role. Please contact support.');
                setIsLoading(false);
            }
        } else {
            setError('Invalid email or password. Please use official credentials.');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            {/* Left Side - Hero / Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 justify-center items-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
                    alt="City Background"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="relative z-20 text-white max-w-lg px-8">
                    <div className="mb-6 flex items-center gap-2">
                        <div className="p-2 bg-white rounded-2xl shadow-xl">
                            <img src="/src/assets/logo.png" className="w-12 h-12 object-contain" alt="Logo" />
                        </div>
                        <h1 className="text-4xl font-extrabold mb-2 text-white">
                            Civic Connect
                        </h1>
                    </div>
                    <p className="text-gray-300 mb-8 font-medium">Sign in to manage your city's pulse.</p>
                    <p className="text-blue-100 text-lg leading-relaxed">
                        Streamline civic issue reporting, track resolutions in real-time, and make data-driven decisions for your municipality.
                    </p>

                    <div className="mt-12 flex gap-4 text-sm font-medium text-blue-200">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400" /> Real-time Tracking
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400" /> Geospatial Analytics
                        </div>
                    </div>
                </div>

                {/* Decoration Circles */}
                <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-blue-500 opacity-20 blur-3xl z-10" />
                <div className="absolute top-12 right-12 w-32 h-32 rounded-full bg-indigo-500 opacity-20 blur-2xl z-10" />
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Please enter your details to access the dashboard.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500 flex items-center animate-shake">
                                <span className="mr-2">⚠️</span> {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={credentials.email}
                                        onChange={handleChange}
                                        className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-colors outline-none text-gray-900 dark:text-white"
                                        placeholder="admin@civicconnect.gov"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={credentials.password}
                                        onChange={handleChange}
                                        className="block w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-colors outline-none text-gray-900 dark:text-white"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-gray-800 rounded" />
                                <label htmlFor="remember-me" className="ml-2 block text-gray-600 dark:text-gray-400">Remember me</label>
                            </div>
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex items-center justify-center px-4 py-3.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
                        >
                            {isLoading ? 'Signing in...' : <span className="flex items-center">Sign In <ArrowRight className="ml-2 w-4 h-4" /></span>}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-xs text-gray-400">Official Admin Access: admin@civicconnect.gov</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
