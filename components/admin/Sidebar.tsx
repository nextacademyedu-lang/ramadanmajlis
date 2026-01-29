"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Tags,
    Factory,
    QrCode,
    Settings,
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const menuItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Bookings', href: '/admin/bookings', icon: Users },
    { name: 'Promo Codes', href: '/admin/promos', icon: Tags },
    { name: 'Industries', href: '/admin/industries', icon: Factory },
    { name: 'Scanner', href: '/admin/scan', icon: QrCode },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 border-r border-white/10 bg-black/60 backdrop-blur-xl h-screen fixed left-0 top-0 flex flex-col z-50">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <div className="text-xl font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">
                    Ramadan Nights
                </div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Admin Control</div>
            </div>

            {/* Menu */}
            <div className="flex-1 py-6 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="block px-4 mx-2"
                        >
                            <div className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                isActive
                                    ? "bg-primary/20 text-primary border border-primary/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}>
                                <item.icon size={20} />
                                <span className="font-medium">{item.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}
