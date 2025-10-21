"use client";

import { useEffect, useState } from "react";
import { Save, Lock, Unlock } from "lucide-react";
import AuthAPI from "api/authAPI";

const RolesPage = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [originalUsers, setOriginalUsers] = useState<any[]>([]);
    const [saving, setSaving] = useState<string | null>(null);
    const [banning, setBanning] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const roles = ["user", "editor", "chief_editor", "admin"];

    useEffect(() => {
        AuthAPI.getAllUsers()
            .then((res) => {
                setUsers(res.data);
                setOriginalUsers(res.data);
            })
            .catch((err) => console.error("Lỗi tải người dùng:", err));
    }, []);

    const handleChangeRole = (userId: string, newRole: string) => {
        setUsers((prev) =>
            prev.map((u) =>
                u._id === userId ? { ...u, role: newRole } : u
            )
        );
    };

    const handleSave = async (userId: string) => {
        const user = users.find((u) => u._id === userId);
        if (!user) return;
        setSaving(userId);
        try {
            await AuthAPI.permissionRole(userId, { role: user.role });
            setOriginalUsers((prev) =>
                prev.map((u) => (u._id === userId ? { ...u, role: user.role } : u))
            );
        } catch (err) {
            console.error("Lỗi khi lưu:", err);
        } finally {
            setSaving(null);
        }
    };

    const handleBanToggle = async (userId: string, isBanned: boolean) => {
        setBanning(userId);
        try {
            // Gọi API nếu có, ví dụ: await AuthAPI.toggleBan(userId)
            AuthAPI.bannedUser(userId, { isBanned })
                .then((res) => {
                    setUsers((prev) =>
                        prev.map((u) =>
                            u._id === userId ? { ...u, isActive: !isBanned } : u
                        )
                    );
                }).catch((error) => {
                    console.log("Lỗi: ", error)
                })

        } catch (err) {
            console.error("Lỗi khi cấm:", err);
        } finally {
            setBanning(null);
        }
    };

    const filteredUsers = users.filter(
        (u) =>
            u.userName.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Quản lý người dùng</h1>

            <div className="mb-4 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm theo tên hoặc email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded-lg px-4 py-2 w-full sm:w-1/2"
                />
            </div>

            <div className="overflow-x-auto bg-white shadow rounded-lg">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="p-3 border-b text-left">Tên người dùng</th>
                            <th className="p-3 border-b text-left">Email</th>
                            <th className="p-3 border-b text-left">Vai trò</th>
                            <th className="p-3 border-b text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => {
                                const original = originalUsers.find((u) => u._id === user._id);
                                const isChanged = user.role !== original?.role;

                                return (
                                    <tr
                                        key={user._id}
                                        className="hover:bg-gray-50 transition-colors h-14"
                                    >
                                        <td className="p-3 border-b">{user.userName}</td>
                                        <td className="p-3 border-b">{user.email}</td>
                                        <td className="p-3 border-b">
                                            <select
                                                value={user.role}
                                                onChange={(e) =>
                                                    handleChangeRole(user._id, e.target.value)
                                                }
                                                className="border rounded px-2 py-1"
                                            >
                                                {roles.map((role) => (
                                                    <option key={role} value={role}>
                                                        {role}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-3 border-b text-center space-x-2">
                                            <button
                                                onClick={() => handleSave(user._id)}
                                                disabled={saving === user._id || !isChanged}
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded text-white transition-colors ${saving === user._id
                                                    ? "bg-gray-400 cursor-not-allowed"
                                                    : isChanged
                                                        ? "bg-yellow-500 hover:bg-yellow-600"
                                                        : "invisible bg-yellow-500"
                                                    }`}
                                            >
                                                <Save size={14} />
                                                {saving === user._id ? "Đang lưu..." : "Lưu"}
                                            </button>

                                            <button
                                                onClick={() => handleBanToggle(user._id, user.isActive)}
                                                disabled={banning === user._id}
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded text-white transition-colors ${banning === user._id
                                                    ? "bg-gray-400 cursor-not-allowed"
                                                    : user.isActive
                                                        ? "bg-green-600 hover:bg-green-700"
                                                        : "bg-red-600 hover:bg-red-700"
                                                    }`}
                                            >
                                                {user.isActive ? (
                                                    <>
                                                        <Unlock size={14} /> Bỏ cấm
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock size={14} /> Cấm
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-center py-6 text-gray-500 italic"
                                >
                                    Không tìm thấy người dùng
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RolesPage;
