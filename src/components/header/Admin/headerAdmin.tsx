import { useI18n } from "i18n/i18Provider";
import { Edit, Globe, HelpCircle, LogOut, Menu, Search, Settings, User } from "lucide-react";
import { useState } from "react";

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
    const { locale, changeLanguage } = useI18n();
    const [lang, setLang] = useState(locale || "vi");

    const toggleLang = () => {
        const newLang = lang === "en" ? "vi" : "en";
        setLang(newLang);
        localStorage.setItem("lang", newLang);
        changeLanguage(newLang);
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
                        <img src="/subLogo.png" alt="Logo Icon" className="h-6 w-6" />
                    </div>
                    {open && <img src="/logo.png" alt="Logo" className="h-8 w-auto" />}
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
            {/* Right: icons */}
            <div className="flex items-center space-x-4">
                <span className="w-6 h-6 bg-gray-300 rounded-full"></span>
                <span className="w-6 h-6 bg-gray-300 rounded-full"></span>

                {/* User + Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setOpenDropdown(!openDropdown)}
                        className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center"
                    >
                        <User className="w-5 h-5 text-white" />
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
                                    href="#"
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