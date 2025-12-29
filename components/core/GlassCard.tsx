import React from 'react';

function cn(...inputs: (string | boolean | undefined | null | { [key: string]: any })[]) {
    return inputs
        .flat()
        .filter(Boolean)
        .map(x => (typeof x === 'object' ? Object.keys(x).filter(k => x[k]).join(' ') : x))
        .join(' ');
}

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'flat' | 'elevated' | 'glass';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const GlassCard: React.FC<GlassCardProps> = ({
    className,
    variant = 'glass',
    padding = 'md',
    children,
    ...props
}) => {
    const variants = {
        flat: 'bg-white dark:bg-trust-darkcard border border-gray-100 dark:border-gray-800',
        elevated: 'bg-white dark:bg-trust-darkcard border border-gray-100 dark:border-gray-800 shadow-xl',
        glass: 'bg-white/80 dark:bg-trust-darkcard/80 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl',
    };

    const paddings = {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6 md:p-8',
        lg: 'p-10 md:p-12',
    };

    return (
        <div
            className={cn(
                'rounded-2xl lg:rounded-3xl overflow-hidden transition-all duration-300',
                variants[variant],
                paddings[padding],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
