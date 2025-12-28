import React, { useState } from 'react';
import { X, Mail, Lock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: 'LOGIN' | 'SIGNUP';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'LOGIN' }) => {
    const { login, signup } = useAuth();
    const [view, setView] = useState<'LOGIN' | 'SIGNUP'>(initialView);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (view === 'LOGIN') {
                await login(email, password);
            } else {
                await signup(name, email, password);
            }
            onClose();
        } catch (err) {
            setError('Invalid credentials or error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {view === 'LOGIN' ? 'Welcome back' : 'Create an account'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-1 m-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <button
                        onClick={() => setView('LOGIN')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${view === 'LOGIN' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => setView('SIGNUP')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${view === 'SIGNUP' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Partner Sign Up
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {view === 'SIGNUP' && (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-trust-blue hover:bg-trust-blue/90 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-wait mt-4"
                    >
                        {loading ? 'Processing...' : (view === 'LOGIN' ? 'Log In' : 'Sign Up')}
                    </button>

                    <div className="text-center pt-2">
                        <span className="text-xs text-gray-400">Restricted to Property Owners & Admins</span>
                    </div>
                </form>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center text-xs text-gray-400">
                    Protected by TrustBnB Security. By continuing, you agree to our Terms.
                </div>
            </div>
        </div>
    );
};
