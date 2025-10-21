'use client';

import NewsAPI from "api/newsAPI";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Article = {
    _id: string;
    title: string;
    summary: string;
    featuredImage?: string;
    createdAt: string;
    author?: { userName: string };
    slug: string;
    category?: { name: { vi: string; en: string } };
};

const CategoryPage = () => {
    const params = useParams();
    const slugParam = params?.slug ?? "";
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
    const [listTopViewed, setListTopViewed] = useState<Article[]>([]);
    const [mockTop, setMockTop] = useState<Article>();
    const [listHighlightArticles, setListHighlightArticles] = useState<Article[]>([]);
    const [allOtherArticles, setAllOtherArticles] = useState<Article[]>([]);
    const [listOtherArticles, setListOtherArticles] = useState<Article[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 5; // số bài trên mỗi trang

    useEffect(() => {
        NewsAPI.GetNewsBySlug(slug)
            .then((res) => {
                setMockTop(res.data.topStory);
                setListHighlightArticles(res.data.highlightArticles);
                setAllOtherArticles(res.data.otherArticles || []);
                setCurrentPage(1); // reset về trang 1 khi đổi slug
            })
            .catch((err) => console.error(err));
    }, [slug]);

    useEffect(() => {
        NewsAPI.GetTopViewedNews({ limit: 5, category: slug })
            .then((res) => {
                setListTopViewed(res.data);
            })
            .catch((err) => console.error(err));
    }, [slug]);

    useEffect(() => {
        const start = (currentPage - 1) * limit;
        const end = start + limit;
        setListOtherArticles(allOtherArticles.slice(start, end));

        // auto scroll lên đầu khi đổi page
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [allOtherArticles, currentPage]);

    const totalPages = Math.ceil(allOtherArticles.length / limit);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main column */}
                <section className="lg:col-span-2 space-y-6">
                    {/* Breadcrumb + title */}
                    <div className="flex items-baseline justify-between">
                        <h1 className="text-2xl font-bold font-sans">{mockTop?.category?.name?.vi}</h1>
                        <div className="text-sm text-gray-500">
                            {dayjs().format("dddd, DD/MM/YYYY")}
                        </div>
                    </div>

                    {currentPage === 1 ? (
                        <>
                            {/* Top News */}
                            {mockTop && (
                                <article className="bg-white rounded shadow-sm overflow-hidden">
                                    <div className="relative">
                                        <img
                                            src={mockTop.featuredImage}
                                            alt="hero"
                                            className="w-full h-72 object-cover"
                                        />
                                        <div className="absolute left-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent text-white p-6 w-full">
                                            <span className="inline-block bg-red-600 text-xs px-2 py-1 rounded">
                                                NỔI BẬT
                                            </span>
                                            <h2 className="text-xl sm:text-2xl font-bold mt-2">{mockTop.title}</h2>
                                            <p className="mt-1 text-sm text-gray-100 max-w-2xl">
                                                {mockTop.summary}
                                            </p>
                                            <div className="mt-3 text-xs opacity-90">
                                                {dayjs(mockTop.createdAt).format("HH:mm - DD/MM/YYYY")}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            )}

                            {/* Grid of highlight articles */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {listHighlightArticles.map((a) => (
                                    <article
                                        key={a._id}
                                        className="bg-white border-b-1 border-black-600 rounded shadow-sm p-1"
                                    >
                                        {/* Title ở trên */}
                                        <a
                                            href={`/${a.slug}`}
                                            className="block text-xl font-bold leading-snug hover:text-blue-600 mb-2"
                                        >
                                            {a.title}
                                        </a>

                                        {/* Ảnh bên trái - Summary bên phải */}
                                        <div className="flex">
                                            <a href={`/news/${a.slug}`} className="flex-shrink-0">
                                                <img
                                                    src={a.featuredImage}
                                                    alt={a.title}
                                                    className="w-32 h-24 object-cover"
                                                />
                                            </a>
                                            <p className="ml-3 text-sm text-gray-600 line-clamp-3">
                                                {a.summary}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>




                            {/* Other News list */}
                            <div className="bg-white rounded shadow-sm p-4">
                                <ul className="divide-y">
                                    {listOtherArticles.map((a) => (
                                        <li key={a._id} className="py-3 flex items-start space-x-3">
                                            <div
                                                key={a._id}
                                                className="pb-6"
                                            >
                                                {/* Title ở trên */}
                                                <a
                                                    href={`/${a.slug}`}
                                                    className="block text-lg font-semibold hover:text-blue-600 leading-snug mb-2"
                                                >
                                                    {a.title}
                                                </a>

                                                {/* Ảnh bên trái - Summary bên phải */}
                                                <div className="flex gap-4">
                                                    {a.featuredImage && (
                                                        <a href={`/${a.slug}`} className="flex-shrink-0">
                                                            <img
                                                                src={a.featuredImage}
                                                                alt={a.title}
                                                                className="w-40 h-24 object-cover"
                                                            />
                                                        </a>
                                                    )}
                                                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                                                        {a.summary}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    ) : (

                        <div className="space-y-8">
                            {/* Bài viết nổi bật đầu tiên */}
                            {listOtherArticles.length > 0 && (
                                <div className="flex gap-6 border-b pb-6">
                                    <a href={`/${listOtherArticles[0].slug}`} className="flex-shrink-0 w-1/2">
                                        <img
                                            src={listOtherArticles[0].featuredImage}
                                            alt={listOtherArticles[0].title}
                                            className="w-full h-60 object-cover"
                                        />
                                    </a>
                                    <div className="flex-1 flex flex-col">
                                        <a
                                            href={`/${listOtherArticles[0].slug}`}
                                            className="text-2xl font-bold hover:text-blue-600 leading-snug break-words"
                                        >
                                            {listOtherArticles[0].title}
                                        </a>
                                        <p className="mt-2 text-gray-700 text-base leading-relaxed line-clamp-4">
                                            {listOtherArticles[0].summary}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Các bài viết còn lại */}
                            {listOtherArticles.slice(1).map((article) => (
                                <div
                                    key={article._id}
                                    className="border-b pb-6"
                                >
                                    {/* Title ở trên */}
                                    <a
                                        href={`/${article.slug}`}
                                        className="block text-lg font-semibold hover:text-blue-600 leading-snug mb-2"
                                    >
                                        {article.title}
                                    </a>

                                    {/* Ảnh bên trái - Summary bên phải */}
                                    <div className="flex gap-4">
                                        {article.featuredImage && (
                                            <a href={`/${article.slug}`} className="flex-shrink-0">
                                                <img
                                                    src={article.featuredImage}
                                                    alt={article.title}
                                                    className="w-40 h-24 object-cover"
                                                />
                                            </a>
                                        )}
                                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                                            {article.summary}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-4 flex justify-center">
                            <nav className="inline-flex items-center space-x-2 text-sm">
                                <button
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                    disabled={currentPage === 1}
                                >
                                    « Trước
                                </button>
                                {Array.from({ length: totalPages }).map((_, idx) => (
                                    <button
                                        key={idx}
                                        className={`px-3 py-1 border rounded ${currentPage === idx + 1 ? "bg-gray-200 font-semibold" : ""
                                            }`}
                                        onClick={() => setCurrentPage(idx + 1)}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                                <button
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Sau »
                                </button>
                            </nav>
                        </div>
                    )}
                </section>


                {/* Sidebar */}
                <aside className="space-y-6">
                    {/* Topic tabs */}
                    <div className="bg-white p-4 rounded shadow-sm">
                        <h3 className="font-semibold mb-3">Chủ đề</h3>
                        <div className="flex flex-wrap gap-2">
                            {["Tư liệu", "Phân tích", "Người Việt 5 châu", "Quân sự"].map((topic) => (
                                <a
                                    key={topic}
                                    href="#"
                                    className="px-3 py-1 rounded-full text-sm border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 transition"
                                >
                                    {topic}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Most viewed */}
                    <div className="bg-white p-4 rounded shadow-sm">
                        <h3 className="font-semibold mb-3">Xem nhiều</h3>
                        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                            {listTopViewed.map((a) => (
                                <li key={a._id} className="flex items-start space-x-2">
                                    <div className="flex-1">
                                        <a href={`/${a.slug}`} className="line-clamp-2 hover:underline font-bold">{a.title}</a>
                                        <div className="text-xs text-gray-500">{a.summary}</div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Ad placeholder */}
                    <div className="bg-white p-4 rounded shadow-sm text-center text-sm text-gray-500">
                        Quảng cáo 300x250
                    </div>
                </aside>
            </main>

        </div >
    );
};

export default CategoryPage;
