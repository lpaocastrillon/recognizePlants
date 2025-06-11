'use client';

import { on } from "events";
import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    onclick?: () => void;
}

export default function Card({ children, className = '', onclick }: CardProps) {
    return (
        <div
            className={`bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-md border border-emerald-100 
                overflow-hidden hover:shadow-lg transition-all duration-200 
                ${onclick ? 'cursor-pointer' : ''
                } ${className}`}
                onClick={onclick}
        >
            {children}
        </div>
    );
}