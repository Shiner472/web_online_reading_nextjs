'use client';

import { useEffect, useState } from "react";
import {
    Eye,
    Send,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Plus,
} from "lucide-react";
import NewsAPI from "api/newsAPI";
import AuthAPI from "api/authAPI";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useLoading } from "context/loadingContext";
import NotificationAPI from "api/notificationAPI";

type Category = {
    _id: string;
    name: { vi: string; en: string };
};

type Article = {
    _id: string;
    title: string;
    category: Category | string;
    featuredImage?: string;
    status: "draft" | "pending" | "published" | "rejected";
    summary?: string;
    content?: string;
};

const MyNewsPage = () => {
    const token = localStorage.getItem("token") || "";
    const [user, setUser] = useState<any>(null);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [articleList, setArticleList] = useState<Article[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();
    const { showLoading, hideLoading } = useLoading();

    useEffect(() => {
        if (token) {
            AuthAPI.getMe({ token }).then((res) => {
                setUser(res.data);
            });
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            NewsAPI.GetNewsByAuthor(user._id).then((res) => {
                setArticleList(res.data);
            });
        }
    }, [user]);


    const sortedArticles = [...articleList].sort((a, b) => {
        const order = { draft: 0, pending: 1, published: 2, rejected: 3 };
        return order[a.status] - order[b.status];
    });


    // Pagination setup
    const itemsPerPage = 5;
    const totalPages = Math.ceil(sortedArticles.length / itemsPerPage);
    const paginatedArticles = sortedArticles.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Handlers
    const handleSendRequest = async (a: Article) => {
        const data = { id: a._id, status: "pending" };
        showLoading();
        try {
            NewsAPI.UpdateNewsStatus(data).then((res) => {
                toast.success("📤 Đã gửi yêu cầu duyệt: " + a.title);
                setArticleList((prev) =>
                    prev.map((x) =>
                        x._id === a._id ? { ...x, status: "pending" } : x
                    )
                );
            }).catch((err) => {
                toast.error("❌ Gửi yêu cầu duyệt thất bại: " + err.message);
            });

            await NotificationAPI.createNotification({
                sender: user._id,
                role: ["editor", "chief_editor"],
                title: `Bạn đang có bài viết đang chờ duyệt từ ${user._id}!`,
                articleId: a._id
            });
        } catch (error) {
            toast.error("❌ Gửi yêu cầu duyệt thất bại: " + (error as Error).message);
        } finally {
            hideLoading();
        }
    };

    const handleEdit = (a: Article) => {
        router.push("/post/update/" + a._id);
    };

    const handleDelete = (a: Article) => {
        if (confirm(`Bạn có chắc muốn xóa "${a.title}" không?`)) {
            showLoading();
            try {
                NewsAPI.DeleteNews(a._id).then((res) => {
                    toast.success("✅ Xóa bài viết thành công: " + a.title);
                    setArticleList((prev) => prev.filter((x) => x._id !== a._id));
                }).catch((err) => {
                    toast.error("❌ Xóa bài viết thất bại: " + err.message);
                });

            } catch (error) {
                toast.error("❌ Xóa bài viết thất bại: " + (error as Error).message);
            } finally {
                hideLoading();
            }
        }
    };

    return (
        <div className="min-h-screen p-6 bg-slate-100">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">📰 Bài viết của tôi</h1>
                    <button
                        onClick={() => router.push("/post/create")}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 !text-white text-sm hover:bg-blue-700 shadow"
                    >
                        <Plus className="w-4 h-4" /> Thêm bài viết
                    </button>
                </div>

                {/* Danh sách bài viết */}
                <div className="bg-white p-6 rounded-2xl shadow">
                    <h2 className="text-lg font-semibold mb-4">Danh sách</h2>
                    <div className="divide-y">
                        {paginatedArticles.map((a) => (
                            <div
                                key={a._id}
                                className="flex gap-4 py-4 px-3 hover:bg-slate-50 transition rounded-lg border-b last:border-0"
                            >
                                {/* Thumbnail */}
                                <div className="w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-200">
                                    <img
                                        src={a.featuredImage || "/placeholder.png"}
                                        alt={a.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex flex-col flex-1">
                                    {/* Title */}
                                    <div className="font-semibold text-base text-slate-800 line-clamp-2">
                                        {a.title}
                                    </div>

                                    {/* Category + Status */}
                                    <div className="mt-1 flex items-center gap-2 text-xs">
                                        <span className="inline-block px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                            {typeof a.category === "string"
                                                ? a.category
                                                : a.category?.name?.vi || ""}
                                        </span>

                                        {a.status === "draft" && (
                                            <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                                                📝 Bản nháp
                                            </span>
                                        )}
                                        {a.status === "pending" && (
                                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                                ⏳ Đang chờ duyệt
                                            </span>
                                        )}
                                        {a.status === "published" && (
                                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                                ✅ Đã xuất bản
                                            </span>
                                        )}
                                        {a.status === "rejected" && (
                                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                                ⛔ Bị từ chối
                                            </span>
                                        )}
                                    </div>

                                    {/* Summary */}
                                    {a.summary && (
                                        <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                                            {a.summary}
                                        </p>
                                    )}

                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-3">
                                    <button
                                        onClick={() => setSelectedArticle(a)}
                                        className="px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-sm flex items-center gap-1 text-blue-600 hover:bg-blue-100"
                                    >
                                        <Eye className="w-4 h-4" /> Xem
                                    </button>

                                    {a.status === "draft" && (
                                        <button
                                            onClick={() => handleSendRequest(a)}
                                            className="px-3 py-1 rounded-md bg-green-50 border border-green-200 text-sm flex items-center gap-1 text-green-600 hover:bg-green-100"
                                        >
                                            <Send className="w-4 h-4" /> Gửi duyệt
                                        </button>
                                    )}

                                    {a.status === "draft" && (
                                        <button
                                            onClick={() => handleEdit(a)}
                                            className="px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-sm flex items-center gap-1 text-amber-600 hover:bg-amber-100"
                                        >
                                            <Pencil className="w-4 h-4" /> Sửa
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleDelete(a)}
                                        className="px-3 py-1 rounded-md bg-red-50 border border-red-200 text-sm flex items-center gap-1 text-red-600 hover:bg-red-100"
                                    >
                                        <Trash2 className="w-4 h-4" /> Xóa
                                    </button>
                                </div>
                            </div>
                        ))}

                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-4 text-sm">
                        <span>
                            Trang {currentPage}/{totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-2 py-1 rounded-md border disabled:opacity-40"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-2 py-1 rounded-md border disabled:opacity-40"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal chi tiết */}
                {selectedArticle && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    📖 Chi tiết bài viết
                                </h2>
                            </div>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto flex-1 p-6">
                                <h3 className="text-xl font-bold text-slate-800">
                                    {selectedArticle.title}
                                </h3>

                                <div className="mt-2 flex items-center gap-3 text-sm">
                                    <span className="inline-block px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                        {typeof selectedArticle.category === "string"
                                            ? selectedArticle.category
                                            : (selectedArticle.category as Category)?.name?.vi || ""}
                                    </span>

                                    {selectedArticle.status === "draft" && (
                                        <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                                            📝 Bản nháp
                                        </span>
                                    )}
                                    {selectedArticle.status === "pending" && (
                                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                            ⏳ Đang chờ duyệt
                                        </span>
                                    )}
                                    {selectedArticle.status === "published" && (
                                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                            ✅ Đã xuất bản
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div
                                    className="mt-6 prose prose-sm max-w-none text-slate-700"
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            typeof selectedArticle.content === "string"
                                                ? selectedArticle.content
                                                : selectedArticle.content || "",
                                    }}
                                />
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-2 border-t p-4">
                                <button
                                    onClick={() => setSelectedArticle(null)}
                                    className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm hover:bg-slate-300"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
};

export default MyNewsPage;
