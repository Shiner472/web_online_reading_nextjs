import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import NewsAPI from "api/newsAPI";
import NotificationAPI from "api/notificationAPI";
import { toast } from "react-toastify";


export const fetchArticles = createAsyncThunk(
    "articles/fetchArticles",
    async ({ page, limit, isGetDraft }: { page: number; limit: number, isGetDraft?: boolean }) => {
        const res = await NewsAPI.GetAllNews(page, limit, isGetDraft);
        return res.data;
    }
);

export const toggleHighlight = createAsyncThunk(
    "articles/toggleHighlight",
    async (article: any) => {
        await NewsAPI.HighlightIsFeatured(article._id, {
            isFeatured: !article.isFeatured,
        });

        return {
            id: article._id,
            isFeatured: !article.isFeatured,
        };
    }
);

export const approveArticle = createAsyncThunk(
    "articles/approveArticle",
    async (obj: any) => {
        try {
            await NewsAPI.UpdateNewsStatus({
                id: obj.article._id,
                status: "published",
                approvedBy: obj.user._id,
            });
            toast.success("Duyệt bài viết thành công!");

            await NotificationAPI.createNotification({
                sender: obj.user._id,
                receiver: obj.article.author?._id,
                title: "Bài viết của bạn đã được duyệt!",
                articleId: obj.article._id,
            });
        } catch (error) {
            toast.error("❌ Có lỗi xảy ra, vui lòng thử lại sau.");
        }

        return obj.article;

    }
)

export const rejectArticle = createAsyncThunk(
    "articles/rejectArticle",
    async (obj: any) => {
        try {
            await NewsAPI.UpdateNewsStatus({
                id: obj.article._id,
                status: "rejected",
                reason: obj.reason,
                approvedBy: obj.user._id,
            });
            toast.success("Đã từ chối bài viết!");

            await NotificationAPI.createNotification({
                sender: obj.user._id,
                receiver: obj.article.author?._id,
                title: "Bài viết của bạn đã bị từ chối vì: " + obj.reason,
                articleId: obj.article._id,
            });
        } catch (error) {
            toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
        }
        return obj.article;
    }
);

export const getArticlesByAuthor = createAsyncThunk(
    "articles/getArticlesByAuthor",
    async (obj: any) => {
        const res = await NewsAPI.GetNewsByAuthor(obj.authorId, obj.limit, obj.page);
        return res.data;
    }
);

export const getArticleBySlug = createAsyncThunk(
    "articles/getArticleBySlug",
    async (slug: string) => {
        const response = await NewsAPI.GetNewsBySlug(slug);
        return response.data;
    }
)

export const saveArticle = createAsyncThunk(
    "articles/saveArticle",
    async (articleData: any) => {
        //showLoading();
        try {
            if (articleData.mode === "create") {
                NewsAPI.CreateNews(articleData.payload)
                    .then(() => {
                        toast.success("Tạo bài viết thành công!");
                        // onSuccess?.();
                    })
                    .catch(() => toast.error("Tạo bài viết thất bại."));
            } else {
                NewsAPI.UpdateNews(articleData.newsId, articleData.payload)
                    .then(() => {
                        toast.success("Cập nhật bài viết thành công!");
                        // onSuccess?.();
                    })
                    .catch(() => toast.error("Cập nhật thất bại."));
            }
        } catch (error) {
            toast.error("❌ Đã xảy ra lỗi: " + (error as Error).message);
        } finally {
            //hideLoading();
        }
    }
)

export const increaseViewArticle = createAsyncThunk(
    "articles/increaseViewArticle",
    async (slug: string) => {
        NewsAPI.IncreaseViewCount(slug)
    }
);

interface ArticlesState {
    list: any[];
    article: any;
    totalPages: number;
    selected: any | null;
    loading: boolean;
}

const initialState: ArticlesState = {
    list: [],
    article: null,
    totalPages: 1,
    selected: null,
    loading: false,
};


const articleSlice = createSlice({
    name: "articles",
    initialState,
    reducers: {
        setSelectedArticle(state, action) {
            state.selected = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchArticles.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchArticles.fulfilled, (state, action) => {
                state.list = action.payload.items;
                state.totalPages = action.payload.totalPages;
                state.loading = false;
            })
            .addCase(fetchArticles.rejected, (state) => {
                state.loading = false;
            })
            .addCase(toggleHighlight.fulfilled, (state, action) => {
                const { id, isFeatured } = action.payload;

                const item = state.list.find((x) => x._id === id);
                if (item) {
                    item.isFeatured = isFeatured;
                }

                if (state.selected?._id === id) {
                    state.selected.isFeatured = isFeatured;
                }
            })
            .addCase(approveArticle.fulfilled, (state, action) => {
                const approvedArticle = action.payload;
                const item = state.list.find((x) => x._id === approvedArticle._id);
                if (item) {
                    item.status = "published";
                    item.reason = undefined;
                }
                if (state.selected?._id === approvedArticle._id) {
                    state.selected.status = "published";
                    state.selected.reason = undefined;
                }
            })
            .addCase(rejectArticle.fulfilled, (state, action) => {
                const rejectedArticle = action.payload;
                const item = state.list.find((x) => x._id === rejectedArticle._id);
                if (item) {
                    item.status = "rejected";
                    item.reason = rejectedArticle.reason;
                }
                if (state.selected?._id === rejectedArticle._id) {
                    state.selected.status = "rejected";
                    state.selected.reason = rejectedArticle.reason;
                }
            })
            .addCase(saveArticle.pending, (state) => {
                state.loading = true;
            })
            .addCase(saveArticle.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(getArticlesByAuthor.fulfilled, (state, action) => {
                state.list = action.payload.items;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(getArticleBySlug.fulfilled, (state, action) => {
                state.article = action.payload;
            })
            .addCase(increaseViewArticle.fulfilled, (state, action) => {
                state.loading = false;
            })
    },
});

export const { setSelectedArticle } = articleSlice.actions;

export default articleSlice.reducer;