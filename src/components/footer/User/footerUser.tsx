'use client';
import CategoryAPI from "api/categoryAPI";
import SettingsAPI from "api/settingsAPI";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const FooterUser = () => {
    const [listCategories, setListCategories] = useState<any[]>([]);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [iconPreview, setIconPreview] = useState<string | null>(null);
    const [nameWebsite, setNameWebsite] = useState<string>('');
    const [emailWebsite, setEmailWebsite] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [descriptionWebsite, setDescriptionWebsite] = useState<string>('');

    useEffect(() => {
        CategoryAPI.getAllCategories()
            .then((res) => {
                setListCategories(res.data || []);
            })
            .catch((err) => {
                console.error("Error fetching categories:", err);
            });
    }, []);

    // ✅ Chia danh mục thành 4 cột
    const columns = (() => {
        if (!listCategories || listCategories.length === 0) return [];
        const perCol = Math.ceil(listCategories.length / 4);
        const result = [];
        for (let i = 0; i < 4; i++) {
            result.push(listCategories.slice(i * perCol, (i + 1) * perCol));
        }
        return result;
    })();


    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await SettingsAPI.getSettings().then((res) => res.data);
                if (res) {
                    setLogoPreview(res.logo || null);
                    setIconPreview(res.iconLogo || null);
                    setNameWebsite(res.nameWebsite || '');
                    setEmailWebsite(res.emailWebsite || '');
                    setPhoneNumber(res.phoneWebsite || '');
                    setDescriptionWebsite(res.descriptionWebsite || '');
                }
            } catch (error) {
                toast.error("❌ Có lỗi xảy ra khi tải cài đặt!");
            }
        };

        fetchSettings();
    }, []);

    return (
        <footer className="text-sm text-gray-700 mt-20 border-t border-gray-400">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Các link menu */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 text-align-center">
                    {columns.length > 0 ? (
                        columns.map((col, idx) => (
                            <div key={idx} className="space-y-2">
                                {col.map((cat: any, i: number) => (
                                    <p
                                        key={cat._id}
                                        className={`cursor-pointer hover:text-blue-600 transition-colors ${i === 0 ? "font-semibold" : ""
                                            }`}
                                    >
                                        {cat.name?.vi || cat.name}
                                    </p>
                                ))}
                            </div>
                        ))
                    ) : (
                        // ✅ Fallback khi chưa có dữ liệu
                        <>
                            <div className="space-y-2">
                                <p className="font-semibold">Tin tức</p>
                                <p>Kinh doanh</p>
                                <p>Công nghệ</p>
                                <p>Thể thao</p>
                                <p>Giải trí</p>
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold">Đời sống</p>
                                <p>Giáo dục</p>
                                <p>Sức khỏe</p>
                                <p>Du lịch</p>
                                <p>Tâm sự</p>
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold">Khác</p>
                                <p>Mới nhất</p>
                                <p>Xem nhiều</p>
                                <p>Tin nóng</p>
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold">Liên hệ</p>
                                <p>Về chúng tôi</p>
                                <p>Quảng cáo</p>
                                <p>Tuyển dụng</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Liên hệ */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t pt-6">
                    <div>
                        <p className="font-semibold">Tải ứng dụng</p>
                        <div className="flex gap-2 mt-2">
                            <button className="px-3 py-1 border rounded">{nameWebsite}</button>
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold">Đường dây nóng</p>
                        <p>{phoneNumber}</p>
                    </div>
                </div>

                {/* Newsletter */}
                <div className="bg-gray-100 p-4 rounded mt-6 flex flex-col md:flex-row items-center gap-3">
                    <div className="flex-1">
                        <p className="font-semibold text-lg">Đừng bỏ lỡ tin tức quan trọng!</p>
                        <p className="text-gray-600 text-sm">
                            Nhận tóm tắt tin tức nổi bật, hấp dẫn nhất 24 giờ qua trên {nameWebsite}.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Địa chỉ Email..."
                            className="border rounded px-3 py-2"
                        />
                        <button className="bg-red-600 text-white px-4 py-2 rounded">
                            Đăng ký
                        </button>
                    </div>
                </div>

                {/* Thông tin bản quyền */}
                <div className="mt-8 text-xs text-gray-600 space-y-2">
                    <p>Báo điện tử {nameWebsite}</p>
                    <p>Báo tiếng Việt nhiều người xem nhất. Thuộc Bộ Khoa học và Công nghệ</p>
                    <p>Email: {emailWebsite}</p>
                    <p>Điện thoại: {phoneNumber}</p>
                    <p>© 1997-2025. Toàn bộ bản quyền thuộc {nameWebsite}</p>
                </div>
            </div>
        </footer>
    );
};

export default FooterUser;
