'use client'
import { useState } from "react";
import CommentItem from "./commentItem";

const CommentList = ({
    comments,
    showReplies,
    replyInputs,
    setReplyInputs,
    handleAddReply,
    handleAddReplyToReply,
    reactionsList,
    showReactions,
    setShowReactions,
    handleSelectReaction,
    setShowReplies
}: any) => {
    const [visibleCount, setVisibleCount] = useState(3); // mặc định hiện 3 comment

    return (
        <div className="space-y-6 mt-6">
            {comments.slice(0, visibleCount).map((c: any) => (
                <CommentItem
                    key={c._id}
                    comment={c}
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
            ))}

            {/* Nút Xem thêm / Thu gọn */}
            {comments.length > 3 && (
                <div className="text-center mt-4">
                    {visibleCount < comments.length ? (
                        <button
                            onClick={() => setVisibleCount(comments.length)}
                            className="text-blue-600 hover:underline"
                        >
                            Xem thêm bình luận
                        </button>
                    ) : (
                        <button
                            onClick={() => setVisibleCount(3)}
                            className="text-blue-600 hover:underline"
                        >
                            Thu gọn
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default CommentList;
