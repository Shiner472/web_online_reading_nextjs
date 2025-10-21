'use client';
import AuthAPI from "api/authAPI";
import { useEffect, useRef, useState } from "react";



const AvatarUpload = () => {

    const [avatar, setAvatar] = useState(
        "https://api.dicebear.com/6.x/initials/svg?seed=JD"
    );
    const [userId, setUserId] = useState<string | null>(null);
    const token = localStorage.getItem("token");

    const cloudinaryWidgetRef = useRef<any>(null);

    useEffect(() => {
        if (token) {
            AuthAPI.getMe({ token }).then((res) => {
                if (res.data.avatar) {
                    setAvatar(res.data.avatar);
                }
                setUserId(res.data._id);
            });
        }
    }, [token]);

    useEffect(() => {
        // @ts-ignore
        const myWidget = cloudinary.createUploadWidget(
            {
                cloudName: "ddwqvmtmb",
                uploadPreset: "readNewspaper_web",
                sources: ["local", "url", "camera"],
                multiple: false,
                resourceType: "image",
            },
            // @ts-ignore
            (error, result) => {
                if (!error && result && result.event === "success") {
                    const imageUrl = result.info.secure_url;
                    setAvatar(imageUrl);
                }
            }
        );
        cloudinaryWidgetRef.current = myWidget;
    }, []);

    const updateAvatarChange = () => {
        if (userId) {
            AuthAPI.updateProfile(userId, { avatar }).then((res) => {
                alert("Cập nhật ảnh đại diện thành công");
            }).catch((err) => {
                alert("Cập nhật ảnh đại diện thất bại");
            });
        }
    }

    return (
        <div className="flex flex-col items-center space-y-4">
            {/* Hiển thị avatar */}
            <img
                src={avatar}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover"
            />

            <button
                onClick={() => cloudinaryWidgetRef.current.open()}
                className="cursor-pointer bg-gray-400 px-4 py-2 !text-white rounded-lg hover:bg-gray-300"
            >
                Chọn ảnh
            </button>

            {/* Nút cập nhật */}
            <button
                onClick={updateAvatarChange}
                className="mt-2 bg-blue-500 !text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                Cập nhật ảnh đại diện
            </button>
        </div>
    )

};

export default AvatarUpload;