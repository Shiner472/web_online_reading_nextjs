"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Star, XCircle, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import NewsAPI from "api/newsAPI";
import AuthAPI from "api/authAPI";
import NotificationAPI from "api/notificationAPI";
import { toast } from "react-toastify";
import ArticleDetailModal from "../../../components/editor/ArticleDetailModal";
import { useRouter, useSearchParams } from "next/navigation";


type Author = {
  _id: string;
  userName: string;
};

type Article = {
  _id: string;
  title: string;
  status: "pending" | "published" | "rejected";
  featuredImage?: string;
  isFeatured?: boolean;
  reason?: string;
  content?: string;
  author?: Author;
};


export default function EditorPage() {
  const [articleList, setArticleList] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const searchParams = useSearchParams();
  const rawPage = searchParams?.get("page");
  const page = rawPage ? Number(rawPage) : 1;
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState<any>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  // Sort ưu tiên bài đang chờ duyệt
  const sortedArticles = [...articleList].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return 0;
  });




  useEffect(() => {
    AuthAPI.getMe({ token })
      .then((res) => setUser(res.data))
      .catch(() => toast.error("Không thể tải thông tin người dùng"));
  }, [token]);

  useEffect(() => {
    NewsAPI.GetAllNews(page, 10)
      .then((res) => {
        setArticleList(res.data.items)
        setTotalPages(res.data.totalPages)
      })
      .catch(() => toast.error("Không thể tải danh sách bài viết"));
  }, [page]);


  const handleApprove = async (a: Article) => {
    if (!user?._id) return toast.error("Bạn chưa đăng nhập!");
    try {
      await NewsAPI.UpdateNewsStatus({
        id: a._id,
        status: "published",
        approvedBy: user._id,
      });

      toast.success("✅ Duyệt bài viết thành công!");
      setArticleList((prev) =>
        prev.map((x) =>
          x._id === a._id ? { ...x, status: "published", reason: undefined } : x
        )
      );

      if (selectedArticle?._id === a._id) {
        setSelectedArticle({ ...a, status: "published", reason: undefined });
      }

      await NotificationAPI.createNotification({
        sender: user._id,
        receiver: a.author?._id,
        title: "Bài viết của bạn đã được duyệt!",
        articleId: a._id,
      });
    } catch {
      toast.error("❌ Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };

  const handleHighlight = async (a: Article) => {
    try {
      await NewsAPI.HighlightIsFeatured(a._id, { isFeatured: !a.isFeatured });
      toast.success(
        a.isFeatured ? "✅ Bỏ nổi bật thành công!" : "✅ Nổi bật bài viết thành công!"
      );
      setArticleList((prev) =>
        prev.map((x) =>
          x._id === a._id ? { ...x, isFeatured: !x.isFeatured } : x
        )
      );
    } catch {
      toast.error("❌ Có lỗi xảy ra khi cập nhật nổi bật.");
    }
  };

  const handleReject = async (a: Article) => {
    const reason = prompt("Nhập lý do từ chối bài viết:");
    if (!reason) return;

    try {
      await NewsAPI.UpdateNewsStatus({
        id: a._id,
        status: "rejected",
        reason,
        approvedBy: user._id,
      });
      toast.success("⛔ Đã từ chối bài viết!");
      setArticleList((prev) =>
        prev.map((x) =>
          x._id === a._id ? { ...x, status: "rejected", reason } : x
        )
      );

      await NotificationAPI.createNotification({
        sender: user._id,
        receiver: a.author?._id,
        title: "Bài viết của bạn đã bị từ chối vì: " + reason,
        articleId: a._id,
      });
    } catch {
      toast.error("❌ Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };

  const changePage = (newPage: number) => {
    newPage === 1 ? router.push(`/editor`) : router.push(`/editor?page=${newPage}`);
  };

  // =====================
  // 🔹 Render
  // =====================
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">📑 Bảng điều khiển - Editor</h1>

        {/* Danh sách bài viết */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Danh sách bài viết</h2>
          <div className="divide-y">
            {articleList.map((a) => (
              <div
                key={a._id}
                className="flex items-center justify-between py-3 px-2 hover:bg-slate-50 transition rounded-lg"
              >
                {/* Left */}
                <div className="flex items-start gap-3">
                  {a.featuredImage ? (
                    <img
                      src={a.featuredImage}
                      alt={a.title}
                      className="w-36 h-24 object-cover rounded-md border"
                    />
                  ) : (
                    <div className="w-36 h-24 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                      No Image
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-black">{a.title}</div>
                    <div className="text-xs text-slate-500">
                      {a.status === "pending" && "⏳ Chờ duyệt"}
                      {a.status === "published" && "✅ Đã xuất bản"}
                      {a.status === "rejected" && (
                        <span className="text-red-600 font-medium">⛔ Bị từ chối</span>
                      )}
                      {a.isFeatured && (
                        <span className="ml-2 text-amber-600 font-medium">
                          ⭐ Đang nổi bật
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedArticle(a)}
                    className="px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-sm flex items-center gap-1 text-blue-600 hover:bg-blue-100"
                  >
                    <Eye className="w-4 h-4" /> Chi tiết
                  </button>

                  {a.status === "pending" && (
                    <button
                      onClick={() => handleApprove(a)}
                      className="px-3 py-1 rounded-md bg-green-50 border border-green-200 text-sm flex items-center gap-1 text-green-600 hover:bg-green-100"
                    >
                      <CheckCircle className="w-4 h-4" /> Duyệt
                    </button>
                  )}

                  <button
                    onClick={() => handleHighlight(a)}
                    className={`px-3 py-1 rounded-md border text-sm flex items-center gap-1 ${a.isFeatured
                      ? "bg-amber-500 border-amber-600 text-white hover:bg-amber-600"
                      : "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
                      }`}
                  >
                    <Star className="w-4 h-4" />
                    {a.isFeatured ? "Đã nổi bật" : "Nổi bật"}
                  </button>

                  {a.status !== "rejected" && (
                    <button
                      onClick={() => handleReject(a)}
                      className="px-3 py-1 rounded-md bg-red-50 border border-red-200 text-sm flex items-center gap-1 text-red-600 hover:bg-red-100"
                    >
                      <XCircle className="w-4 h-4" /> Từ chối
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <span>
              Trang {page}/{totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => changePage(page - 1)}
                disabled={page === 1}
                className="px-2 py-1 rounded-md border disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => changePage(page + 1)}
                disabled={page === totalPages}
                className="px-2 py-1 rounded-md border disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal chi tiết + quét ảnh */}
        {selectedArticle && (
          <ArticleDetailModal
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
          />
        )}
      </div>
    </div>
  );
}
