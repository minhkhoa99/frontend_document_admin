'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, EyeOff } from 'lucide-react';
import http from '@/lib/http';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await http.post('/auth/login', { email, password, portal: 'admin' });
            const data = res.data;

            if (data.user.role !== 'admin') {
                setError('Tài khoản này không có quyền truy cập Admin.');
                setLoading(false);
                return;
            }

            localStorage.setItem('adminAccessToken', data.access_token);
            router.push('/');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0f1115]">
            <Card className="w-full max-w-md shadow-lg border-none">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Shield className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Quản trị viên</CardTitle>
                    <CardDescription>
                        Đăng nhập để truy cập hệ thống quản trị EduMarket
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md border border-red-200">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@edumarket.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-500" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-500" />
                                    )}
                                    <span className="sr-only">
                                        {showPassword ? "Hide password" : "Show password"}
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-4">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" type="submit" disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
