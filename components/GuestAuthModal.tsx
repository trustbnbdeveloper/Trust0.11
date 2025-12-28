import React, { useState } from 'react';
import { X, Mail, Lock, User, PartyPopper, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface GuestAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'LOGIN' | 'REGISTER';
}

export const GuestAuthModal: React.FC<GuestAuthModalProps> = ({ isOpen, onClose, initialMode = 'REGISTER' }) => {
    const { login } = useAuth();
    const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            // Log in as GUEST with a special "isFirstBooking" flag if registering
            // In a real app, this would be handled by the backend
            if (mode === 'REGISTER') {
                // Register logic
                login('guest@example.com', 'password', 'GUEST');
                // We'll handle the discount logic in the context or component consuming this
            } else {
                login('guest@example.com', 'password', 'GUEST');
            }

            setIsLoading(false);
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-white dark:bg-trust-darkcard w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header / Banner */}
                <div className="bg-trust-blue text-white p-6 text-center relative overflow-hidden">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {mode === 'REGISTER' ? (
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-yellow-400 text-trust-blue px-3 py-1 rounded-full text-xs font-bold mb-3 shadow-lg">
                                <PartyPopper size={14} />
                                <span>Get 10% OFF</span>
                            </div>
                            <h2 className="text-2xl font-serif font-bold mb-2">Join TrustBnB</h2>
                            <p className="text-blue-100 text-sm">Create an account and save 10% on your first Albanian getaway.</p>
                        </div>
                    ) : (
                        <div className="relative z-10">
                            <h2 className="text-2xl font-serif font-bold mb-2">Welcome Back</h2>
                            <p className="text-blue-100 text-sm">Sign in to view your trips and saved properties.</p>
                        </div>
                    )}

                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-trust-blue via-blue-600 to-blue-900 opacity-50"></div>
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </div>

                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'REGISTER' && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-trust-blue/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-trust-blue/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-trust-blue/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-trust-blue text-white py-3 rounded-xl font-bold text-lg hover:bg-trust-blue/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {mode === 'REGISTER' ? 'Create Account' : 'Sign In'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {mode === 'REGISTER' ? 'Already have an account? ' : 'First time here? '}
                            <button
                                onClick={() => setMode(mode === 'REGISTER' ? 'LOGIN' : 'REGISTER')}
                                className="text-trust-blue font-bold hover:underline"
                            >
                                {mode === 'REGISTER' ? 'Sign In' : 'Register for 10% Off'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
