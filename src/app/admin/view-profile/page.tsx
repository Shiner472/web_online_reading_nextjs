


"use client";

import AuthAPI from "api/authAPI";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ViewProfilePage = () => {
    const router = useRouter();
    const token = localStorage.getItem("token");
    const [preview, setPreview] = useState<string>();
    const [userName, setUserName] = useState<string>();
    const [userId, setUserId] = useState<string>();
    const [email, setEmail] = useState<string>();




    useEffect(() => {
        if (!token) return;
        AuthAPI.getMe({ token }).then((response) => {
            setUserName(response.data.userName);
            setPreview(response.data.avatar || "https://api.dicebear.com/6.x/initials/svg?seed=JD");
            setUserId(response.data._id);
            setEmail(response.data.email);
        });
    }, [token]);

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center">Thông tin cá nhân</h1>

            <div className="flex flex-col items-center space-y-4">
                {/* Avatar */}
                <img
                    src={preview}
                    alt="Avatar"
                    className="w-28 h-28 rounded-full object-cover shadow"
                />

                {/* Thông tin */}
                <div className="text-center">
                    <p className="text-lg font-semibold">{userName}</p>
                    <p className="text-gray-600">{email}</p>
                </div>

                {/* Nút Edit */}
                <button
                    onClick={() => router.push("/admin/edit-profile")}
                    className="mt-4 px-4 py-2 bg-blue-500 !text-white rounded-lg hover:bg-blue-600 transition"
                >
                    Chỉnh sửa hồ sơ
                </button>
            </div>
        </div>
    );
};

export default ViewProfilePage;
