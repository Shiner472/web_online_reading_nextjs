'use client'
import AuthAPI from "api/authAPI";
import { memo, useEffect, useState } from "react";

function timeAgo(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // tính giây

    if (diff < 60) {
        return `${diff} giây trước`;
    } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return `${minutes} phút trước`;
    } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return `${hours} giờ trước`;
    } else {
        const days = Math.floor(diff / 86400);
        return `${days} ngày trước`;
    }
}

// Component con: RenderReplies (tách riêng & dùng memo để tránh re-render)
const ReplyItem = memo(function ReplyItem({
    parentId,
    replies,
    showReplies,
    replyInputs,
    setReplyInputs,
    handleAddReplyToReply,
    InteractionButtons,
    reactionsList,
    showReactions,
    setShowReactions,
    handleSelectReaction,
    setShowReplies
}: any) {
    const [visibleReplyCount, setVisibleReplyCount] = useState(2); // Mặc định hiển thị 2 reply
    const token = localStorage.getItem("token");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        AuthAPI.getMe({ token: token || "" })
            .then((response) => {
                setCurrentUserId(response.data._id);
            })
            .catch((error) => {
                console.error("Failed to fetch user profile:", error);
            });
    }, [token]);

    const getCurrentReaction = (comment: any) => {
        if (!comment.reactions) return null;

        for (const r of reactionsList) {
            if (comment.reactions[r.type]?.includes(currentUserId)) {
                return r; // trả về {type, icon, label}
            }
        }
        return null;
    };

    return (
        <div className="mt-3 space-y-3 ">
            {replies.slice(0, visibleReplyCount).map((reply: any) => (
                <div key={reply._id} className="p-3 flex border-l-2 border-gray-300">
                    <img
                        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
                        alt="User avatar"
                        className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="ml-2 w-full">
                        <p className="font-semibold">{reply.user.userName}</p>
                        <p className="text-gray-700">{reply.content}</p>
                        <div className="flex items-center space-x-4 mt-2 justify-between">
                            <InteractionButtons
                                targetType="reply"
                                parentId={parentId}
                                targetId={reply._id}
                                currentReaction={getCurrentReaction(reply)}
                                setShowReactions={setShowReactions}
                                showReactions={showReactions}
                                handleSelectReaction={handleSelectReaction}
                                reactionsList={reactionsList}
                                setShowReplies={setShowReplies}
                            />
                            <div className="flex items-center space-x-2 mt-2">
                                {/* Icon đại diện cảm xúc (nếu có) */}
                                <div className="flex -space-x-1">
                                    {Object.entries(reply.reactions || {})
                                        .filter(([_, users]) => (users as string[]).length > 0)
                                        .slice(0, 3) // chỉ lấy tối đa 3 loại cảm xúc
                                        .map(([type], index) => {
                                            const r = reactionsList.find((x: any) => x.type === type);
                                            return (
                                                <span
                                                    key={index}
                                                    className="w-6 h-6 flex items-center justify-center rounded-full border bg-white text-sm"
                                                >
                                                    {r?.icon}
                                                </span>
                                            );
                                        })}
                                </div>

                                {/* Tổng số người tương tác */}
                                <span className="text-sm text-gray-600">
                                    {(Object.values(reply.reactions || {}) as string[][]).reduce(
                                        (sum, users) => sum + users.length,
                                        0
                                    )} lượt tương tác
                                </span>
                            </div>
                            <div className="flex items-center mt-2">
                                <p>{timeAgo(new Date(reply.createdAt))}</p>
                            </div>
                        </div>

                        {showReplies[`reply-${reply._id}`] && (
                            <div className="mt-2 flex items-center">
                                <img
                                    src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
                                    alt="User avatar"
                                    className="w-8 h-8 rounded-full object-cover mr-2"
                                />
                                <input
                                    type="text"
                                    value={replyInputs[`reply-${reply._id}`] ?? ""}
                                    onChange={(e) =>
                                        setReplyInputs((prev: any) => ({
                                            ...prev,
                                            [`reply-${reply._id}`]: e.target.value
                                        }))
                                    }
                                    placeholder="Nhập phản hồi..."
                                    className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={() => handleAddReplyToReply(parentId, reply._id)}
                                    className="ml-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Gửi
                                </button>
                            </div>
                        )}

                        {reply.replies?.length > 0 && (
                            <ReplyItem
                                parentId={parentId}
                                replies={reply.replies}
                                showReplies={showReplies}
                                replyInputs={replyInputs}
                                setReplyInputs={setReplyInputs}
                                handleAddReplyToReply={handleAddReplyToReply}
                                InteractionButtons={InteractionButtons}
                                reactionsList={reactionsList}
                                showReactions={showReactions}
                                setShowReactions={setShowReactions}
                                handleSelectReaction={handleSelectReaction}
                                setShowReplies={setShowReplies}
                            />
                        )}
                    </div>
                </div>
            ))}

            {/* Nút Xem thêm / Thu gọn reply */}
            {replies.length > 2 && (
                <div className="ml-10 text-sm mt-1">
                    {visibleReplyCount < replies.length ? (
                        <button
                            onClick={() => setVisibleReplyCount(replies.length)}
                            className="text-blue-600 hover:underline"
                        >
                            Xem thêm phản hồi
                        </button>
                    ) : (
                        <button
                            onClick={() => setVisibleReplyCount(2)}
                            className="text-blue-600 hover:underline"
                        >
                            Thu gọn phản hồi
                        </button>
                    )}
                </div>
            )}
        </div>
    );
});


export default ReplyItem;
