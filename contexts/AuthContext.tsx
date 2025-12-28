import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../constants';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => void;
    toggleWishlist: (propertyId: string) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Simulate session check on mount
    useEffect(() => {
        const checkSession = async () => {
            // In a real app, verify token here. 
            // For partial demo, we can persist via localStorage or just start logged out.
            // Let's check localStorage for a saved user ID for convenience during dev.
            const savedUserId = localStorage.getItem('trustbnb_user_id');
            if (savedUserId) {
                const foundUser = MOCK_USERS.find(u => u.id === savedUserId);
                if (foundUser) {
                    // Determine if we need to initialize wishlist from storage if it differs from mock
                    const storedWishlist = JSON.parse(localStorage.getItem(`trustbnb_wishlist_${savedUserId}`) || '[]');
                    if (storedWishlist.length > 0) {
                        setUser({ ...foundUser, wishlist: storedWishlist });
                    } else {
                        setUser(foundUser);
                    }
                }
            }
            setLoading(false);
        };
        checkSession();
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        // Simulate API call
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                // For mock purposes, password check is skipped or simple "password"
                const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

                if (foundUser) {
                    // Restore wishlist
                    const storedWishlist = JSON.parse(localStorage.getItem(`trustbnb_wishlist_${foundUser.id}`) || '[]');
                    const userWithWishlist = { ...foundUser, wishlist: [...new Set([...foundUser.wishlist, ...storedWishlist])] };

                    setUser(userWithWishlist);
                    localStorage.setItem('trustbnb_user_id', foundUser.id);
                    resolve();
                } else {
                    reject(new Error('Invalid credentials'));
                }
                setLoading(false);
            }, 800);
        });
    };

    const signup = async (name: string, email: string, password: string) => {
        setLoading(true);
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const newUser: User = {
                    id: `U${Date.now()}`,
                    name,
                    email,
                    role: UserRole.GUEST,
                    joinDate: new Date().toISOString(),
                    wishlist: [],
                    isFirstBooking: true,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
                };
                setUser(newUser);
                localStorage.setItem('trustbnb_user_id', newUser.id);

                // Add to Mock Users (in memory strictly for this session logic, though constants is read-only usually, 
                // we'll just rely on state for the new user)
                MOCK_USERS.push(newUser);

                resolve();
                setLoading(false);
            }, 1000);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('trustbnb_user_id');
    };

    const updateProfile = (data: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...data };
            setUser(updatedUser);
            // In a real app, this would modify backend. Here we update local state.
        }
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
