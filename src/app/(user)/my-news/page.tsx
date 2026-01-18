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
    Undo,
    DraftingCompass
} from "lucide-react";
import NewsAPI from "api/newsAPI";
import AuthAPI from "api/authAPI";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useLoading } from "context/loadingContext";
import NotificationAPI from "api/notificationAPI";
import ArticleListLayout from "components/articleList/ArticleListLayout";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "lib/store";
import { getArticlesByAuthor, setSelectedArticle } from "lib/features/articles/articlesSlice";

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
    isCanUndo?: boolean;
    summary?: string;
    content?: string;
};

const MyNewsPage = () => {
    const token = localStorage.getItem("token") || "";

    const searchParams = useSearchParams();
    const rawPage = searchParams?.get("page");
    const page = rawPage ? Number(rawPage) : 1;

    const [user, setUser] = useState<any>(null);
    // const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [articleList, setArticleList] = useState<Article[]>([]);
    // const [totalPages, setTotalPages] = useState(1);

    const router = useRouter();
    const { showLoading, hideLoading } = useLoading();


    const dispatch = useDispatch<AppDispatch>();
    const { list, totalPages, selected } = useSelector(
        (state: RootState) => state.articles
    );

    // Get user
    useEffect(() => {
        if (token) {
            AuthAPI.getMe({ token }).then((res) => {
                setUser(res.data);
            });
        }
    }, [token]);

    // Fetch news when user or page changes
    // useEffect(() => {
    //     if (user) {
    //         NewsAPI.GetNewsByAuthor(user._id, 5, page).then((res) => {
    //             setArticleList(res.data.items);
    //             setTotalPages(res.data.totalPages);
    //         });
    //     }
    // }, [user, page]);

    useEffect(() => {
        dispatch(getArticlesByAuthor({ authorId: user?._id, page, limit: 5 }));
    }, [user, page, dispatch]);

    useEffect(() => {
        if (user && articleList.length > 0) {
            NewsAPI.updateListArticlesCanUndo(user._id).then((res) => {
                console.log("Articles can undo:", res.data);
            });
        }
    }, [user, articleList]);

    const changePage = (newPage: number) => {
        newPage === 1 ? router.push(`/my-news`) : router.push(`/my-news?page=${newPage}`);
    };

    const handleSendRequest = async (a: Article) => {
        const data = { id: a._id, status: "pending" };
        showLoading();
        try {
            await NewsAPI.UpdateNewsStatus(data);
            toast.success("📤 Đã gửi yêu cầu duyệt: " + a.title);

            setArticleList((prev) =>
                prev.map((x) =>
                    x._id === a._id ? { ...x, status: "pending" } : x
                )
            );

            await NotificationAPI.createNotification({
                sender: user._id,
                role: ["editor", "chief_editor"],
                title: `Bạn đang có bài viết đang chờ duyệt từ ${user._id}!`,
                articleId: a._id
            });

        } catch (error) {
            toast.error("❌ Gửi yêu cầu duyệt thất bại");
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
            NewsAPI.DeleteNews(a._id)
                .then(() => {
                    toast.success("✅ Xóa bài viết thành công: " + a.title);
                    setArticleList((prev) =>
                        prev.filter((x) => x._id !== a._id)
                    );
                })
                .catch((err) => {
                    toast.error("❌ Xóa bài viết thất bại: " + err.message);
                })
                .finally(() => hideLoading());
        }
    };

    const handleUndo = async (a: Article) => {
        showLoading();
        const data = { id: a._id, status: "draft" };
        try {
            await NewsAPI.UpdateNewsStatus(data);
            setArticleList((prev) =>
                prev.map((x) =>
                    x._id === a._id ? { ...x, status: "draft" } : x
                )
            );
        } catch (error) {
            toast.error("❌ Thu hồi bài viết thất bại");
        } finally {
            hideLoading();
        }
    }

    const handleDirectToDrafts = (a: Article) => {
        router.push(`/my-news/draft/${a._id}`);
    };


    return (
        // <div className="min-h-screen p-6 bg-slate-100">
        //     <div className="max-w-6xl mx-auto space-y-6">

        //         {/* Header */}
        //         <div className="flex items-center justify-between">
        //             <h1 className="text-2xl font-bold">📰 Bài viết của tôi</h1>
        //             <button
        //                 onClick={() => router.push("/post/create")}
        //                 className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 !text-white text-sm hover:bg-blue-700 shadow"
        //             >
        //                 <Plus className="w-4 h-4" /> Thêm bài viết
        //             </button>
        //         </div>

        //         {/* List */}
        //         <div className="bg-white p-6 rounded-2xl shadow">
        //             <h2 className="text-lg font-semibold mb-4">Danh sách</h2>

        //             <div className="divide-y">
        //                 {articleList.map((a) => (
        //                     <div
        //                         key={a._id}
        //                         className="flex gap-4 py-4 px-3 hover:bg-slate-50 transition rounded-lg border-b last:border-0"
        //                     >
        //                         {/* Thumbnail */}
        //                         <div className="w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-200">
        //                             <img
        //                                 src={a.featuredImage || "/placeholder.png"}
        //                                 alt={a.title}
        //                                 className="w-full h-full object-cover"
        //                             />
        //                         </div>

        //                         {/* Content */}
        //                         <div className="flex flex-col flex-1">
        //                             <div className="font-semibold text-base text-slate-800 line-clamp-2">
        //                                 {a.title}
        //                             </div>

        //                             <div className="mt-1 flex items-center gap-2 text-xs">
        //                                 <span className="inline-block px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
        //                                     {typeof a.category === "string"
        //                                         ? a.category
        //                                         : a.category?.name?.vi}
        //                                 </span>

        //                                 {a.status === "draft" && (
        //                                     <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
        //                                         📝 Bản nháp
        //                                     </span>
        //                                 )}
        //                                 {a.status === "pending" && (
        //                                     <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
        //                                         ⏳ Đang chờ duyệt
        //                                     </span>
        //                                 )}
        //                                 {a.status === "published" && (
        //                                     <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        //                                         ✅ Đã xuất bản
        //                                     </span>
        //                                 )}
        //                                 {a.status === "rejected" && (
        //                                     <span className="px-2 py-0.5 rounded-full bg-red-100 text-green-700">
        //                                         Bị từ chối
        //                                     </span>
        //                                 )}
        //                             </div>

        //                             {a.summary && (
        //                                 <p className="mt-2 text-sm text-slate-600 line-clamp-2">
        //                                     {a.summary}
        //                                 </p>
        //                             )}
        //                         </div>

        //                         {/* Actions */}
        //                         <div className="flex items-center gap-2 mt-3">
        //                             <button
        //                                 onClick={() => setSelectedArticle(a)}
        //                                 className="px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-sm flex items-center gap-1 text-blue-600 hover:bg-blue-100"
        //                             >
        //                                 <Eye className="w-4 h-4" /> Xem
        //                             </button>

        //                             {a.status === "draft" && (
        //                                 <>
        //                                     <button
        //                                         onClick={() => handleSendRequest(a)}
        //                                         className="px-3 py-1 rounded-md bg-green-50 border border-green-200 text-sm flex items-center gap-1 text-green-600 hover:bg-green-100"
        //                                     >
        //                                         <Send className="w-4 h-4" /> Gửi duyệt
        //                                     </button>


        //                                 </>
        //                             )}

        //                             {(a.isCanUndo && a.status === "pending") && (
        //                                 <button
        //                                     onClick={() => handleUndo(a)}
        //                                     className="px-3 py-1 rounded-md bg-gray-50 border border-gray-200 text-sm flex items-center gap-1 text-gray-600 hover:bg-gray-100"
        //                                 >
        //                                     <Undo className="w-4 h-4" /> Thu hồi
        //                                 </button>
        //                             )}

        //                             <button
        //                                 onClick={() => handleDirectToDrafts(a)}
        //                                 className="px-3 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-sm flex items-center gap-1 text-indigo-600 hover:bg-indigo-100"
        //                             >
        //                                 <DraftingCompass className="w-4 h-4" /> Bản nháp
        //                             </button>

        //                             <button
        //                                 onClick={() => handleEdit(a)}
        //                                 className="px-3 py-1 rounded-md bg-amber-50 border border-amber-200 text-sm flex items-center gap-1 text-amber-600 hover:bg-amber-100"
        //                             >
        //                                 <Pencil className="w-4 h-4" /> Sửa
        //                             </button>

        //                             <button
        //                                 onClick={() => handleDelete(a)}
        //                                 className="px-3 py-1 rounded-md bg-red-50 border border-red-200 text-sm flex items-center gap-1 text-red-600 hover:bg-red-100"
        //                             >
        //                                 <Trash2 className="w-4 h-4" /> Xóa
        //                             </button>
        //                         </div>
        //                     </div>
        //                 ))}
        //             </div>

        //             {/* Pagination */}
        //             <div className="flex justify-between items-center mt-4 text-sm">
        //                 <span>
        //                     Trang {page}/{totalPages}
        //                 </span>

        //                 <div className="flex gap-2">
        //                     <button
        //                         onClick={() => changePage(page - 1)}
        //                         disabled={page <= 1}
        //                         className="px-2 py-1 rounded-md border disabled:opacity-40"
        //                     >
        //                         <ChevronLeft className="w-4 h-4" />
        //                     </button>

        //                     <button
        //                         onClick={() => changePage(page + 1)}
        //                         disabled={page >= totalPages}
        //                         className="px-2 py-1 rounded-md border disabled:opacity-40"
        //                     >
        //                         <ChevronRight className="w-4 h-4" />
        //                     </button>
        //                 </div>
        //             </div>
        //         </div>

        //         {/* Modal chi tiết */}
        //         {selectedArticle && (
        //             <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        //                 <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">

        //                     <div className="flex items-center justify-between p-4 border-b">
        //                         <h2 className="text-lg font-semibold">📖 Chi tiết bài viết</h2>
        //                     </div>

        //                     <div className="overflow-y-auto flex-1 p-6">
        //                         <h3 className="text-xl font-bold">{selectedArticle.title}</h3>

        //                         <div className="mt-2 flex items-center gap-3 text-sm">
        //                             <span className="inline-block px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
        //                                 {typeof selectedArticle.category === "string"
        //                                     ? selectedArticle.category
        //                                     : selectedArticle.category?.name?.vi}
        //                             </span>

        //                             {selectedArticle.status === "draft" && (
        //                                 <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
        //                                     📝 Bản nháp
        //                                 </span>
        //                             )}
        //                             {selectedArticle.status === "pending" && (
        //                                 <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
        //                                     ⏳ Đang chờ duyệt
        //                                 </span>
        //                             )}
        //                             {selectedArticle.status === "published" && (
        //                                 <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        //                                     ✅ Đã xuất bản
        //                                 </span>
        //                             )}
        //                         </div>

        //                         <div
        //                             className="mt-6 prose prose-sm max-w-none text-slate-700"
        //                             dangerouslySetInnerHTML={{
        //                                 __html: selectedArticle.content || "",
        //                             }}
        //                         />
        //                     </div>

        //                     <div className="flex justify-end gap-2 border-t p-4">
        //                         <button
        //                             onClick={() => setSelectedArticle(null)}
        //                             className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm hover:bg-slate-300"
        //                         >
        //                             Đóng
        //                         </button>
        //                     </div>

        //                 </div>
        //             </div>
        //         )}

        //     </div>
        // </div>
        <ArticleListLayout
            title="📰 Bài viết của tôi"
            items={list}
            page={page}
            totalPages={totalPages}
            onPageChange={changePage}
            selectedItem={selected}
            closeModal={() => dispatch(setSelectedArticle(null))}
            renderButtons={() => (
                <>
                    <button
                        onClick={() => router.push("/post/create")}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 !text-white text-sm hover:bg-blue-700 shadow"
                    >
                        <Plus className="w-4 h-4" /> Thêm bài viết
                    </button>
                </>
            )}
            renderActions={(a) => (
                <>
                    <div className="flex items-center gap-2 mt-3">
                        <button
                            onClick={() => dispatch(setSelectedArticle(a))}
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

                        {(a.isCanUndo && a.status === "pending") && (
                            <button
                                onClick={() => handleUndo(a)}
                                className="px-3 py-1 rounded-md bg-gray-50 border border-gray-200 text-sm flex items-center gap-1 text-gray-600 hover:bg-gray-100"
                            >
                                <Undo className="w-4 h-4" /> Thu hồi
                            </button>
                        )}

                        <button
                            onClick={() => handleDirectToDrafts(a)}
                            className="px-3 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-sm flex items-center gap-1 text-indigo-600 hover:bg-indigo-100"
                        >
                            <DraftingCompass className="w-4 h-4" /> Bản nháp
                        </button>

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
                </>
            )}
        />
    );
};

export default MyNewsPage;
