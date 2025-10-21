



'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Article {
    _id: string;
    title: string;
    slug: string;
    featuredImage?: string;
    createdAt: string;
    category?: { name: string };
}

const SearchPage = () => {
    const searchParams = useSearchParams();
    const keyword = searchParams?.get('keyword') || '';
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!keyword) return;
        setLoading(true);
        console.log(keyword)
        const fetchArticles = async () => {
            try {
                const res = await fetch(`http://localhost:4000/api/news/search?keySearch=${encodeURIComponent(keyword)}`);
                const data = await res.json();
                setArticles(data);
            } catch (error) {
                console.error('Lỗi khi tìm kiếm:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [keyword]);

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">

            {loading && <p>Đang tải kết quả...</p>}

            {!loading && articles.length === 0 && (
                <p>Không tìm thấy bài viết nào.</p>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {articles.map((article) => (
                    <Link
                        href={`/news/${article.slug}`}
                        key={article._id}
                        className="flex gap-4 hover:bg-gray-50 p-3 rounded-xl transition"
                    >
                        {article.featuredImage && (
                            <img
                                src={article.featuredImage}
                                alt={article.title}
                                className="w-32 h-24 object-cover rounded-lg"
                            />
                        )}
                        <div className="flex-1">
                            <h2 className="font-medium text-lg line-clamp-2">{article.title}</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {article.category?.name} • {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SearchPage;
