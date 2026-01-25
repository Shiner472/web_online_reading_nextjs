'use client';
import { faFaceSmile, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AuthAPI from "api/authAPI";
import { CommentAPI } from "api/commentAPI";
import NewsAPI from "api/newsAPI";
import CommentList from "components/comment/commentList";
import useReadingTracker from "context/readingTracker";
import dayjs from "dayjs";
import { fetchLatestNews, fetchRelatedNews, fetchTopViewedNews, getArticleBySlug, increaseViewArticle } from "lib/features/articles/articlesSlice";
import { getMe } from "lib/features/auth/authSlice";
import { getAllCommentsBySlug, reactionComment, submitComment, submitReplyComment, submitReplyOfReply } from "lib/features/comment/commentSlice";
import { AppDispatch, RootState } from "lib/store";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";


type Reaction = { type: string; label: string; icon: string; color: string };
type Reply = { _id: string; author: string; content: string; reactions: Reaction | null; replies: Reply[] };
type Comment = { _id: string; author: string; content: string; reactions: Reaction | null; replies: Reply[], createdAt?: string };


const reactionsList: Reaction[] = [
    { type: "like", label: "Thích", icon: "👍", color: "text-blue-600" },
    { type: "love", label: "Yêu thích", icon: "❤️", color: "text-red-500" },
    { type: "haha", label: "Haha", icon: "😆", color: "text-yellow-500" },
    { type: "wow", label: "Wow", icon: "😮", color: "text-yellow-500" },
    { type: "sad", label: "Buồn", icon: "😢", color: "text-yellow-500" },
    { type: "angry", label: "Phẫn nộ", icon: "😡", color: "text-red-600" }
];

const NewsDetail = () => {
    const params = useParams();
    const slugParam = params?.slug ?? "";
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
    const [news, setNews] = useState<any>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    // const [user, setUser] = useState<any>(null);
    const [showReactions, setShowReactions] = useState<{ type: 'comment' | 'reply', id: string } | null>(null);
    const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
    const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
    const [comment, setComment] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiRef = useRef<HTMLDivElement | null>(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    // const [topViewedNews, setTopViewedNews] = useState<any[]>([]);
    // const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
    // const [listLastestNews, setListLastestNews] = useState<any[]>([]);

    const dispatch = useDispatch<AppDispatch>();
    const { user, article, listComment, listTopViewedNews, listRelatedNews, listLastestNews } = useSelector(
        (state: RootState) => ({
            user: state.auth.user,
            article: state.articles.article,
            listComment: state.comments.list,
            listTopViewedNews: state.articles.listTopViewedNews,
            listRelatedNews: state.articles.listRelatedNews,
            listLastestNews: state.articles.listLastestNews

        }),
        shallowEqual
    )


    useReadingTracker(article?._id || "", user?._id);

    useEffect(() => {
        // const fetchTopViewedNews = async () => {
        //     try {
        //         const response = await NewsAPI.GetTopViewedNews({ limit: 5, category: "", slug });
        //         setTopViewedNews(response.data);
        //     } catch (error) {
        //         toast.error("Error fetching top viewed news:");
        //     }
        // };
        // const fetchRelatedNews = async () => {
        //     try {
        //         const response = await NewsAPI.GetRelatedNews(slug);
        //         setRelatedPosts(response.data);
        //     } catch (error) {
        //         toast.error("Error fetching related news:");
        //     }
        // };
        // const fetchLatestNews = async () => {
        //     try {
        //         const response = await NewsAPI.GetLastestNews(5, slug);
        //         setListLastestNews(response.data);
        //     } catch (error) {
        //         toast.error("Error fetching latest news:");
        //     }
        // };
        // fetchLatestNews();
        // fetchTopViewedNews();
        // fetchRelatedNews();
        dispatch(fetchTopViewedNews({ limit: 5, category: "", slug }));
        dispatch(fetchRelatedNews(slug));
        dispatch(fetchLatestNews({ limit: 5, slug }))
    }, [slug]);

    useEffect(() => {
        if (token) {
            dispatch(getMe(token))
            // AuthAPI.getMe({ token })
            //     .then((response) => {
            //         setUser(response.data);
            //     })
            //     .catch((error) => {
            //         toast.error("Error fetching user info:");
            //     });
        }
    }, [token, dispatch]);

    useEffect(() => {
        dispatch(getArticleBySlug(slug))
        // const fetchNews = async () => {
        //     try {
        //         const response = await NewsAPI.GetNewsBySlug(slug);
        //         console.log("Fetched news detail:", response.data);
        //         setNews(response.data);
        //     } catch (error) {
        //         toast.error("Error fetching news:");
        //     }
        // };

        // fetchNews();
    }, [slug, dispatch]);

    useEffect(() => {
        dispatch(increaseViewArticle(slug))
        // NewsAPI.IncreaseViewCount(slug)
        //     .then((response) => {
        //         console.log("Increased view count:");
        //     })
        //     .catch((error) => {
        //         toast.error("Error increasing view count:");
        //     });
    }, [slug, dispatch]);


    useEffect(() => {
        dispatch(getAllCommentsBySlug(slug))
        // CommentAPI.getCommentsBySlug(slug)
        //     .then((response) => {
        //         setComments(response.data);
        //     })
        //     .catch((error) => {
        //         toast.error("Error fetching comments:");
        //     });
    }, [slug, dispatch]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        }

        if (showEmojiPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showEmojiPicker]);

    const handleCommentSubmit = () => {
        const payload = {
            content: comment,
            news: article?._id,
            user: user?._id
        }
        dispatch(submitComment(payload));

        // CommentAPI.createComment({
        //     content: comment,
        //     news: article?._id,
        //     user: user?._id
        // })
        //     .then((response) => {
        //         setComments((prev: any) => [
        //             ...prev,
        //             { _id: response.data._id, author: user?.userName, content: comment.trim(), reaction: null, replies: [], createdAt: new Date().toISOString() }
        //         ]);
        //     })
        //     .catch((error) => {
        //         console.error("Lỗi khi gửi bình luận:", error);
        //     });
    };

    const handleAddReply = (parentId: string) => {
        const payload = {
            content: replyInputs[`comment-${parentId}`],
            news: article?._id,
            user: user?._id,
            parentComment: parentId
        }
        dispatch(submitReplyComment(payload))
        const key = `comment-${parentId}`;
        setReplyInputs((prev) => ({ ...prev, [key]: "" }));

        // CommentAPI.createComment({
        //     content: replyInputs[`comment-${parentId}`],
        //     news: news?._id,
        //     user: user?._id,
        //     parentComment: parentId
        // }).then((response) => {
        //     alert("Phản hồi của bạn đã được gửi!");
        //     const key = `comment-${parentId}`;
        //     const text = replyInputs[key]?.trim();
        //     if (!text) return;
        //     setComments((prev) =>
        //         prev.map((c: any) =>
        //             c._id === parentId ?
        //                 {
        //                     ...c,
        //                     replies: [
        //                         ...c.replies,
        //                         { _id: response.data._id, user: user?.userName, content: text, reaction: null, replies: [] }
        //                     ]
        //                 } : c
        //         )
        //     );
        //     setReplyInputs((prev) => ({ ...prev, [key]: "" }));
        //     setShowReplies((prev) => ({ ...prev, [key]: true }));
        // })
        //     .catch((error) => {
        //         toast.error("Error sending reply:");
        //     });
    };

    const handleAddReplyToReply = (parentId: string, replyId: string) => {
        const key = `reply-${replyId}`;
        const text = replyInputs[key]?.trim();
        if (!text) return;

        const payload = {
            content: text,
            news: article?._id,
            user: user?._id,
            parentComment: replyId,
        }

        dispatch(submitReplyOfReply(payload));
        setReplyInputs((prev) => ({ ...prev, [key]: "" }));
        setShowReplies((prev) => ({ ...prev, [key]: true }));

        // CommentAPI.createComment({
        //     content: text,
        //     news: news?._id,
        //     user: user?._id,
        //     parentComment: replyId,
        // }).then((response) => {
        //     alert("Phản hồi của bạn đã được gửi!");
        //     const newReply: Reply = { _id: response.data._id, author: user?.userName, content: text, reactions: null, replies: [] };
        //     setComments((prev) =>
        //         prev.map((c) =>
        //             c._id === parentId ? { ...c, replies: addReplyRecursive(c.replies, replyId, newReply) } : c
        //         )
        //     );
        //     setReplyInputs((prev) => ({ ...prev, [key]: "" }));
        //     setShowReplies((prev) => ({ ...prev, [key]: true }));
        // })
        //     .catch((error) => {
        //         toast.error("Error sending reply:");
        //     });

    };

    // const addReplyRecursive = (list: Reply[], replyId: string, newReply: Reply): Reply[] => {
    //     return list.map((r: any) => {
    //         if (r._id === replyId) {
    //             return { ...r, replies: [...r.replies, newReply] };
    //         }
    //         return { ...r, replies: addReplyRecursive(r.replies, replyId, newReply) };
    //     });
    // };

    const handleSelectReaction = (
        targetType: 'comment' | 'reply',
        _parentId: string, // không dùng nữa cho reply
        targetId: string,
        reactionType: string
    ) => {

        const payload = {
            commentId: targetId,
            user: user,
            reactionType,
            targetId,
            targetType
        }

        dispatch(reactionComment(payload));
        setShowReactions(null);

        // CommentAPI.reactionComment({
        //     commentId: targetId,
        //     user: user?._id,
        //     reactionType
        // }).then((response) => {
        //     setComments((prev) =>
        //         prev.map((c) => {
        //             if (targetType === 'comment' && c._id === targetId) {
        //                 // toggle cho comment
        //                 return {
        //                     ...c,
        //                     reactions: updateReactions(c.reactions, user?._id, reactionType)
        //                 };
        //             }
        //             if (targetType === 'reply') {
        //                 return {
        //                     ...c,
        //                     replies: updateReplyReactionRecursive(c.replies, targetId, reactionType)
        //                 };
        //             }
        //             return c;
        //         })
        //     );
        //     setShowReactions(null);

        // }).catch((error) => {
        //     toast.error("Error sending reply:");
        // });
    };

    // const updateReplyReactionRecursive = (
    //     replies: Reply[],
    //     targetId: string,
    //     reactionType: string
    // ): Reply[] => {
    //     return replies.map((r) => {
    //         if (r._id === targetId) {
    //             return {
    //                 ...r,
    //                 reactions: updateReactions(r.reactions, user?._id, reactionType)
    //             };
    //         }
    //         return {
    //             ...r,
    //             replies: updateReplyReactionRecursive(r.replies, targetId, reactionType)
    //         };
    //     });
    // };

    // const updateReactions = (reactions: any = {}, userId: string, reactionType: string) => {
    //     const newReactions: any = { ...reactions };

    //     // Xóa user khỏi tất cả reactions trước
    //     Object.keys(newReactions).forEach((key) => {
    //         newReactions[key] = newReactions[key].filter((id: string) => id !== userId);
    //     });

    //     // Nếu user chưa chọn hoặc đổi sang type khác → thêm vào
    //     if (!reactions[reactionType]?.includes(userId)) {
    //         newReactions[reactionType] = [...(newReactions[reactionType] || []), userId];
    //     }

    //     return newReactions;
    // };

    return (
        <div className="w-full">
            {/* Nội dung bài viết */}
            <div className="post-detail-top w-full border-b-2 border-gray-200 max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Bên trái: Nội dung chính */}
                <div className="lg:col-span-8">
                    <div className="max-w-none">
                        <div className="flex justify-between items-center">
                            <p className="text-base text-gray-400">
                                <a href="#" className="hover:text-blue-600">
                                    {article?.category?.name?.vi}
                                </a>
                            </p>
                            <p className="text-sm text-gray-500">{dayjs(article?.createdAt).format("DD/MM/YYYY HH:mm [GMT]Z")}</p>
                        </div>
                        <div className="mt-2">
                            <h1 className="text-3xl font-bold">{article?.summary}</h1>
                        </div>
                        <div className="mt-6">
                            <div
                                className="mt-6 prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: article?.content }}
                            />
                        </div>
                        <div className="text-xl !text-black mt-4 font-bold flex justify-end">
                            {article?.author?.userName}
                        </div>
                    </div>
                </div>

                {/* Bên phải: Xem nhiều */}
                <div className="lg:col-span-4 mt-5">
                    <div className="sticky top-20">
                        <h2 className="text-xl font-bold">Xem nhiều</h2>
                        <ul className="mt-4 space-y-4">
                            {listTopViewedNews.map((relatedPost) => (
                                <li
                                    key={relatedPost._id}
                                    className="border-b border-gray-200 pb-3 hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <a
                                        href={`/${relatedPost.slug}`}
                                        className="flex items-start space-x-3 cursor-pointer"
                                    >
                                        <div className="w-24 h-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                                            <img
                                                src={relatedPost.featuredImage || "/default-thumbnail.jpg"}
                                                alt={relatedPost.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <p className="text-gray-800 font-semibold line-clamp-2 hover:text-blue-600">
                                            {relatedPost.title}
                                        </p>
                                    </a>
                                </li>

                            ))}
                        </ul>
                    </div>
                </div>

            </div>

            {/* Bình luận */}
            <div className="post-detail-middle w-full max-w-3xl mt-10 mx-auto px-4 translate-x-[-20%]">
                <h2 className="text-2xl font-bold mb-4">Ý kiến</h2>
                {token ? (
                    <div className="flex items-start space-x-3">
                        <img
                            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
                            alt="User avatar"
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Viết bình luận..."
                                rows={4}
                                className="w-full border border-gray-400 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            ></textarea>
                            <div className="flex items-center justify-end mt-2" >
                                <div className="flex space-x-3 text-gray-500 mr-2">
                                    <button
                                        className="hover:text-blue-500"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    >
                                        <FontAwesomeIcon icon={faFaceSmile} />
                                    </button>


                                </div>
                                {showEmojiPicker && (
                                    <div className="absolute top-30 right-0 flex space-x-2 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-10">
                                        {reactionsList.map((r) => (
                                            <button
                                                key={r.type}
                                                onClick={() => {
                                                    setComment((prev) => prev + " " + r.icon); // 👉 chèn emoji vào ô nhập
                                                }}
                                                className={`text-xl hover:scale-125 transition-transform ${r.color}`}
                                                title={r.label}
                                            >
                                                {r.icon}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <button
                                    onClick={() => {
                                        handleCommentSubmit();
                                        setComment("");
                                    }}
                                    className="flex items-center bg-blue-600 !text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors "
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} className="mr-1" /> Gửi
                                </button>
                            </div>
                        </div>
                    </div>

                ) : (<><p className="text-gray-500">Bạn cần đăng nhập để bình luận</p></>)}



                {/* Danh sách bình luận */}
                <CommentList
                    comments={listComment}
                    showReplies={showReplies}
                    replyInputs={replyInputs}
                    setReplyInputs={setReplyInputs}
                    handleAddReply={handleAddReply}
                    handleAddReplyToReply={handleAddReplyToReply}
                    reactionsList={reactionsList}
                    showReactions={showReactions}
                    setShowReactions={setShowReactions}
                    handleSelectReaction={handleSelectReaction}
                    setShowReplies={setShowReplies}
                />

            </div>

            {/*Các bài viết liên quan*/}


            <div className="related-posts max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Bạn có thể quan tâm</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {listRelatedNews.length > 0 ? (listRelatedNews.map((post) => (
                        <div key={post._id} className="border border-gray-300 rounded-lg overflow-hidden">
                            <img src={post.featuredImage} alt={post.title} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold">{post.title}</h3>
                                <p className="text-gray-600">{post.summary}</p>
                            </div>
                            <div className="p-4">
                                <p className="text-xs text-gray-500">{post.createdAt}</p>
                            </div>
                        </div>
                    ))) : (
                        <p className="text-gray-500">Không có bài viết liên quan</p>
                    )}
                </div>
            </div>

            <div className="related-posts max-w-4xl mx-auto mt-10">
                <h2 className="text-2xl font-bold mb-4">Tin mới</h2>
                <div className="grid grid-cols-1 gap-4">
                    {listLastestNews.map((post) => (
                        <div
                            key={post._id}
                            className="flex border border-gray-300 rounded-lg overflow-hidden"
                        >
                            {/* Ảnh bên trái */}
                            <div className="w-1/3">
                                <img
                                    src={post.featuredImage}
                                    alt={post.title}
                                    className="w-full h-40 object-cover"
                                />
                            </div>

                            {/* Nội dung bên phải */}
                            <div className="w-2/3 p-4 flex flex-col justify-between">
                                <div>
                                    <a href={`/${post.slug}`} className="text-lg font-semibold mb-2">{post.title}</a>
                                    <p className="text-gray-600 text-sm">{post.summary}</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{dayjs(post.createdAt).format("DD/MM/YYYY")}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}


export default NewsDetail;