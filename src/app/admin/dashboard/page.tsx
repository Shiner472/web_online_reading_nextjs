"use client";

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Newspaper, Users, Eye, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import DashboardAPI from "api/dashboardAPI";
import { toast } from "react-toastify";

const DashboardPage = () => {
    const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    const [overview, setOverview] = useState<any>(0);
    const [readerStats, setReaderStats] = useState<any[]>([]);
    const [categoryStats, setCategoryStats] = useState<any[]>([]);
    const [topArticles, setTopArticles] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [overviewRes, readerRes, catRes, topRes] = await Promise.all([
                    DashboardAPI.GetOverView(),
                    DashboardAPI.GetReadersByDay(),
                    DashboardAPI.GetCategoryStats(),
                    DashboardAPI.GetTopArticles()
                ]);

                setOverview(overviewRes.data);
                setReaderStats(readerRes.data);
                setTopArticles(topRes.data);
                setCategoryStats(catRes.data);
            } catch (err) {
                toast.error("Lỗi tải dữ liệu dashboard");
            }
        };
        fetchData();

    }, [])

    function formatDuration(seconds: number) {
        if (!seconds) return "0:00 phút";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")} phút`;
    }


    return (
        <div className="min-h-screen from-gray-50 to-slate-200 p-8">
            {/* Thông tin tổng quan */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-600 font-semibold">Bài viết</p>
                        <Newspaper className="text-blue-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{overview.totalArticles}</h3>
                    <p className="text-sm text-gray-500">
                        {
                            overview?.growth?.growthArticles > 0
                                ? `+${overview?.growth?.growthArticles.toFixed(1)}% so với tuần trước`
                                : overview?.growth?.growthArticles < 0
                                    ? `${overview?.growth?.growthArticles.toFixed(1)}% giảm so với tuần trước`
                                    : "ổn định"
                        }
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-600 font-semibold">Người đọc</p>
                        <Users className="text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{overview.totalReaders}</h3>
                    <p className="text-sm text-gray-500">
                        {
                            overview?.growth?.growthReaders > 0
                                ? `+${overview?.growth?.growthReaders.toFixed(1)}% so với tuần trước`
                                : overview?.growth?.growthReaders < 0
                                    ? `${overview?.growth?.growthReaders.toFixed(1)}% giảm so với tuần trước`
                                    : "ổn định"
                        }
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-600 font-semibold">Lượt xem</p>
                        <Eye className="text-orange-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{overview.totalViews}</h3>
                    <p className="text-sm text-gray-500">
                        {
                            overview?.growth?.growthViews > 0
                                ? `+${overview?.growth?.growthViews.toFixed(1)}% so với tuần trước`
                                : overview?.growth?.growthViews < 0
                                    ? `${overview?.growth?.growthViews.toFixed(1)}% giảm so với tuần trước`
                                    : "ổn định"
                        }
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-600 font-semibold">Thời gian đọc TB</p>
                        <Clock className="text-purple-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{formatDuration(overview.avgReadingTime)}</h3>
                    <p className="text-sm text-gray-500">
                        {
                            overview?.growth?.growReading > 2
                                ? `+${overview?.growth?.growthReading.toFixed(1)}% so với tuần trước`
                                : overview?.growth?.growthReading < -2
                                    ? `${overview?.growth?.growthReading.toFixed(1)}% giảm so với tuần trước`
                                    : "ổn định"
                        }
                    </p>
                </div>
            </motion.div>

            {/* Biểu đồ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Biểu đồ line */}
                <div className="col-span-2 bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
                    <h3 className="text-gray-700 font-semibold mb-4">
                        Lượng người đọc theo ngày (7 ngày gần nhất)
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={readerStats}>
                            <XAxis dataKey="day" stroke="#999" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="readers"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Biểu đồ tròn */}
                <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
                    <h3 className="text-gray-700 font-semibold mb-4">
                        Chuyên mục được đọc nhiều
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={categoryStats}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                            >
                                {categoryStats.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bảng bài viết nổi bật */}
            <div className="bg-white rounded-2xl shadow-md p-6 mt-8 hover:shadow-xl transition">
                <h3 className="text-gray-700 font-semibold mb-4 flex items-center justify-between">
                    Top bài viết nổi bật
                    <span className="text-sm text-gray-400">Theo lượt xem</span>
                </h3>

                <table className="w-full text-left border-t border-gray-100">
                    <thead>
                        <tr className="text-gray-500 border-b bg-slate-50">
                            <th className="py-2 px-2 font-medium w-12">#</th>
                            <th className="py-2 px-2 font-medium">Tiêu đề</th>
                            <th className="py-2 px-2 font-medium">Thể loại</th>
                            <th className="py-2 px-2 text-right font-medium">Lượt xem</th>
                        </tr>
                    </thead>

                    <tbody>
                        {topArticles.map((item, idx) => (
                            <tr
                                key={idx}
                                className="border-b hover:bg-slate-50 transition-all"
                            >
                                {/* Số thứ tự */}
                                <td className="py-3 px-2 font-bold text-blue-500">{idx + 1}</td>

                                {/* Tiêu đề */}
                                <td className="py-3 px-2 font-medium text-gray-800">
                                    {item.title}
                                </td>

                                {/* Thể loại có màu riêng */}
                                <td className="py-3 px-2">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${item.category === "Thể thao"
                                            ? "bg-blue-100 text-blue-700"
                                            : item.category === "Công nghệ"
                                                ? "bg-purple-100 text-purple-700"
                                                : item.category === "Kinh tế"
                                                    ? "bg-amber-100 text-amber-700"
                                                    : item.category === "Giải trí"
                                                        ? "bg-pink-100 text-pink-700"
                                                        : "bg-green-100 text-green-700"
                                            }`}
                                    >
                                        {item.category}
                                    </span>
                                </td>

                                {/* Lượt xem */}
                                <td className="py-3 px-2 text-right text-gray-700 font-semibold">
                                    {item.views.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default DashboardPage;
