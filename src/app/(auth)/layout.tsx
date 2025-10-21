'use client'
import { useState } from "react";
import { useI18n } from "i18n/i18Provider";


const LayoutLoginRegister = ({ children }: { children: React.ReactNode }) => {
    const { locale, changeLanguage } = useI18n();
    return (
        <div className="login-container flex items-center justify-center min-h-screen bg-gray-100">
            <div className="absolute top-4 right-4">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={locale === "en"}
                        onChange={(e) => changeLanguage(e.target.checked ? "en" : "vi")}
                    />
                    <div className="w-16 h-8 flex items-center justify-between px-2 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition-colors text-xs font-semibold">
                        <span className={locale === "vi" ? "text-white" : "text-gray-700"}>VI</span>
                        <span className={locale === "en" ? "text-white" : "text-gray-700"}>EN</span>
                    </div>
                    {/* Nút gạt */}
                    <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-8"></div>
                </label>
            </div>
            {children}
        </div>
    );
};

export default LayoutLoginRegister;



