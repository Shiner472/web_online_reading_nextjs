'use client';
import CategoryAPI from "api/categoryAPI";
import { useEffect, useState } from "react";

const FooterUser = () => {
    const [listCategories, setListCategories] = useState<any[]>([]);

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
                                        className={`cursor-pointer hover:text-blue-600 transition-colors ${
                                            i === 0 ? "font-semibold" : ""
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
                            <button className="px-3 py-1 border rounded">VnExpress</button>
                            <button className="px-3 py-1 border rounded">International</button>
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold">Liên hệ</p>
                        <div className="flex gap-4 mt-2">
                            <span>📧 Tòa soạn</span>
                            <span>📢 Quảng cáo</span>
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold">Đường dây nóng</p>
                        <p>083.888.0123 (Hà Nội)</p>
                        <p>082.233.3555 (TP.HCM)</p>
                    </div>
                </div>

                {/* Newsletter */}
                <div className="bg-gray-100 p-4 rounded mt-6 flex flex-col md:flex-row items-center gap-3">
                    <div className="flex-1">
                        <p className="font-semibold text-lg">Đừng bỏ lỡ tin tức quan trọng!</p>
                        <p className="text-gray-600 text-sm">
                            Nhận tóm tắt tin tức nổi bật, hấp dẫn nhất 24 giờ qua trên VnExpress.
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
                    <p>Báo điện tử VnExpress</p>
                    <p>Báo tiếng Việt nhiều người xem nhất. Thuộc Bộ Khoa học và Công nghệ</p>
                    <p>
                        Giấy phép: 548/GP-BTTTT do Bộ Thông tin và Truyền thông cấp ngày 24/08/2021
                    </p>
                    <p>
                        Tổng biên tập: Phạm Văn Hiếu | Địa chỉ: Tầng 10, Tòa A FPT Tower, số 10 Phạm Văn Bạch, Hà Nội
                    </p>
                    <p>Điện thoại: 024 7300 8899</p>
                    <p>© 1997-2025. Toàn bộ bản quyền thuộc VnExpress</p>
                </div>
            </div>
        </footer>
    );
};

export default FooterUser;
