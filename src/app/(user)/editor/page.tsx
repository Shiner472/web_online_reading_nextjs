'use client';
import { useEffect, useState } from "react";
import { CheckCircle, Star, XCircle, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import NewsAPI from "api/newsAPI";
import { toast } from "react-toastify";
import AuthAPI from "api/authAPI";
import NotificationAPI from "api/notificationAPI";

type Author = {
  _id: string;
  userName: string;
}

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

const EditorPage = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article & { rejectMode?: boolean } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [articleList, setArticleList] = useState<Article[]>([]);
  const token = localStorage.getItem("token") || "";
  const [user, setUser] = useState<any>(null);

  // Sort: ưu tiên "chờ duyệt"
  const sortedArticles = [...articleList].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return 0;
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        AuthAPI.getMe({ token }).then((res) => {
          setUser(res.data);
        });
      } catch (error) {
        toast.error("Có lỗi xảy ra khi tải thông tin người dùng.");
      }
    };
    fetchUser();
  }, [token]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        NewsAPI.GetAllNews().then((res) => {
          setArticleList(res.data);
        });
      } catch (error) {
        toast.error("Có lỗi xảy ra khi tải danh sách bài viết.");
      }
    };
    fetchArticles();
  }, []);

  // Pagination setup
  const itemsPerPage = 7;
  const totalPages = Math.ceil(sortedArticles.length / itemsPerPage);
  const paginatedArticles = sortedArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleApprove = async (a: Article) => {
    if (!user?._id) {
      toast.error("Bạn chưa đăng nhập!");
      return;
    }

    try {
      // 🟢 Cập nhật trạng thái bài viết
      const res = await NewsAPI.UpdateNewsStatus({
        id: a._id,
        status: "published",
        approvedBy: user._id,
      });

      // 🟢 Thông báo thành công
      toast.success(
        a.status === "rejected"
          ? "✅ Duyệt lại bài viết thành công!"
          : "✅ Duyệt bài viết thành công!"
      );

      // 🟢 Cập nhật lại danh sách bài viết
      setArticleList((prev) =>
        prev.map((x) =>
          x._id === a._id ? { ...x, status: "published", reason: undefined } : x
        )
      );

      // 🟢 Nếu bài đang được chọn, cập nhật lại thông tin chi tiết
      if (selectedArticle?._id === a._id) {
        setSelectedArticle({
          ...a,
          status: "published",
          reason: undefined,
        });
      }

      // 🟢 Gửi thông báo đến tác giả
      await NotificationAPI.createNotification({
        sender: user._id,
        receiver: a.author?._id,
        title: "Bài viết của bạn đã được duyệt!",
        articleId: a._id
      });
    } catch (error) {
      toast.error("❌ Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };


  const handleHighlight = (a: Article) => {
    try {
      NewsAPI.HighlightIsFeatured(a._id, { isFeatured: true }).then((res) => {
        toast.success(a.isFeatured ? "✅ Bỏ nổi bật thành công!" : "✅ Nổi bật bài viết thành công!");
        setArticleList((prev) =>
          prev.map((x) =>
            x._id === a._id ? { ...x, isFeatured: !x.isFeatured } : x
          )
        );
      });
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };

  const handleReject = (a: Article) => {
    setSelectedArticle({ ...a, rejectMode: true });
  };

  const handleSubmitReject = () => {
    const data = {
      id: selectedArticle?._id,
      status: "rejected",
      reason: rejectReason,
      approvedBy: user._id
    };

    try {
      NewsAPI.UpdateNewsStatus(data).then((res) => {
        toast.success("✅ Từ chối bài viết thành công!");
        setArticleList((prev) =>
          prev.map((x) =>
            x._id === selectedArticle?._id ? { ...x, status: "rejected", reason: rejectReason } : x
          )
        );
        setRejectReason("");
        setSelectedArticle(null);
      });
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">📑 Bảng điều khiển - Editor</h1>

        {/* Danh sách bài viết */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Danh sách bài viết</h2>
          <div className="divide-y">
            {paginatedArticles.map((a) => (
              <div
                key={a._id}
                className="flex items-center justify-between py-3 px-2 hover:bg-slate-50 transition rounded-lg"
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
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

                  {/* Title + status */}
                  <div>
                    <div className="font-medium !text-black">{a.title}</div>
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
                  {a.status === "rejected" && (
                    <button
                      onClick={() => handleApprove(a)}
                      className="px-3 py-1 rounded-md bg-orange-50 border border-orange-200 text-sm flex items-center gap-1 text-orange-600 hover:bg-orange-100"
                    >
                      <CheckCircle className="w-4 h-4" /> Duyệt lại
                    </button>
                  )}
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
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl ">
              <h2 className="text-lg font-semibold">📖 Chi tiết bài viết</h2>
              <div className="mt-2 w-full space-y-2">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedArticle.title}
                </h3>

                {/* Author + Status */}
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <p>Tác giả: <span className="font-medium">{selectedArticle.author ? selectedArticle.author.userName : "Đang tải..."}</span></p>
                  <p>
                    Trạng thái:{" "}
                    {selectedArticle.status === "pending" && (
                      <span className="text-yellow-600 font-semibold">⏳ Chờ duyệt</span>
                    )}
                    {selectedArticle.status === "published" && (
                      <span className="text-green-600 font-semibold">✅ Đã xuất bản</span>
                    )}
                    {selectedArticle.status === "rejected" && (
                      <span className="text-red-600 font-semibold">⛔ Bị từ chối</span>
                    )}
                  </p>
                </div>

                {/* Reason if rejected */}
                {selectedArticle.status === "rejected" && selectedArticle.reason && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    <strong>Lý do từ chối:</strong> {selectedArticle.reason}
                  </div>
                )}
              </div>

              {selectedArticle.rejectMode ? (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Nhập lý do từ chối..."
                    className="w-full p-3 border rounded-lg text-sm focus:ring focus:border-blue-300 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedArticle(null)}
                      className="px-4 py-2 rounded-lg bg-gray-200 text-sm"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSubmitReject}
                      className="px-4 py-2 rounded-lg bg-red-600 !text-white text-sm font-semibold hover:bg-red-700"
                    >
                      Xác nhận từ chối
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-4 text-sm text-slate-500  max-h-[60vh] overflow-y-auto" dangerouslySetInnerHTML={{ __html: selectedArticle.content || "<i>Chưa có nội dung</i>" }}></p>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => setSelectedArticle(null)}
                      className="px-4 py-2 rounded-lg bg-blue-600 !text-white text-sm hover:bg-blue-700"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPage;
