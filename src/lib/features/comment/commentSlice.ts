import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CommentAPI } from "api/commentAPI";


export const getAllCommentsBySlug = createAsyncThunk(
    "comment/getAllCommentBySlug",
    async (slug: string) => {
        const res = await CommentAPI.getCommentsBySlug(slug);
        return res.data;
    }
);

export const submitComment = createAsyncThunk(
    "comment/submitComment",
    async (comment: any) => {
        const res = await CommentAPI.createComment(comment);
        return res.data;
    }
);

export const submitReplyComment = createAsyncThunk(
    "comment/submitReplyComment",
    async (reply: any) => {
        const res = await CommentAPI.createComment(reply);
        return res.data;
    }
);

export const submitReplyOfReply = createAsyncThunk(
    "comment/submitReplyOfReply",
    async (reply: any) => {
        const res = await CommentAPI.createComment(reply);
        return res.data;
    }
);


export const reactionComment = createAsyncThunk(
    "comment/reactionComment",
    async (data: any) => {
        const payload = {
            commentId: data.targetId,
            user: data.user?._id,
            reactionType: data.reactionType
        }
        await CommentAPI.reactionComment(payload);

        return data;
    }
)

interface CommentSlice {
    list: any[],
    selected: any | null;
    loading: boolean;
};
const initialState: CommentSlice = {
    list: [],
    selected: null,
    loading: false
};

const addReplyRecursive = (list: any[], replyId: string, newReply: any): any[] => {
    return list.map((r: any) => {
        const replies = Array.isArray(r.replies) ? r.replies : [];

        if (r._id === replyId) {
            return { ...r, replies: [...replies, newReply] };
        }
        return { ...r, replies: addReplyRecursive(replies, replyId, newReply) };
    });
};

const updateReplyReactionRecursive = (
    replies: any[],
    targetId: string,
    reactionType: string,
    user: any
): any[] => {
    return replies.map((r) => {
        if (r._id === targetId) {
            return {
                ...r,
                reactions: updateReactions(r.reactions, user?._id, reactionType)
            };
        }
        return {
            ...r,
            replies: updateReplyReactionRecursive(r.replies, targetId, reactionType, user)
        };
    });
};

const updateReactions = (reactions: any = {}, userId: string, reactionType: string) => {
    const newReactions: any = { ...reactions };

    // Xóa user khỏi tất cả reactions trước
    Object.keys(newReactions).forEach((key) => {
        newReactions[key] = newReactions[key].filter((id: string) => id !== userId);
    });

    // Nếu user chưa chọn hoặc đổi sang type khác → thêm vào
    if (!reactions[reactionType]?.includes(userId)) {
        newReactions[reactionType] = [...(newReactions[reactionType] || []), userId];
    }

    return newReactions;
};

const CommentSlice = createSlice({
    name: "comment",
    initialState,
    reducers: {

    },
    extraReducers(builder) {
        builder
            .addCase(getAllCommentsBySlug.fulfilled, (state, action) => {
                state.list = action.payload;
                state.loading = false;
            })
            .addCase(submitComment.fulfilled, (state, action) => {
                state.list.unshift(action.payload);
            })
            .addCase(submitReplyComment.fulfilled, (state, action) => {
                const reply = action.payload;
                const parentId = reply.parentComment;

                const parent = state.list.find(c => c._id === parentId);
                if (parent) {
                    if (!parent.replies) parent.replies = [];
                    parent.replies.push(reply);
                }
            })
            .addCase(submitReplyOfReply.fulfilled, (state, action) => {
                const reply = action.payload;
                const parentId = reply.parentComment;

                state.list = addReplyRecursive(state.list, parentId, reply)
            })
            .addCase(reactionComment.fulfilled, (state, action) => {
                const { targetId, targetType, user, reactionType } = action.payload;
                state.list = state.list.map((c) => {
                    if (targetType === 'comment' && c._id === targetId) {
                        // toggle cho comment
                        return {
                            ...c,
                            reactions: updateReactions(c.reactions, user?._id, reactionType)
                        };
                    }
                    if (targetType === 'reply') {
                        return {
                            ...c,
                            replies: updateReplyReactionRecursive(c.replies, targetId, reactionType, user)
                        };
                    }
                    return c;
                })
            })
    },
})

export default CommentSlice.reducer;