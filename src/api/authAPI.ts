import { axiosClient, axiosPrivate } from "./axiosClient"


class AuthAPI {
    static async login(data: any) {
        const url = '/auth/login';
        return axiosClient.post(url, data);
    }

    static async register(data: any) {
        const url = '/auth/register';
        return axiosClient.post(url, data);
    }

    static async confirmUser(data:any) {
        const url = '/auth/verify';
        return axiosClient.post(url, data);
    }


    static async resendVerificationCode(data: any) {
        const url = '/auth/resend-verification-code';
        return axiosClient.post(url, data);
    }

    static async resetPassword(data: any) {
        const url = '/auth/resetPassword';
        return axiosClient.post(url, data);
    }

    static async getMe(data: any) {
        const url = '/auth/me';
        return axiosClient.post(url, data);
    }

    static async updateProfile(id: string, data: any) {
        const url = `/auth/updateProfile/${id}`;
        return axiosClient.put(url, data);
    }

    static async permissionRole (id:string, data:any){
        const url = `/auth/permission-role/${id}`;
        return axiosPrivate.put(url, data);
    }

    static async getAllUsers(){
        const url = '/auth/all-users';
        return axiosPrivate.get(url);
    }

    static async bannedUser(id:string, data: any){
        const url = `/auth/banned/${id}`;
        return axiosPrivate.put(url,data);
    }

}

export default AuthAPI;