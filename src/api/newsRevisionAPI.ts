import { axiosPrivate } from "./axiosClient";



export class NewsRevisionAPI {

    static async GetAllNewsRevisions(page:number, limit:number) {
        const url = `/news-revision/all`;
        return axiosPrivate.get(url,{params: {page, limit}});
    }

    static async GetNewsRevisionByNewsId(newsId: string, page?: number, limit?: number) {
        const url = `/news-revision/news/${newsId}`;
        return axiosPrivate.get(url, { params: { page, limit } });
    }

    static async updateStatusNewsRevision(id: string, data: any) {
        const url = `/news-revision/update-status/${id}`;
        return axiosPrivate.put(url, data);
    }

    static async approveNewsRevision(id: string) {
        const url = `/news-revision/approve/${id}`;
        return axiosPrivate.put(url);
    }
}