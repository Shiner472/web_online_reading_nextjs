'use client';
import InputField from "components/inputField/inputField";
import { useState } from "react";



const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    return (
        <div className="space-y-4">
            <InputField id="current-password" label="Mật khẩu hiện tại" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            <InputField id="new-password" label="Mật khẩu mới" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            <InputField id="confirm-password" label="Xác nhận mật khẩu mới" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <div className="w-full flex justify-center">
                <button className="mt-4 bg-blue-500 !text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600">
                    Cập nhật mật khẩu
                </button>
            </div>

        </div>
    )

};

export default ChangePassword;