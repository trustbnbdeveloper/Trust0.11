import React from 'react';

// Lightweight cn utility for class merging
function cn(...inputs: (string | boolean | undefined | null | { [key: string]: any })[]) {
    return inputs
        .flat()
        .filter(Boolean)
        .map(x => (typeof x === 'object' ? Object.keys(x).filter(k => x[k]).join(' ') : x))
        .join(' ');
}

interface TrustButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const TrustButton: React.FC<TrustButtonProps> = ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    ...props
}) => {
    const variants = {
        primary: 'bg-trust-blue text-white hover:bg-[#081522] shadow-lg shadow-trust-blue/20',
        secondary: 'bg-trust-green text-white hover:bg-[#288e5d] shadow-lg shadow-trust-green/20',
        outline: 'bg-transparent border-2 border-trust-blue text-trust-blue hover:bg-trust-blue/5',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs rounded-md',
        md: 'px-5 py-2.5 text-sm rounded-lg',
        lg: 'px-8 py-3.5 text-base rounded-xl font-bold',
        xl: 'px-10 py-4.5 text-lg rounded-2xl font-black leading-tight',
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-95 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trust-blue focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                <>
                    {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
                </>
            )}
        </button>
    );
};
