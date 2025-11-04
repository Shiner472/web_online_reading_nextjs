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
}
