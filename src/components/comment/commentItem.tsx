import { useEffect, useState } from "react";
import InteractionButtons from "./interactionButtons";
import ReplyItem from "./replyItem";
import AuthAPI from "api/authAPI";

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

const CommentItem = ({
    comment,
    showReplies,
    replyInputs,
    setReplyInputs,
    handleAddReply,
    handleAddReplyToReply,
    reactionsList,
    showReactions,
    setShowReactions,
    handleSelectReaction,
    setShowReplies }: any) => {

    const createdAt = new Date(comment.createdAt)
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
        <div key={comment._id} className="flex items-start pb-4">
            <img
                className="w-10 h-10 rounded-full object-cover mr-2"
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
                alt="User avatar"
            />
            <div className="border-b border-gray-200 ml-2 w-full pb-4">
                <p className="font-semibold">{comment.user?.userName}</p>
                <p className="text-gray-700">{comment.content}</p>
                <div className="flex items-center space-x-4 mt-2 justify-between">
                    <InteractionButtons
                        targetType="comment"
                        parentId={comment._id}
                        targetId={comment._id}
                        currentReaction={getCurrentReaction(comment)}
                        setShowReactions={setShowReactions}
                        showReactions={showReactions}
                        handleSelectReaction={handleSelectReaction}
                        reactionsList={reactionsList}
                        setShowReplies={setShowReplies}
                    />
                    <div className="flex items-center space-x-2 mt-2">
                        {/* Icon đại diện cảm xúc (nếu có) */}
                        <div className="flex -space-x-1">
                            {Object.entries(comment.reactions || {})
                                .filter(([_, users]) => (users as string[]).length > 0)
                                .slice(0, 3) // chỉ lấy tối đa 3 loại cảm xúc
                                .map(([type], index) => {
                                    const r = reactionsList.find((x:any) => x.type === type);
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
                            {(Object.values(comment.reactions || {}) as string[][]).reduce(
                                (sum, users) => sum + users.length,
                                0
                            )} lượt tương tác
                        </span>
                    </div>
                    <div className="flex items-center mt-2">
                        <p>{timeAgo(createdAt)}</p>
                    </div>
                </div>
                {/* Ô nhập phản hồi cho comment */}
                {showReplies[`comment-${comment._id}`] && (
                    <div className="flex items-center mt-2 ml-2">
                        <div className="flex items-center mr-2">
                            <img
                                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
                                alt="User avatar"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        </div>
                        <div className="flex w-full">
                            <input
                                type="text"
                                value={replyInputs[`comment-${comment._id}`] ?? ""}
                                onChange={(e) =>
                                    setReplyInputs((prev: any) => ({
                                        ...prev,
                                        [`comment-${comment._id}`]: e.target.value
                                    }))
                                }
                                placeholder="Nhập phản hồi..."
                                className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={() => handleAddReply(comment._id)}
                                className="ml-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Gửi
                            </button>
                        </div>
                    </div>
                )}

                {comment.replies?.length > 0 && (
                    <ReplyItem
                        parentId={comment._id}
                        replies={comment.replies}
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
    )

}

export default CommentItem;