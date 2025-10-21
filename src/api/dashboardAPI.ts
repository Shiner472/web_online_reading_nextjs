import { axiosClient } from "./axiosClient";



class DashboardAPI {

    static async GetOverView() {
        const url = '/dashboard/overview';
        return axiosClient.get(url);
    }

    static async GetReadersByDay() {
        const url = '/dashboard/readers-by-day';
        return axiosClient.get(url);
    }

    static async GetCategoryStats() {
        const url = '/dashboard/category-stats';
        return axiosClient.get(url);
    }

    static async GetTopArticles() {
        const url = '/dashboard/top-articles';
        return axiosClient.get(url);
    }
}
export default DashboardAPI;

