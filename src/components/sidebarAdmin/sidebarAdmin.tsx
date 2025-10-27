"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    User,
    BarChart3,
    Activity,
    ShoppingCart,
    Calendar,
    MessageCircle,
    CheckSquare,
    Mail,
    Folder,
    List,
    ShieldCheck,
    Settings
} from "lucide-react";

type MenuItemProps = {
    icon: React.ReactNode;
    text: string;
    open: boolean;
    href: string;
    active: boolean;
};

const MenuItem = ({ icon, text, open, href, active }: MenuItemProps) => (
    <Link
        href={href}
        className={`flex items-center p-2 rounded-md cursor-pointer transition-colors
        ${active ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-700"}`}
    >
        <span className={`w-6 h-6 ${active ? "text-blue-600" : "text-gray-600"}`}>
            {icon}
        </span>
        {open && <span className="ml-3">{text}</span>}
    </Link>
);

const SidebarAdmin = ({ open }: { open: boolean }) => {
    const pathname = usePathname();
    const [activeItem, setActiveItem] = useState<string>("");

    useEffect(() => {
        setActiveItem(pathname ?? ""); // đồng bộ với URL khi load hoặc chuyển trang
    }, [pathname]);

    return (
        <div
            className={`${open ? "w-64" : "w-20"
                } bg-white shadow-md flex flex-col transition-all duration-300`}
        >
            <nav className="flex-1 overflow-y-auto p-2">
                <p
                    className={`text-gray-500 text-xs font-semibold mt-2 mb-1 px-2 ${!open && "hidden"
                        }`}
                >
                    DASHBOARD
                </p>
                <MenuItem
                    icon={<Home />}
                    text="Dashboard"
                    open={open}
                    href="/admin/dashboard"
                    active={activeItem === "/admin/dashboard"}
                />
                <MenuItem
                    icon={<User />}
                    text="Account"
                    open={open}
                    href="/admin/view-profile"
                    active={activeItem === "/admin/view-profile"}
                />

                <MenuItem
                    icon={<Settings />}
                    text="Settings"
                    open={open}
                    href="/admin/settings"
                    active={activeItem === "/admin/settings"}
                />

                <p
                    className={`text-gray-500 text-xs font-semibold mt-2 mb-1 px-2 ${!open && "hidden"
                        }`}
                >
                    QUẢN LÝ
                </p>
                <MenuItem
                    icon={<List />}
                    text="Quản lý danh mục"
                    open={open}
                    href="/admin/manage-category"
                    active={activeItem === "/admin/manage-category"}
                />
                <MenuItem
                    icon={<ShieldCheck />}
                    text="Cấp quyền truy cập"
                    open={open}
                    href="/admin/roles"
                    active={activeItem === "/admin/roles"}
                />
            </nav>
        </div>
    );
};

export default SidebarAdmin;
