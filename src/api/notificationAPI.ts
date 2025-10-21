

import { axiosClient } from "./axiosClient";



class NotificationAPI {

    static async getAllNotification(userId: string) {
        const url = '/notification/' + userId;
        return axiosClient.get(url);
    }

    static async createNotification(data: any) {
        const url = '/notification/create';
        return axiosClient.post(url, data);
    }

    static async markReaded(id: string) {
        const url = '/notification/markReaded/' + id;
        return axiosClient.put(url);
    }
}
export default NotificationAPI;