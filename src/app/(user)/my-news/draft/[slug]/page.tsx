"use client";

import NewsAPI from "api/newsAPI";
import { NewsRevisionAPI } from "api/newsRevisionAPI";
import NotificationAPI from "api/notificationAPI";
import { ChevronLeft, ChevronRight, Eye, Pencil, Send, Trash2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";



const DraftArticlePage = () => {
    const [articlesDraft, setArticlesDraft] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const params = useParams();
    const slugParam = params?.slug ?? "";
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
    const searchParams = useSearchParams();
    const rawPage = searchParams?.get("page");
    const page = rawPage ? Number(rawPage) : 1;
    const [totalPages, setTotalPages] = useState(1);

    const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

    useEffect(() => {
        fetchDrafts();
    }, []);

    const changePage = (newPage: number) => {
        newPage === 1 ? router.push(`/my-news/draft/${slug}`) : router.push(`/my-news/draft/${slug}?page=${newPage}`);
    };

    const fetchDrafts = async () => {
        try {
            NewsAPI.GetCraftsByNewsId(slug).then((res) => {
                console.log("Drafts fetched:", res.data);
                setArticlesDraft(res.data.items);
                setTotalPages(res.data.totalPages);
            });
        } catch (error) {
            console.error("Fetch drafts failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa bài nháp này không?")) return;

        await fetch(`/api/articles/${id}`, {
            method: "DELETE",
        });

        setArticlesDraft((prev) => prev.filter((a) => a._id !== id));
    };

    const handleEdit = (article: any) => {
        router.push(`/post/update/${article._id}`);
    };

    const handleSendRequest = async (a: any) => {
        const data = { status: "pending" };
        // showLoading();
        try {
            await NewsRevisionAPI.updateStatusNewsRevision(a._id, data);
            toast.success("📤 Đã gửi yêu cầu duyệt: " + a.title);

            setArticlesDraft((prev) =>
                prev.map((x) =>
                    x._id === a._id ? { ...x, status: "pending" } : x
                )
            );

            await NotificationAPI.createNotification({
                sender: a.news.author,
                role: ["editor", "chief_editor"],
                title: `Bạn đang có bài viết đang chờ duyệt từ ${a.news.author}!`,
                articleId: a._id
            });

        } catch (error) {
            toast.error("❌ Gửi yêu cầu duyệt thất bại");
        } finally {
            // hideLoading();
        }
    };

    if (loading) return <p>Đang tải...</p>;

    return (
        <div className="min-h-screen p-6 bg-slate-100">
            <div className="max-w-6xl mx-auto space-y-6">

                <div className="p-6">
                    <h1 className="text-2xl font-semibold mb-4">
                        📄 Danh sách bài viết nháp
                    </h1>

                    <div className="bg-white p-6 rounded-2xl shadow">
                        {articlesDraft.length === 0 ? (
                            <p>Không có bài nháp nào</p>
                        ) : (
                            <div>

                                <div className="divide-y">
                                    {articlesDraft.map((a) => (
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
                                                <div className="font-semibold text-base text-slate-800 line-clamp-2">
                                                    {a.title}
                                                </div>

                                                <div className="mt-1 flex items-center gap-2 text-xs">
                                                    <span className="inline-block px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                                        {typeof a.category === "string"
                                                            ? a.category
                                                            : a.category?.name?.vi}
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
                                                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-green-700">
                                                            Bị từ chối
                                                        </span>
                                                    )}
                                                </div>

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
                                                    <>
                                                        <button
                                                            onClick={() => handleSendRequest(a)}
                                                            className="px-3 py-1 rounded-md bg-green-50 border border-green-200 text-sm flex items-center gap-1 text-green-600 hover:bg-green-100"
                                                        >
                                                            <Send className="w-4 h-4" /> Gửi duyệt
                                                        </button>


                                                    </>
                                                )}

                                                <button
                                                    onClick={() => handleEdit(a)}
                                                    className="px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-sm flex items-center gap-1 text-amber-600 hover:bg-amber-100"
                                                >
                                                    <Pencil className="w-4 h-4" /> Sửa
                                                </button>

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


                                <div className="flex justify-between items-center mt-4 text-sm">
                                    <span>
                                        Trang {page}/{totalPages}
                                    </span>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => changePage(page - 1)}
                                            disabled={page <= 1}
                                            className="px-2 py-1 rounded-md border disabled:opacity-40"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => changePage(page + 1)}
                                            disabled={page >= totalPages}
                                            className="px-2 py-1 rounded-md border disabled:opacity-40"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>


                                    {/* Modal chi tiết */}
                                    {selectedArticle && (
                                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                                            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">

                                                <div className="flex items-center justify-between p-4 border-b">
                                                    <h2 className="text-lg font-semibold">📖 Chi tiết bài viết</h2>
                                                </div>

                                                <div className="overflow-y-auto flex-1 p-6">
                                                    <h3 className="text-xl font-bold">{selectedArticle.title}</h3>

                                                    <div className="mt-2 flex items-center gap-3 text-sm">
                                                        <span className="inline-block px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                                            {typeof selectedArticle.category === "string"
                                                                ? selectedArticle.category
                                                                : selectedArticle.category?.name?.vi}
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

                                                    <div
                                                        className="mt-6 prose prose-sm max-w-none text-slate-700"
                                                        dangerouslySetInnerHTML={{
                                                            __html: selectedArticle.content || "",
                                                        }}
                                                    />
                                                </div>

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


                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DraftArticlePage;
