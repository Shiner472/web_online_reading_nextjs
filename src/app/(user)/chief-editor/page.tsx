'use client';
import NewsAPI from "api/newsAPI";
import CategoryAPI from "api/categoryAPI";
import { useEffect, useState } from "react";
import { Globe2, Folder, Eye, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

type Author = { _id: string; userName: string };
type Category = { _id: string; name: { vi: string; en: string } };
type Article = {
  _id: string;
  title: string;
  priorityInGlobal: number;
  priorityInCategory: number;
  author: Author;
  category: Category;
  isFeatured: boolean;
  featuredImage: string;
};

const PRIORITY_GLOBAL_LEVELS = [
  { value: 0, label: "Không ưu tiên" },
  { value: 1, label: "Thấp" },
  { value: 2, label: "Trung bình" },
  { value: 3, label: "Cao" },
  { value: 4, label: "Hero (Trang chủ)" },
];

const PRIORITY_CATEGORY_LEVELS = [
  { value: 0, label: "Không ưu tiên" },
  { value: 1, label: "Thấp" },
  { value: 2, label: "Trung bình" },
  { value: 3, label: "Cao" },
];

const ITEMS_PER_PAGE = 5;

const ChiefEditorDashboardPage = () => {
  const [articleList, setArticleList] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"global" | "category">("global");
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawPage = searchParams?.get("page");
  const page = rawPage ? Number(rawPage) : 1;

  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    NewsAPI.GetAllNews(page, 5)
      .then((res) => {
        setArticleList(res.data.items)
        setTotalPages(res.data.totalPages)
      })
      .catch(console.error);

    CategoryAPI.getAllCategories()
      .then((res) => setCategories(res.data))
      .catch(console.error);
  }, []);

  const handleSetPriority = (
    id: string,
    update: Partial<{ priorityInGlobal: number; priorityInCategory: number }>
  ) => {
    NewsAPI.PutPriority(id, update)
      .then(() => {
        setArticleList((prev) =>
          prev.map((x) => (x._id === id ? { ...x, ...update } : x))
        );
      })
      .catch(console.error);
  };

  const handleChange = (newPage: number) => {
    newPage === 1 ? router.push(`/chief-editor`) : router.push(`/chief-editor?page=${newPage}`);
  }


  return (
    <div className="bg-slate-50 min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">📑 Bảng điều khiển - Chief Editor</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setActiveTab("global");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === "global"
              ? "bg-blue-600 text-white"
              : "bg-white border text-slate-700"
              }`}
          >
            🌍 Theo trang chủ
          </button>
          <button
            onClick={() => {
              setActiveTab("category");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === "category"
              ? "bg-emerald-600 text-white"
              : "bg-white border text-slate-700"
              }`}
          >
            📂 Theo thể loại
          </button>
        </div>

        {/* Bộ lọc */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên bài viết..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>

          {/* Category filter chỉ hiện khi tab category */}
          {activeTab === "category" && (
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">📂 Tất cả thể loại</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name.vi}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Danh sách bài viết */}
        <div className="bg-white shadow rounded-xl divide-y">
          {articleList.map((a) => (
            <div
              key={a._id}
              className="flex items-start gap-4 p-4 hover:bg-slate-50 transition"
            >
              {/* Ảnh thumbnail */}
              {a.featuredImage ? (
                <img
                  src={a.featuredImage}
                  alt={a.title}
                  className="w-28 h-20 object-cover rounded-lg border"
                />
              ) : (
                <div className="w-28 h-20 bg-slate-200 flex items-center justify-center text-slate-500 text-xs rounded-lg border">
                  No Image
                </div>
              )}

              {/* Thông tin bài viết */}
              <div className="flex-1 pr-4">
                <div className="font-medium text-slate-800">{a.title}</div>
                <div className="text-sm text-slate-600 mt-1">
                  ✍️ {a.author?.userName || "Không rõ"} · 📂{" "}
                  {a.category?.name.vi || "Chưa có thể loại"}
                </div>
              </div>

              {/* Dropdown theo tab */}
              <div className="flex flex-col gap-2 w-60">
                {activeTab === "global" && (
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-blue-500" />
                    <select
                      value={a.priorityInGlobal}
                      onChange={(e) =>
                        handleSetPriority(a._id, {
                          priorityInGlobal: Number(e.target.value),
                        })
                      }
                      className="flex-1 border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      {PRIORITY_GLOBAL_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTab === "category" && (
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-emerald-500" />
                    <select
                      value={a.priorityInCategory}
                      onChange={(e) =>
                        handleSetPriority(a._id, {
                          priorityInCategory: Number(e.target.value),
                        })
                      }
                      className="flex-1 border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-emerald-500"
                    >
                      {PRIORITY_CATEGORY_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Nút xem chi tiết */}
                <button
                  onClick={() => setSelectedArticle(a)}
                  className="flex items-center justify-center gap-1 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg py-1 px-2 transition"
                >
                  <Eye className="w-4 h-4" /> Xem chi tiết
                </button>
              </div>
            </div>
          ))}

          {articleList.length === 0 && (
            <div className="p-6 text-center text-slate-500">Không tìm thấy bài viết nào</div>
          )}
        </div>

        {/* Pagination controls */}
        <div className="flex justify-between items-center mt-4 text-sm">
          <span>
            Trang {page}/{totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleChange(page - 1)}
              disabled={page === 1}
              className="px-2 py-1 rounded-md border disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleChange(page + 1)}
              disabled={page === totalPages || totalPages === 0}
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
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full">
            <h2 className="text-lg font-semibold mb-2">Chi tiết bài viết</h2>

            {selectedArticle.featuredImage && (
              <img
                src={selectedArticle.featuredImage}
                alt={selectedArticle.title}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
            )}

            <p className="font-medium text-slate-800">{selectedArticle.title}</p>
            <p className="text-sm text-slate-600 mt-1">
              ✍️ {selectedArticle.author?.userName || "Không rõ"} · 📂{" "}
              {selectedArticle.category?.name.vi || "Chưa có thể loại"}
            </p>
            <div className="flex gap-3 mt-2 text-xs">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                🌍 Global:{" "}
                {
                  PRIORITY_GLOBAL_LEVELS.find(
                    (l) => l.value === selectedArticle.priorityInGlobal
                  )?.label
                }
              </span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                📂 Category:{" "}
                {
                  PRIORITY_CATEGORY_LEVELS.find(
                    (l) => l.value === selectedArticle.priorityInCategory
                  )?.label
                }
              </span>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChiefEditorDashboardPage;
