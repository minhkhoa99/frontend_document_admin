import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, FileText, Activity } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Tổng quan</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white dark:bg-[#1a1c23] border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Tổng doanh thu
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">45.2M ₫</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            +20.1% so với tháng trước
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-[#1a1c23] border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Người dùng mới
                        </CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">+2350</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            +180.1% so với tháng trước
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-[#1a1c23] border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Tài liệu
                        </CardTitle>
                        <FileText className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">+12,234</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            +19% so với tháng trước
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-[#1a1c23] border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Hoạt động
                        </CardTitle>
                        <Activity className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">+573</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            +201 kể từ giờ trước
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Chart Placeholder */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-white dark:bg-[#1a1c23] border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Biểu đồ doanh thu</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-gray-500">
                            Coming Soon: Recharts Integration
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 bg-white dark:bg-[#1a1c23] border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Hoạt động gần đây</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">Người dùng đk tài khoản</p>
                                        <p className="text-sm text-gray-500">vừa xong</p>
                                    </div>
                                    <div className="ml-auto font-medium text-green-500">Onl</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
