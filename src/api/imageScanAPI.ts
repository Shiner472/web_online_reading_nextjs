import { axiosClient } from "./axiosClient";



export class ImageScanAPI {
    static async scanImages(dataImage: string[]) {
        const res = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ urls: dataImage }), // 👈 khớp với Flask
        });

        if (!res.ok) {
            throw new Error(`Server error ${res.status}`);
        }

        const result = await res.json();
        return result; // 👈 trả về dữ liệu JSON từ Flask
    }


    static async requestImageTraning(data: any) {
        const url = "/image-training/request-training"
        return axiosClient.post(url, data);
    }

    static async getAllImagePending() {
        const url = "/image-training/pending-images"
        return axiosClient.get(url);
    }


    static async updateImageStatus(id: string, data: any) {
        const url = "/image-training/update-status/" + id;
        return axiosClient.put(url, data);
    }

    static async trainData() {
        const res = await fetch("http://127.0.0.1:5000/train", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}), // 👈 khớp với Flask
        });

        if (!res.ok) {
            throw new Error(`Server error ${res.status}`);
        }

        const result = await res.json();
        return result; // 👈 trả về dữ liệu JSON từ Flask
    }



    static async feedbackImages(dataImage: any[]) {
        const res = await fetch("http://127.0.0.1:5000/feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ urls: dataImage }), // 👈 khớp với Flask
        });

        if (!res.ok) {
            throw new Error(`Server error ${res.status}`);
        }

        const result = await res.json();
        return result; // 👈 trả về dữ liệu JSON từ Flask
    }
}
