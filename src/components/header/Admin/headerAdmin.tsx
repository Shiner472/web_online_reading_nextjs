import AuthAPI from "api/authAPI";
import NotificationAPI from "api/notificationAPI";
import SettingsAPI from "api/settingsAPI";
import { useI18n } from "i18n/i18Provider";
import { Bell, Edit, Globe, HelpCircle, LogOut, Menu, Search, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const ItemDropdown = ({ icon, href, text }: { icon: React.ReactNode; href: string; text: string }) => {
    return (
        <li>
            <a
                href={href}
                className="flex items-center px-4 py-2 hover:bg-gray-100"
            >
                {icon} {text}
            </a>
        </li>
    );
}




const HeaderAdmin = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
    const [openDropdown, setOpenDropdown] = useState(false);
    const [openNotifications, setOpenNotifications] = useState(false);
    const { locale, changeLanguage } = useI18n();
    const [lang, setLang] = useState(locale || "vi");
    const [logoPreview, setLogoPreview] = useState<any>();
    const [imageUser, setImageUser] = useState<string>();
    const token = localStorage.getItem("token");
    const [user, setUser] = useState<any>();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState<any>(0);
    const toggleLang = () => {
        const newLang = lang === "en" ? "vi" : "en";
        setLang(newLang);
        localStorage.setItem("lang", newLang);
        changeLanguage(newLang);
    }

    useEffect(() => {
        if (!user?._id) return;
        const socket = io("http://localhost:4000", {
            query: { userId: user._id },
        });

        socket.on("newNotification", (data) => {
            setNotifications(prev => [data, ...prev]);
        });

        return () => {
            socket.off("newNotification");
            socket.disconnect();
        };
    }, [user?._id]);


    useEffect(() => {
        if (!token) return;
        AuthAPI.getMe({ token }).then((response) => {
            setUser(response.data);
            setImageUser(response.data.avatar || "https://api.dicebear.com/6.x/initials/svg?seed=JD");

        });
    }, [token]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await SettingsAPI.getSettings().then((res) => res.data);
                if (res) {
                    setLogoPreview(res || null);
                }
            } catch (error) {
                toast.error("❌ Có lỗi xảy ra khi tải cài đặt!");
            }
        };

        fetchSettings();
    }, []);

    useEffect(() => {
        if (!token || !user?._id) return;
        try {
            NotificationAPI.getAllNotification(user._id)
                .then((response) => {
                    setNotifications(response.data);
                    setUnreadCount(response.data.filter((n: any) => !n.isReaded).length)
                })
        } catch (error) {
            toast.error("Lỗi khi tải dữ liệu");
        }
    }, [user, token])

    const handleLogout = async () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    }

    const handleMarkedRead = async (id: string) => {
        await NotificationAPI.markReaded(id);
        setNotifications((prev) =>
            prev.map((item) =>
                item._id === id ? { ...item, isReaded: true } : item
            )
        );
        setUnreadCount((prev: any) => Math.max(prev - 1, 0));
    };

    return (
        < header className="relative bg-white shadow-md px-4 py-3 flex items-center" >
            {/* Left: logo */}
            < div
                className={`flex items-center transition-all duration-300 ${open ? "w-64" : "w-20"
                    }`
                }
            >
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 flex items-center justify-center font-bold rounded">
                        <img src={logoPreview?.iconLogo} alt="Logo Icon" className="h-6 w-6" />
                    </div>
                    {open && <img src={logoPreview?.logo} alt="Logo" className="h-8 w-auto" />}
                </div>
            </div >

            {/* Toggle button */}
            < div
                className={`absolute top-1/2 -translate-y-1/2 transition-all duration-300 border-x-2 ${open ? "left-64" : "left-20"
                    }`}
            >
                <button
                    onClick={() => setOpen(!open)}
                    className="p-2 text-gray-600 hover:text-black cursor-pointer outline-none"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div >

            {/* Middle: search */}
            < div className="flex-1 w-full px-6" >
                <div className="relative w-1/2 ">
                    {/* Icon search */}
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 mr-1 cursor-pointer" />

                    {/* Input */}
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="pl-10 pr-3 py-1 rounded-md w-full focus:outline-none"
                    />
                </div>
            </div >

            {/* Right: icons */}
            <div className="flex items-center space-x-4">
                <div className="relative">
                    {/* Nút thông báo */}
                    <button
                        onClick={() => setOpenNotifications(!openNotifications)}
                        className="relative w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition"
                    >
                        <Bell className="w-6 h-6 text-gray-600" />
                        {/* Số lượng thông báo */}
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Danh sách thông báo */}
                    {openNotifications && (
                        <div className="absolute right-0 mt-2 w-96 bg-white shadow-2xl rounded-xl border border-gray-200 overflow-hidden z-50">

                            {/* Header */}
                            <div className="p-4 border-b bg-gray-50 font-semibold text-gray-800 flex justify-between">
                                <span>Thông báo</span>
                            </div>

                            {/* Scrollable content */}
                            <div className="max-h-[500px] overflow-y-auto custom-scroll pr-1">
                                <div>
                                    {notifications.length > 0 ? (
                                        notifications.map((n) => (
                                            <div
                                                key={n._id}
                                                onClick={() => handleMarkedRead(n._id)}
                                                className={`
                px-4 py-3 border-b cursor-pointer transition
                ${!n.isReaded ? "bg-blue-50 hover:bg-blue-100/60" : "hover:bg-gray-50"}
              `}
                                            >
                                                <div className="flex items-start gap-3">

                                                    {/* Dot trạng thái */}
                                                    {!n.isReaded ? (
                                                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-2"></span>
                                                    ) : (
                                                        <span className="w-2 h-2 rounded-full bg-gray-300 mt-2"></span>
                                                    )}

                                                    {/* Nội dung */}
                                                    <div className="flex-1">
                                                        <div className={`text-sm ${!n.isReaded ? "font-semibold text-gray-900" : "text-gray-800"}`}>
                                                            {n.title}
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                                                            <span>{n.sender.userName}</span>
                                                            <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-5 text-sm text-gray-500 text-center">
                                            Không có thông báo nào
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* User + Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setOpenDropdown(!openDropdown)}
                        className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center"
                    >
                        <img
                            src={imageUser}
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    </button>

                    {openDropdown && (
                        <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-md border z-50">
                            {/* Nút đổi ngôn ngữ */}
                            <div
                                onClick={toggleLang}
                                className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                            >
                                {lang === "vi" ? (
                                    <>
                                        <img
                                            src="https://flagcdn.com/w20/vn.png"
                                            alt="Vietnam Flag"
                                            className="w-5 h-5 mr-2 rounded-sm"
                                        />
                                        <span>Tiếng Việt</span>
                                    </>
                                ) : (
                                    <>
                                        <img
                                            src="https://flagcdn.com/w20/gb.png"
                                            alt="UK Flag"
                                            className="w-5 h-5 mr-2 rounded-sm"
                                        />
                                        <span>English</span>
                                    </>
                                )}
                            </div>

                            <ul className="py-2 text-sm text-gray-700">
                                <ItemDropdown icon={<Edit className="w-4 h-4 mr-2" />} href="/admin/edit-profile" text="Edit Profile" />
                                <ItemDropdown icon={<User className="w-4 h-4 mr-2" />} href="/admin/view-profile" text="View Profile" />
                            </ul>
                            <div className="border-t">
                                <a
                                    onClick={handleLogout}
                                    className="flex items-center px-4 py-2 !text-red-500 hover:bg-gray-100"
                                >
                                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </header >
    );
};

export default HeaderAdmin;