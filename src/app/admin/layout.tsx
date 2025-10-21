'use client';
import SidebarAdmin from "components/sidebarAdmin/sidebarAdmin";
import { useState } from "react";
import { Menu, Search } from "lucide-react";
import HeaderAdmin from "components/header/Admin/headerAdmin";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(true);

    return (
        <div className="h-screen flex flex-col">
            <HeaderAdmin open={open} setOpen={setOpen} />
            {/* BODY */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <SidebarAdmin open={open} />

                {/* Main content */}
                <main className="flex-1 p-4 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
