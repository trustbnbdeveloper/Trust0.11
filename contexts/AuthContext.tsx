import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    toggleWishlist: (propertyId: string) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapSupabaseUserToAppUser = (sbUser: any): User => {
    const id = sbUser?.id || `U_${Date.now()}`;
    const name = sbUser?.user_metadata?.name || sbUser?.email?.split('@')[0] || 'Guest';
    const email = sbUser?.email || '';

    // best-effort mapping while keeping compatibility with existing mock structure
    const appUser: Partial<User> = {
        id,
        name,
        email,
        // Some parts of the codebase still expect `role` field—cast via any to avoid strict type issues here
        // Default to a benign role
        // @ts-ignore
        role: (UserRole as any)?.GUEST || (UserRole as any)?.OWNER || (UserRole as any)?.TENANT_ADMIN,
        joinDate: sbUser?.created_at || new Date().toISOString(),
        wishlist: JSON.parse(localStorage.getItem(`trustbnb_wishlist_${id}`) || '[]'),
        avatar: sbUser?.user_metadata?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    };

    return appUser as User;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check supabase auth session and subscribe to changes
        const init = async () => {
            try {
                const { data } = await supabase.auth.getUser();
                if (data?.user) {
                    setUser(mapSupabaseUserToAppUser(data.user));
                    localStorage.setItem('trustbnb_user_id', data.user.id);
                } else {
                    // fallback to any previously saved user id for dev convenience
                    const savedUserId = localStorage.getItem('trustbnb_user_id');
                    if (savedUserId) {
                        const storedWishlist = JSON.parse(localStorage.getItem(`trustbnb_wishlist_${savedUserId}`) || '[]');
                        setUser({ id: savedUserId, name: 'Guest', email: '', // minimal
                            // @ts-ignore
                            role: (UserRole as any)?.GUEST || (UserRole as any)?.OWNER,
                            joinDate: new Date().toISOString(), wishlist: storedWishlist });
                    }
                }
            } catch (err) {
                console.warn('Error checking Supabase user session', err);
            } finally {
                setLoading(false);
            }
        };

        init();

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUser(mapSupabaseUserToAppUser(session.user));
                localStorage.setItem('trustbnb_user_id', session.user.id);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                localStorage.removeItem('trustbnb_user_id');
            }
        });

        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) throw error;
        if (data?.user) {
            setUser(mapSupabaseUserToAppUser(data.user));
            localStorage.setItem('trustbnb_user_id', data.user.id);
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
        setLoading(false);
        if (error) throw error;
        if (data?.user) {
            setUser(mapSupabaseUserToAppUser({ ...data.user, user_metadata: { name } }));
            localStorage.setItem('trustbnb_user_id', data.user.id);
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        localStorage.removeItem('trustbnb_user_id');
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!user) return;
        const updated = { ...user, ...data };
        setUser(updated);
        // if you have a profiles table, update it here. For now, we update local state.
    };

    const toggleWishlist = (propertyId: string) => {
        if (!user) return;

        const isSaved = user.wishlist.includes(propertyId);
        let newWishlist;

        if (isSaved) {
            newWishlist = user.wishlist.filter(id => id !== propertyId);
        } else {
            newWishlist = [...user.wishlist, propertyId];
        }

        setUser({ ...user, wishlist: newWishlist });
        localStorage.setItem(`trustbnb_wishlist_${user.id}`, JSON.stringify(newWishlist));
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            login,
            signup,
            logout,
            updateProfile,
            toggleWishlist,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
