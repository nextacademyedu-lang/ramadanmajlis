"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Tags,
    Factory,
    QrCode,
    Mic,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const menuItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Bookings', href: '/admin/bookings', icon: Users },
    { name: 'Promo Codes', href: '/admin/promos', icon: Tags },
    { name: 'Industries', href: '/admin/industries', icon: Factory },
    { name: 'Speakers', href: '/admin/speakers', icon: Mic },
    { name: 'Scanner', href: '/admin/scan', icon: QrCode },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle Button */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-black/80 border-white/20 text-white backdrop-blur-md"
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </Button>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={cn(
                "fixed left-0 top-0 h-screen w-64 bg-black/90 backdrop-blur-xl border-r border-white/10 z-40 transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <div className="text-xl font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">
                            Ramadan Majlis
                        </div>
                        <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Admin Control</div>
                    </div>
                    {/* Close button for mobile inside sidebar */}
                    <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Menu */}
                <div className="flex-1 py-6 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)} // Close on navigate
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
        </>
    );
}
