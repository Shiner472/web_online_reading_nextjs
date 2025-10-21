"use client";

import AuthAPI from "api/authAPI";
import InputField from "components/inputField/inputField";
import { useEffect, useRef, useState } from "react";

const EditProfilePage = () => {
    const [activeTab, setActiveTab] = useState<"username" | "password" | "avatar">("username");
    const [email, setEmail] = useState<string>();
    const [userName, setUserName] = useState<string>("current_username");
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [preview, setPreview] = useState<string>();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const [userId, setUserId] = useState<string | null>(null);
    const cloudinaryWidgetRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && (window as any).cloudinary) {
            // @ts-ignore
            const myWidget = (window as any).cloudinary.createUploadWidget(
                {
                    cloudName: "ddwqvmtmb",
                    uploadPreset: "readNewspaper_web",
                    sources: ["local", "url", "camera"],
                    multiple: false,
                    resourceType: "image",
                    folder: "avatars",
                },
                (error: any, result: any) => {
                    if (!error && result && result.event === "success") {
                        const imageUrl = result.info.secure_url;
                        setPreview(imageUrl);
                    }
                }
            );
            cloudinaryWidgetRef.current = myWidget;
        }
    }, []);

    useEffect(() => {
        if (!token) return;
        AuthAPI.getMe({ token }).then((response) => {
            setUserName(response.data.userName);
            setPreview(response.data.avatar || "https://api.dicebear.com/6.x/initials/svg?seed=JD");
            setUserId(response.data._id);
            setEmail(response.data.email);
        });
    }, [token]);

    const handleUpdateUserName = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (userId) await AuthAPI.updateProfile(userId, { userName });
            alert("Cập nhật tên thành công!");
        } catch (error) {
            console.log("Error update username:", error);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        // ... bạn có thể thêm API đổi mật khẩu tại đây

        if( newPassword !== confirmPassword ){
            alert("Mật khẩu mới và xác nhận mật khẩu không khớp" );
            return;
        }

        AuthAPI.resetPassword({
            email: email || "",
            newPassword: newPassword
        }).then((res) => {
            alert("Cập nhật mật khẩu thành công");
        }).catch((err) => {
            alert("Cập nhật mật khẩu thất bại");
        });
    };

    const handleUpdateAvatar = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (userId && preview) {
                await AuthAPI.updateProfile(userId, { avatar: preview });
                alert("Cập nhật ảnh đại diện thành công!");
            }
        } catch (error) {
            console.error("Error update avatar:", error);
        }
    };

    return (
        <div className="p-6 mx-auto">
            <h1 className="text-2xl font-bold mb-6">Chỉnh sửa hồ sơ</h1>

            {/* Tabs */}
            <div className="flex border-b mb-6">
                {["username", "password", "avatar"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 -mb-px border-b-2 transition ${activeTab === tab
                            ? "border-blue-500 !text-blue-600 font-semibold"
                            : "border-transparent hover:text-blue-500"
                            }`}
                    >
                        {tab === "username" ? "Đổi tên" : tab === "password" ? "Đổi mật khẩu" : "Đổi ảnh đại diện"}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="bg-white shadow rounded-lg p-6">
                {activeTab === "username" && (
                    <form onSubmit={handleUpdateUserName} className="space-y-4">
                        <InputField
                            id="username"
                            label="Tên người dùng"
                            type="text"
                            placeholder="Nhập tên người dùng"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                        <div className="flex justify-center">
                            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                Lưu
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === "password" && (
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <InputField
                            id="currentPassword"
                            label="Mật khẩu hiện tại"
                            type="password"
                            placeholder="Nhập mật khẩu hiện tại"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                        <InputField
                            id="newPassword"
                            label="Mật khẩu mới"
                            type="password"
                            placeholder="Nhập mật khẩu mới"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <InputField
                            id="confirmPassword"
                            label="Xác nhận mật khẩu mới"
                            type="password"
                            placeholder="Xác nhận mật khẩu mới"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <div className="flex justify-center">
                            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                Lưu
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === "avatar" && (
                    <form onSubmit={handleUpdateAvatar} className="space-y-4">
                        <div className="flex flex-col items-center">
                            <img
                                src={preview}
                                alt="Avatar"
                                className="w-24 h-24 rounded-full mb-4 object-cover border"
                            />

                            {/* ✅ Nút chọn ảnh (đã fix) */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault(); // ngăn form submit
                                    cloudinaryWidgetRef.current && cloudinaryWidgetRef.current.open();
                                }}
                                className="px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 text-gray-700"
                            >
                                Chọn ảnh
                            </button>
                        </div>

                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Lưu
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditProfilePage;
