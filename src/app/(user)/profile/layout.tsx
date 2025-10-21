"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const LayoutProfilePage = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();

    // Xác định tab active dựa vào pathname
    const currentTab = (pathname ?? "").split("/").pop(); // "info" | "password" | "avatar"
    
    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white shadow-md rounded-2xl p-6">
                <div className="w-full flex justify-center">
                    <h1 className="text-2xl font-bold mb-4">Hồ sơ cá nhân</h1>
                </div>

                {/* Tabs */}
                <div className="flex border-b mb-4 space-x-4 justify-center">
                    <Link
                        href="/profile/info"
                        className={`px-4 py-2 cursor-pointer ${currentTab === "info" ? "border-b-2 border-blue-500 font-semibold" : ""
                            }`}
                    >
                        Thông tin
                    </Link>
                    <Link
                        href="/profile/password"
                        className={`px-4 py-2 cursor-pointer ${currentTab === "password" ? "border-b-2 border-blue-500 font-semibold" : ""
                            }`}
                    >
                        Đổi mật khẩu
                    </Link>
                    <Link
                        href="/profile/avatar"
                        className={`px-4 py-2 cursor-pointer ${currentTab === "avatar" ? "border-b-2 border-blue-500 font-semibold" : ""
                            }`}
                    >
                        Ảnh đại diện
                    </Link>
                </div>

                {/* Nội dung tab */}
                <div>{children}</div>
            </div>
        </div>
    );
};

export default LayoutProfilePage;
