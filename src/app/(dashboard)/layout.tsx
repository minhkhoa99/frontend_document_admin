import { AdminSidebar } from "@/components/admin-sidebar";
import { Footer } from "@/components/Footer";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-[#0f1115]">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto flex flex-col">
                <div className="p-8 flex-1">
                    {children}
                </div>
                <Footer />
            </main>
        </div>
    );
}
