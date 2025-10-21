import { axiosClient, axiosPrivate } from "./axiosClient";



class CategoryAPI {

    static async getAllCategories() {
        const url = '/category/all';
        return axiosClient.get(url);
    }

    static async createCategory( data: any) {
        const url = '/category/create';
        return axiosPrivate.post(url, data);
    }

    static async updateCategory( data: any) {
        const url = `/category/update`;
        return axiosPrivate.put(url, data);
    }

    static async deleteCategory( id: string) {
        const url = `/category/delete/${id}`;
        return axiosPrivate.delete(url);
    }
}
export default CategoryAPI;