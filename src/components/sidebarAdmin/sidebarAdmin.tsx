"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    User,
    List,
    ShieldCheck,
    Settings,
    BrainCircuit
} from "lucide-react";
import { useTranslations } from "next-intl";

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
    const t = useTranslations("AdminPage");

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
                    {t("dashboard")}
                </p>
                <MenuItem
                    icon={<Home />}
                    text={t("dashboardPage")}
                    open={open}
                    href="/admin/dashboard"
                    active={activeItem === "/admin/dashboard"}
                />
                <MenuItem
                    icon={<User />}
                    text={t("account")}
                    open={open}
                    href="/admin/view-profile"
                    active={activeItem === "/admin/view-profile"}
                />

                <MenuItem
                    icon={<Settings />}
                    text={t("settingsPage")}
                    open={open}
                    href="/admin/settings"
                    active={activeItem === "/admin/settings"}
                />

                <p
                    className={`text-gray-500 text-xs font-semibold mt-2 mb-1 px-2 ${!open && "hidden"
                        }`}
                >
                    {t("manage")}
                </p>
                <MenuItem
                    icon={<List />}
                    text={t("manageCategoryPage")}
                    open={open}
                    href="/admin/manage-category"
                    active={activeItem === "/admin/manage-category"}
                />
                <MenuItem
                    icon={<ShieldCheck />}
                    text={t("permissionPage")}
                    open={open}
                    href="/admin/roles"
                    active={activeItem === "/admin/roles"}
                />

                <MenuItem
                    icon={<BrainCircuit />}
                    text={t("AI-trainingPage")}
                    open={open}
                    href="/admin/ai-training"
                    active={activeItem === "/admin/ai-training"}
                />
            </nav>
        </div>
    );
};

export default SidebarAdmin;
