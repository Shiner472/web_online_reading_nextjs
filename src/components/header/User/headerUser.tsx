'use client';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faEllipsisH, faClose, faUserCircle, faSignOutAlt, faNewspaper, faCog, faBell } from "@fortawesome/free-solid-svg-icons";
import React, { use, useEffect, useState } from "react";
import './headerUser.css';
import AuthAPI from "api/authAPI";
import CategoryAPI from "api/categoryAPI";
import { io } from "socket.io-client";
import NotificationAPI from "api/notificationAPI";
import SettingsAPI from "api/settingsAPI";
import { toast } from "react-toastify";
import { log } from "console";


interface UserInfo {
    _id: string,
    userName: string;
    avatar: string;
    role?: "user" | "editor" | "chief_editor";
}

interface Category {
    slug: string;
    name: string;
}

// 🆕 Thêm interface cho Notification
interface NotificationItem {
    _id: string;
    title: string;
    sender: string;
    thumbnail: string;
    createdAt: string;
    isReaded: boolean;
    link: string;
}

const HeaderUser = () => {
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const token = localStorage.getItem('token');
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const [listCategories, setListCategories] = useState<Category[]>([]);
    const [keySearch, setKeySearch] = useState<string>();
    const [logoPreview, setLogoPreview] = useState<string>();

    const [showNotifications, setShowNotifications] = useState(false);

    // 🆕 Dữ liệu thông báo có thêm title
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    useEffect(() => {
        if (!userInfo?._id) return;

        NotificationAPI.getAllNotification(userInfo._id)
            .then(res => setNotifications(res.data))
            .catch(err => console.error(" Lỗi lấy thông báo:", err));
    }, [userInfo]);

    useEffect(() => {
        if (!userInfo?._id) return;

        const socket = io("http://localhost:4000", {
            query: { userId: userInfo._id }, // gửi userId lên server
        });

        socket.on("connect", () => { });

        socket.on("newNotification", (data: NotificationItem) => {
            setNotifications(prev => [data, ...prev]);
        });

        socket.on("disconnect", () => { });

        return () => {
            socket.disconnect();
        };
    }, [userInfo]);

    // Lấy thông tin người dùng
    useEffect(() => {
        if (token) {
            AuthAPI.getMe({ token })
                .then(response => setUserInfo(response.data))
                .catch(error => console.error("Error fetching user info:", error));
        }
    }, [token]);

    // Lấy danh mục
    useEffect(() => {
        CategoryAPI.getAllCategories()
            .then(response => {
                const categories = response.data.map((cat: any) => ({
                    slug: cat.slug,
                    name: cat.name.vi
                }));
                setListCategories(categories);
            })
            .catch(error => console.error("Error fetching categories:", error));
    }, []);


    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await SettingsAPI.getSettings().then((res) => res.data);
                if (res) {
                    setLogoPreview(res.logo || null);
                }
            } catch (error) {
                toast.error("❌ Có lỗi xảy ra khi tải cài đặt!");
            }
        };

        fetchSettings();
    }, []);

    const mainCategories = listCategories.slice(0, 5);
    const extraCategories = listCategories.slice(5);

    const handleSearch = () => {
        if (keySearch != null || keySearch === " ") {
            setShowInput(false);
        } else {
            setShowInput(true);
        }
    };

    const handleMarkReaded = async (id: string) => {
        try {
            await NotificationAPI.markReaded(id);

            // Đánh dấu là đã đọc trong state
            setNotifications(prev =>
                prev.map(n =>
                    n._id === id ? { ...n, isReaded: true } : n
                )
            );
        } catch (error) {
            console.error("Lỗi khi đánh dấu đã đọc:", error);
        }

    }

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${hours}:${minutes} ${day}/${month}/${year}`;
    };

    return (
        <>
            <header className="header-user fixed top-0 w-full bg-gray-100 border-b z-50">
                <div className="container mx-auto px-4 h-16 flex items-center">
                    <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
                        {/* Logo */}
                        <a href="/" className="flex items-center space-x-3">
                            <img
                                src={logoPreview}
                                alt="Logo"
                                className="h-10 w-auto"
                            />
                        </a>

                        {/* Nav + Search */}
                        <div className="flex items-center space-x-4 ml-auto">
                            <nav className="hidden md:flex items-center space-x-4">
                                {mainCategories.map((cat, idx) => (
                                    <a key={idx} href={`/${cat.slug}`} className="!text-gray-600 hover:text-blue-600 whitespace-nowrap">
                                        {cat.name}
                                    </a>
                                ))}
                                <button
                                    onClick={() => setShowAllCategories(!showAllCategories)}
                                    className="text-gray-600 hover:text-blue-600"
                                >
                                    {showAllCategories ? <FontAwesomeIcon icon={faClose} /> : <FontAwesomeIcon icon={faEllipsisH} />}
                                </button>
                            </nav>

                            {/* Search */}
                            <div className="hidden md:flex items-center transition-all duration-300">
                                <div className={`relative transition-all rounded duration-300 ease-in-out ${showInput ? 'w-64 mr-5' : 'w-0'} overflow-hidden`}>
                                    <button
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10 border-r pr-2 cursor-pointer"
                                        onClick={() => setShowInput(!showInput)}
                                    >
                                        <FontAwesomeIcon icon={faSearch} />
                                    </button>

                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeySearch(e.target.value)}
                                        className={`pl-12 pr-2 py-2 border border-gray-300 rounded bg-white text-sm
                                            focus:outline-none focus:ring-2 focus:ring-blue-400
                                            w-full transition-all duration-300 ease-in-out 
                                            ${showInput ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                                        `}
                                    />
                                </div>

                                <button
                                    onClick={handleSearch}
                                    className={`text-gray-600 hover:text-blue-500 transition-colors ${showInput ? 'hidden' : 'block'}`}
                                >
                                    <FontAwesomeIcon icon={faSearch} />
                                </button>
                            </div>

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    className="text-gray-600 hover:text-blue-500 mr-5 relative"
                                    onClick={() => setShowNotifications(!showNotifications)}
                                >
                                    <FontAwesomeIcon icon={faBell} className="text-xl" />
                                    {notifications.filter(n => !n.isReaded).length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center text-[11px] font-semibold">
                                            {notifications.filter(n => !n.isReaded).length}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50">
                                        <div className="px-4 py-2 border-b border-gray-200 font-semibold text-gray-700">
                                            Thông báo
                                        </div>

                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-3 text-gray-500 text-sm text-center">
                                                Không có thông báo mới
                                            </div>
                                        ) : (
                                            <ul className="max-h-80 overflow-y-auto">
                                                {notifications.map((noti, idx) => (
                                                    <a href={`http://localhost:3000/${noti.link}`} key={idx}>
                                                        <li
                                                            onClick={() => handleMarkReaded(noti._id)}
                                                            className={`flex items-start gap-3 bg-white rounded-xl shadow-sm px-4 py-3 cursor-pointer transition-all 
        ${noti.isReaded ? 'opacity-70' : 'hover:bg-gray-50'}
      `}
                                                        >
                                                            <img
                                                                src={noti.thumbnail || '/default-thumbnail.jpg'}
                                                                alt="thumb"
                                                                className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-sm line-clamp-2">{noti.title}</p>
                                                                <p className="text-xs text-gray-400 mt-1">{formatDate(noti.createdAt)}</p>
                                                            </div>
                                                        </li>
                                                    </a>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* User Menu */}
                        {userInfo ? (
                            <>
                                <div className="flex items-center space-x-4">
                                    <div className="circle-user ml-2 cursor-pointer" onClick={() => setShowUserMenu(!showUserMenu)}>
                                        <img
                                            src={userInfo.avatar || "https://images.unsplash.com/photo-1506744038136-46273834b3fb"}
                                            alt="User Avatar"
                                            className="rounded-full w-10 h-10"
                                        />
                                    </div>
                                </div>

                                {showUserMenu && (
                                    <div className="absolute right-16 top-16 bg-white border border-gray-200 rounded-xl shadow-2xl w-56 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                                            <span className="text-lg font-bold text-blue-400">Hello,</span>
                                            <span className="text-lg font-bold text-gray-800">{userInfo.userName}</span>
                                        </div>

                                        <a
                                            href="/profile/info"
                                            className="flex items-center gap-3 px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faUserCircle} className="text-lg" />
                                            <span>Profile</span>
                                        </a>

                                        <a
                                            href="/my-news"
                                            className="flex items-center gap-3 px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faNewspaper} className="text-lg" />
                                            <span>My news</span>
                                        </a>

                                        {(userInfo.role === "editor" || userInfo.role === "chief_editor") && (
                                            <a
                                                href="/editor"
                                                className="flex items-center gap-3 px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                                            >
                                                <FontAwesomeIcon icon={faCog} className="text-lg" />
                                                <span>Editor Panel</span>
                                            </a>
                                        )}

                                        {userInfo.role === "chief_editor" && (
                                            <a
                                                href="/chief-editor"
                                                className="flex items-center gap-3 px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 hover:text-indigo-600 transition-colors"
                                            >
                                                <FontAwesomeIcon icon={faCog} className="text-lg" />
                                                <span>Chief Editor Panel</span>
                                            </a>
                                        )}

                                        <button
                                            onClick={() => {
                                                localStorage.removeItem('token');
                                                setUserInfo(null);
                                            }}
                                            className="flex items-center gap-3 w-full text-left px-4 py-2 mt-1 text-red-500 font-semibold hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faSignOutAlt} className="text-lg" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center space-x-6">
                                <a href="/login" className="text-gray-600 hover:text-gray-800">Login</a>
                                <a href="/register" className="text-gray-600 hover:text-gray-800">Register</a>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Dropdown chuyên mục thêm */}
            {showAllCategories && (
                <div className="bg-white border-b shadow-sm z-40 w-full fixed top-16">
                    <div className="container mx-auto px-4 max-w-6xl py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
                            {extraCategories.map((cat, idx) => (
                                <a key={idx} href={`/${cat.slug}`} className="text-sm text-gray-700 hover:text-blue-600 whitespace-nowrap">
                                    {cat.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default HeaderUser;
