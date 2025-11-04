import AuthAPI from "api/authAPI";
import SettingsAPI from "api/settingsAPI";
import { useI18n } from "i18n/i18Provider";
import { Bell, Edit, Globe, HelpCircle, LogOut, Menu, Search, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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

const notifications = [
    { id: 1, message: "Bạn có lịch hẹn mới từ bác sĩ A" },
    { id: 2, message: "Hệ thống sẽ bảo trì vào tối nay" },
    { id: 3, message: "Kết quả xét nghiệm của bạn đã sẵn sàng" },
];

const HeaderAdmin = ({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) => {
    const [openDropdown, setOpenDropdown] = useState(false);
    const [openNotifications, setOpenNotifications] = useState(false);
    const { locale, changeLanguage } = useI18n();
    const [lang, setLang] = useState(locale || "vi");
    const [logoPreview, setLogoPreview] = useState<any>();
    const [imageUser, setImageUser] = useState<string>();
    const token = localStorage.getItem("token");

    const toggleLang = () => {
        const newLang = lang === "en" ? "vi" : "en";
        setLang(newLang);
        localStorage.setItem("lang", newLang);
        changeLanguage(newLang);
    }


    useEffect(() => {
        if (!token) return;
        AuthAPI.getMe({ token }).then((response) => {

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

    const handleLogout = async () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    }

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
                        {notifications.length > 0 && (
                            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                                {notifications.length}
                            </span>
                        )}
                    </button>

                    {/* Danh sách thông báo */}
                    {openNotifications && (
                        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg border border-gray-100 overflow-hidden z-50">
                            <div className="p-3 border-b font-semibold text-gray-700">Thông báo</div>
                            <div className="max-h-60 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className="px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 cursor-pointer"
                                        >
                                            {n.message}
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                        Không có thông báo nào
                                    </div>
                                )}
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