"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Loader2, CheckCircle, Trash2, Play } from "lucide-react";
import Image from "next/image";

type ImageItem = {
  id: number;
  name: string;
  uploader: string;
  date: string;
  status: "pending" | "training" | "done";
  progress: number;
  url: string;
};

const AITrainingPage = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "training" | "done">("all");
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    setImages([
      {
        id: 1,
        name: "cat.jpg",
        uploader: "Nguyễn Văn A",
        date: "2025-11-06",
        status: "pending",
        progress: 0,
        url: "https://placekitten.com/200/200",
      },
      {
        id: 2,
        name: "dog.png",
        uploader: "Trần Thị B",
        date: "2025-11-06",
        status: "training",
        progress: 65,
        url: "https://placedog.net/200/200",
      },
      {
        id: 3,
        name: "apple.png",
        uploader: "Admin",
        date: "2025-11-05",
        status: "done",
        progress: 100,
        url: "https://placehold.co/200x200?text=Apple",
      },
    ]);
  }, []);

  const handleTrainAll = () => {
    setIsTraining(true);
    setImages((prev) =>
      prev.map((img) =>
        img.status === "pending"
          ? { ...img, status: "training", progress: 0 }
          : img
      )
    );

    const interval = setInterval(() => {
      setImages((prev) =>
        prev.map((img) => {
          if (img.status === "training" && img.progress < 100) {
            const newProgress = Math.min(img.progress + Math.random() * 15, 100);
            return {
              ...img,
              progress: newProgress,
              status: newProgress === 100 ? "done" : "training",
            };
          }
          return img;
        })
      );
    }, 800);

    setTimeout(() => {
      clearInterval(interval);
      setIsTraining(false);
    }, 10000);
  };

  const handleDelete = (id: number) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const filteredImages =
    filter === "all" ? images : images.filter((img) => img.status === filter);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Huấn luyện hình ảnh AI
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý, theo dõi và huấn luyện mô hình AI từ hình ảnh người dùng gửi lên.
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ huấn luyện</option>
            <option value="training">Đang huấn luyện</option>
            <option value="done">Hoàn tất</option>
          </select>

          <button
            disabled={isTraining}
            onClick={handleTrainAll}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm ${
              isTraining
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isTraining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Đang huấn luyện...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Bắt đầu huấn luyện
              </>
            )}
          </button>
        </div>
      </div>

      {/* Danh sách ảnh */}
      {filteredImages.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Không có hình ảnh nào cần huấn luyện.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative w-full h-40 bg-gray-50">
                <Image
                  src={img.url}
                  alt={img.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm">{img.name}</span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      img.status === "done"
                        ? "bg-green-100 text-green-600"
                        : img.status === "training"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {img.status === "done"
                      ? "Hoàn tất"
                      : img.status === "training"
                      ? "Đang huấn luyện"
                      : "Chờ huấn luyện"}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mb-1">
                  Người gửi: <span className="font-medium">{img.uploader}</span>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  Ngày gửi: <span className="font-medium">{img.date}</span>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      img.status === "done"
                        ? "bg-green-500"
                        : "bg-blue-500"
                    } transition-all`}
                    style={{ width: `${img.progress}%` }}
                  />
                </div>

                <div className="flex justify-end items-center gap-2 mt-3">
                  {img.status === "done" && (
                    <CheckCircle className="text-green-500 w-5 h-5" />
                  )}
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AITrainingPage;
