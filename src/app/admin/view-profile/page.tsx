


"use client";

import { useRouter } from "next/navigation";

const ViewProfilePage = () => {
    const router = useRouter();

    // Giả sử dữ liệu user lấy từ API hoặc context
    const user = {
        avatar: "https://api.dicebear.com/6.x/initials/svg?seed=JD",
        username: "John Doe",
        email: "johndoe@example.com",
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-center">Thông tin cá nhân</h1>

            <div className="flex flex-col items-center space-y-4">
                {/* Avatar */}
                <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-28 h-28 rounded-full object-cover shadow"
                />

                {/* Thông tin */}
                <div className="text-center">
                    <p className="text-lg font-semibold">{user.username}</p>
                    <p className="text-gray-600">{user.email}</p>
                </div>

                {/* Nút Edit */}
                <button
                    onClick={() => router.push("/edit-profile")}
                    className="mt-4 px-4 py-2 bg-blue-500 !text-white rounded-lg hover:bg-blue-600 transition"
                >
                    Chỉnh sửa hồ sơ
                </button>
            </div>
        </div>
    );
};

export default ViewProfilePage;
