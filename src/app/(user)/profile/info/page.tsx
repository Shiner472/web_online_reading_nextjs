'use client';
import AuthAPI from "api/authAPI";
import { useEffect, useState } from "react";

const TabInfo = () => {
    const token = localStorage.getItem("token");
    const [username, setUsername] = useState("john_doe");
    const [email, setEmail] = useState("john@example.com");


    useEffect(() => {
        AuthAPI.getMe({token: token ?? ""}).then((response) => {
            setUsername(response.data.userName);
            setEmail(response.data.email);
        }).catch((error) => {
            console.error("Failed to fetch user info:", error);
        });
    }, [token]);

    return (
        <div className="space-y-4">
            <div>
                <label className="block mb-1 font-medium !text-black">Username</label>
                <input
                    className="border rounded-lg p-2 w-full"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div>
                <label className="block mb-1 font-medium !text-black">Email</label>
                <input
                    className="border rounded-lg p-2 w-full bg-gray-100"
                    value={email}
                    disabled
                />
            </div>
            <div className="w-full flex justify-center">
                <button className="mt-4 bg-blue-500 !text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600">
                    Lưu thay đổi
                </button>
            </div>
        </div>

    )

};

export default TabInfo;