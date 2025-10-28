"use client";

import { useEffect, useState } from "react";
import { Save, Lock, Unlock, Plus, X } from "lucide-react";
import AuthAPI from "api/authAPI";
import { toast } from "react-toastify";

const RolesPage = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [originalUsers, setOriginalUsers] = useState<any[]>([]);
    const [saving, setSaving] = useState<string | null>(null);
    const [banning, setBanning] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ email: "", role: "editor" });
    const [creating, setCreating] = useState(false);

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
            prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
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
            toast.success("✅ Cập nhật vai trò thành công!");
        } catch (err) {
            toast.error("❌ Có lỗi xảy ra khi lưu thay đổi vai trò!");
        } finally {
            setSaving(null);
        }
    };

    const handleBanToggle = async (userId: string, isBanned: boolean) => {
        setBanning(userId);
        try {
            await AuthAPI.bannedUser(userId, { isBanned });
            setUsers((prev) =>
                prev.map((u) =>
                    u._id === userId ? { ...u, isActive: !isBanned } : u
                )
            );
            toast.success(isBanned ? "✅ Đã mở cấm người dùng!" : "🚫 Đã cấm người dùng!");
        } catch (err) {
            toast.error("❌ Có lỗi xảy ra khi cấm/mở cấm người dùng!");
        } finally {
            setBanning(null);
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.email.trim()) {
            toast.warning("⚠️ Vui lòng nhập email người dùng!");
            return;
        }

        setCreating(true);
        try {
            const res = await AuthAPI.createUser(newUser);
            setUsers((prev) => [...prev, res.data]);
            setOriginalUsers((prev) => [...prev, res.data]);
            toast.success("✅ Thêm người dùng thành công!");
            setIsModalOpen(false);
            setNewUser({ email: "", role: "editor" });
        } catch (err) {
            toast.error("❌ Có lỗi xảy ra khi thêm người dùng!");
        } finally {
            setCreating(false);
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

            {/* Thanh tìm kiếm + nút thêm */}
            <div className="mb-4 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm theo tên hoặc email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded-lg px-4 py-2 w-full sm:w-1/2"
                />

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="ml-4 px-4 py-2 bg-green-600 !text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                    <Plus size={18} /> Thêm người dùng
                </button>
            </div>

            {/* Bảng người dùng */}
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
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors h-14">
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
                                                onClick={() =>
                                                    handleBanToggle(user._id, user.isActive)
                                                }
                                                disabled={banning === user._id}
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded text-white transition-colors ${banning === user._id
                                                        ? "bg-gray-400 cursor-not-allowed"
                                                        : user.isActive
                                                            ? "bg-red-600 hover:bg-red-700"
                                                            : "bg-green-600 hover:bg-green-700"
                                                    }`}
                                            >
                                                {user.isActive ? (
                                                    <>
                                                        <Lock size={14} /> Cấm
                                                    </>
                                                ) : (
                                                    <>
                                                        <Unlock size={14} /> Bỏ cấm
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

            {/* Modal thêm người dùng */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-semibold mb-4">Thêm người dùng mới</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Email người dùng
                                </label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) =>
                                        setNewUser((prev) => ({ ...prev, email: e.target.value }))
                                    }
                                    className="border rounded-lg px-3 py-2 w-full focus:ring focus:ring-green-300 outline-none"
                                    placeholder="Nhập email người dùng..."
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">
                                    Vai trò
                                </label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) =>
                                        setNewUser((prev) => ({ ...prev, role: e.target.value }))
                                    }
                                    className="border rounded-lg px-3 py-2 w-full"
                                >
                                    <option value="editor">Editor</option>
                                    <option value="chief_editor">Chief Editor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex justify-end mt-6 space-x-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleCreateUser}
                                    disabled={creating}
                                    className={`px-4 py-2 rounded-lg !text-white transition ${creating
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-green-600 hover:bg-green-700"
                                        }`}
                                >
                                    {creating ? "Đang lưu..." : "Lưu"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RolesPage;
