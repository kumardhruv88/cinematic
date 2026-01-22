import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Container = ({ children, className }) => {
    return (
        <div className={cn("max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-20", className)}>
            {children}
        </div>
    );
};

export default Container;
