import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function StatCard({
    title,
    value,
    icon,
    trend,
    alert
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    alert?: boolean;
}) {
    return (
        <div className={cn(
            "bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-between",
            alert && "bg-red-50/50 border-red-100"
        )}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
                </div>
                <div className={cn("p-3 rounded-lg bg-gray-50 text-gray-500", alert && "bg-red-100 text-red-600")}>
                    {icon}
                </div>
            </div>
            {trend && (
                <p className={cn("text-sm text-gray-600", alert && "text-red-600 font-medium")}>
                    {trend}
                </p>
            )}
        </div>
    );
}

export function Badge({ children, variant = "default" }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'danger' }) {
    const variants = {
        default: "bg-gray-100 text-gray-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-orange-100 text-orange-800",
        danger: "bg-red-100 text-red-800",
    }
    return (
        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant])}>
            {children}
        </span>
    )
}
