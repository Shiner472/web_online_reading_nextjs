'use client';
import NewsAPI from "api/newsAPI";
import PostForm from "components/postForm/postForm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";




const UpdateNewsPage = () => {
    const router = useRouter();
    const slug = window.location.pathname.split("/").pop(); // Lấy slug từ URL
    const [newsData, setNewsData] = useState(null);
    // Nếu không có slug, có thể hiển thị thông báo lỗi hoặc chuyển hướng
 
    useEffect(() => {
        NewsAPI.GetNewsById(slug || "").then((res) => {
            setNewsData(res.data);
        });
    }, [slug]);

    return (
        <PostForm
            mode="update"
            initialData={newsData}
            onSuccess={() => router.push("/my-news")}
        />
    );
}

export default UpdateNewsPage;