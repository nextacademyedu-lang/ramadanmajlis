import { AdminSidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-white">
            <AdminSidebar />
            <main className="md:pl-64 min-h-screen transition-all duration-300">
                <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-7xl mx-auto space-y-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
