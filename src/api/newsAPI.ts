import { axiosClient, axiosPrivate } from "./axiosClient";




class NewsAPI {

    static async CreateNews(data: any) {
        const url = '/news/create';
        return axiosPrivate.post(url, data);
    }

    static async GetNewsById(id: string) {
        const url = `/news/${id}`;
        return axiosClient.get(url);
    }

    static async GetNewsBySlug(slug: string) {
        const url = `/news/slug/${slug}`;
        return axiosClient.get(url);
    }

    static async GetNewsByAuthor(authorId: string, limit: number, page: number) {
        const url = `/news/author/${authorId}`;
        return axiosClient.get(url, { params: { limit, page } });
    }

    static async IncreaseViewCount(slug: string) {
        const url = `/news/view/${slug}`;
        return axiosClient.put(url);
    }

    static async UpdateNews(id: string, data: any) {
        const url = `/news/update/${id}`;
        return axiosPrivate.put(url, data);
    }

    static async UpdateNewsStatus(data: any) {
        const url = `/news/status`;
        return axiosPrivate.put(url, data);
    }

    static async DeleteNews(id: string) {
        const url = `/news/${id}`;
        return axiosPrivate.delete(url);
    }

    static async GetAllNews(page:number, limit:number) {
        const url = '/news/all';
        return axiosClient.get(url,{params: {page, limit}});
    }

    static async HighlightIsFeatured(id: string, data: any) {
        const url = `/news/featured/${id}`;
        return axiosPrivate.put(url, data);
    }

    static async GetFeaturedNews(limit: number) {
        const url = `/news/featured`;
        return axiosClient.get(url, { params: { limit } });
    }


    static async PutPriority(id: string, data: any) {
        const url = `/news/priority/${id}`;
        return axiosPrivate.put(url, data);
    }

    static async GetTopViewedNews(params: { limit?: number; category?: string, slug?: string }) {
        const url = `/news/top-viewed`;
        return axiosClient.get(url, { params });
    }

    static async GetRelatedNews(id: string) {
        const url = `/news/related/${id}`;
        return axiosClient.get(url);
    }


    static async GetLastestNews(limit: number, slug?: string) {
        const url = `/news/latest-articles`;
        return axiosClient.get(url, { params: { limit, slug } });
    }

    static async SearchNews (keySearch: string){
        const url ='/news/search';
        return axiosClient.get(url, {params: {keySearch}});
    }
}

export default NewsAPI;
