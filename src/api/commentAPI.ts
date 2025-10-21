import { axiosClient, axiosPrivate } from "./axiosClient";



export class CommentAPI {

    static async createComment(data : any) {
        const url = '/comment/create';
        return axiosPrivate.post (url, data);
    }

    static async getCommentsBySlug(slug: string) {
        const url = `/comment/${slug}`;
        return axiosClient.get(url);
    }

    static async reactionComment(data: any) {
        const url = '/comment/reaction';
        return axiosPrivate.post(url, data);
    }

}