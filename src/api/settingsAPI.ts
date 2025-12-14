



import { axiosClient, axiosPrivate } from "./axiosClient";



class SettingsAPI {

    static async getSettings() {
        const url = '/settings';
        return axiosPrivate.get(url);
    }

    static async createSettings(data: any) {
        const url = '/settings/create';
        return axiosPrivate.post(url, data);
    }

    static async updateSettings(data: any) {
        const url = '/settings/update';
        return axiosPrivate.put(url, data);
    }
}
export default SettingsAPI;