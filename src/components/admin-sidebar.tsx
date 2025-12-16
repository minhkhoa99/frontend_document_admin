'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    Wallet,
    Shield,
    Menu,
    X,
    Folder
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import http from '@/lib/http';

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false); // Mobile menu state
    const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

    useEffect(() => {
        // Fetch Admin profile using cookie
        http.get('/auth/profile')
            .then((response: any) => {
                const data = response.data || response;
                // api lib unwraps response.data, but let's be safe
                if (data) {
                    setUser({
                        name: data.fullName || 'Admin',
                        email: data.email || 'admin@edumarket.com',
                        role: data.role
                    });
                }
            })
            .catch(err => console.error("Failed to fetch admin profile", err));
    }, []);

    const handleLogout = async () => {
        try {
            await http.post('/auth/logout');
        } catch (e) {
            console.error(e);
        }
        router.push('/login');
    };

    const menuItems = [
        { label: 'Tổng quan', href: '/', icon: LayoutDashboard },
        { label: 'Người dùng', href: '/users', icon: Users },
        { label: 'Tài chính', href: '/finance', icon: Wallet },
        { label: 'Nội dung', href: '/documents', icon: FileText },
        { label: 'Danh mục', href: '/categories', icon: Folder },
        { label: 'Menu Website', href: '/menus', icon: Menu },
        { label: 'Cài đặt', href: '/settings', icon: Settings },
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-md"
                onClick={toggleSidebar}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={cn(
                "fixed top-0 left-0 z-40 h-screen w-64 bg-[#1a1c23] text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo Section */}
                <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-[#1a1c23]">
                    <Shield className="h-6 w-6 text-blue-500 mr-2" />
                    <span className="text-lg font-bold tracking-wider">EduAdmin</span>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User & Logout Section */}
                <div className="p-4 border-t border-gray-800 bg-[#15171c]">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <Avatar className="h-9 w-9 border border-gray-600">
                            <AvatarImage src="/avatars/admin.png" />
                            <AvatarFallback className="bg-blue-900 text-blue-200">AD</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-gray-200 truncate">
                                {user?.name || 'Administrator'}
                            </span>
                            <span className="text-xs text-gray-500 truncate">
                                {user?.email || 'admin@system.com'}
                            </span>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 h-9"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" /> Đăng xuất
                    </Button>
                </div>
            </div>
        </>
    );
}
