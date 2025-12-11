'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Lock, Unlock, MoreHorizontal, ShieldCheck, Shield, User } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import http from '@/lib/http';

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await http.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (user: User) => {
        try {
            const newStatus = !user.isActive;
            // Assuming update endpoint accepts isActive
            await http.patch(`/users/${user.id}`, { isActive: newStatus });

            // Optimistic update
            setUsers(users.map(u => u.id === user.id ? { ...u, isActive: newStatus } : u));
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Có lỗi xảy ra khi cập nhật trạng thái');
        }
    };

    const changeRole = async (user: User, newRole: string) => {
        try {
            await http.patch(`/users/${user.id}`, { role: newRole });
            // Optimistic update
            setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error('Failed to change role', error);
            alert('Có lỗi xảy ra khi đổi quyền');
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải danh sách người dùng...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Quản lý Người dùng</h1>
                    <p className="text-gray-500 dark:text-gray-400">Danh sách tất cả người dùng trong hệ thống.</p>
                </div>
                <Button>Thêm mới (Admin)</Button>
            </div>

            <div className="rounded-md border bg-white dark:bg-[#1a1c23] dark:border-gray-800">
                <Table>
                    <TableHeader>
                        <TableRow className="dark:border-gray-800 hover:bg-transparent">
                            <TableHead className="w-[80px]">Avatar</TableHead>
                            <TableHead>Thông tin</TableHead>
                            <TableHead>Vai trò</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày tham gia</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <TableCell>
                                    <Avatar>
                                        <AvatarImage src={`/avatars/${user.id}.png`} />
                                        <AvatarFallback>{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900 dark:text-gray-200">{user.fullName}</span>
                                        <span className="text-xs text-gray-500">{user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={
                                        user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-200' :
                                            user.role === 'vendor' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                'bg-gray-50 text-gray-700 border-gray-200'
                                    }>
                                        {user.role === 'admin' && <ShieldCheck className="w-3 h-3 mr-1" />}
                                        {user.role === 'vendor' && <Shield className="w-3 h-3 mr-1" />}
                                        {user.role === 'buyer' && <User className="w-3 h-3 mr-1" />}
                                        {user.role.toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.isActive ? 'default' : 'destructive'} className={user.isActive ? 'bg-green-600 hover:bg-green-700' : ''}>
                                        {user.isActive ? 'Active' : 'Locked'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-500 dark:text-gray-400">
                                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                                                Copy ID
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel>Đổi vai trò</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => changeRole(user, 'buyer')}>
                                                Set as Buyer
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => changeRole(user, 'vendor')}>
                                                Set as Vendor
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => changeRole(user, 'admin')}>
                                                <span className="text-red-600">Set as Admin</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => toggleStatus(user)} className={user.isActive ? "text-red-600" : "text-green-600"}>
                                                {user.isActive ? (
                                                    <><Lock className="mr-2 h-4 w-4" /> Khóa tài khoản</>
                                                ) : (
                                                    <><Unlock className="mr-2 h-4 w-4" /> Mở khóa</>
                                                )}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
