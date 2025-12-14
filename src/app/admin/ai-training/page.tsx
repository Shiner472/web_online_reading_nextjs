"use client";

import { useEffect, useState } from "react";
import { ImageIcon, Loader2, CheckCircle, Trash2, Play } from "lucide-react";
import { ImageScanAPI } from "api/imageScanAPI";
import { toast } from "react-toastify";


const AITrainingPage = () => {
  const [images, setImages] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "training" | "done">("all");
  const [isTraining, setIsTraining] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState<string>("");
  const [rejectReason, setRejectReason] = useState("");


  useEffect(() => {
    try {
      ImageScanAPI.getAllImagePending().then((response) => {
        setImages(response.data);
      });
    } catch (error) {
      toast.error("Lỗi khi lấy danh sách hình ảnh chờ huấn luyện.");
    }
  }, []);

  const imagesListUrl = (images: any[]) => {
    return images.map((img: any) => ({ url: img.url, type: img.type }))
  }

  const handleTrainAll = async () => {
    const listImageUrl = imagesListUrl(images);
    await ImageScanAPI.feedbackImages(listImageUrl);
    await ImageScanAPI.trainData();
    await Promise.all(
      images.map(img => {
        ImageScanAPI.updateImageStatus(img._id, {
          status: "trained",
        })
      })
    )

    // setIsTraining(true);
    // setImages((prev) =>
    //   prev.map((img) =>
    //     img.status === "pending"
    //       ? { ...img, status: "training", progress: 0 }
    //       : img
    //   )
    // );

    // const interval = setInterval(() => {
    //   setImages((prev) =>
    //     prev.map((img) => {
    //       if (img.status === "training" && img.progress < 100) {
    //         const newProgress = Math.min(img.progress + Math.random() * 15, 100);
    //         return {
    //           ...img,
    //           progress: newProgress,
    //           status: newProgress === 100 ? "done" : "training",
    //         };
    //       }
    //       return img;
    //     })
    //   );
    // }, 800);

    // setTimeout(() => {
    //   clearInterval(interval);
    //   setIsTraining(false);
    // }, 10000);
  };

  const handleConfirmReject = () => {
    try {
      ImageScanAPI.updateImageStatus(rejectId, {
        status: "rejected",
        rejectReason: rejectReason
      }).then((res) => {
        setImages((prev) => prev.filter((img) => img._id !== rejectId));
        toast.success("Từ chối thành công")
        setRejectId("");
        setRejectReason("");
        setShowRejectModal(false);
      })
    } catch (error) {
      toast.error("Từ chối không thành công");
    }
  };

  const filteredImages =
    filter === "all" ? images : images.filter((img) => img.status === filter);

  return (
    <div className="p-6 space-y-6">
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-3">Nhập lý do từ chối</h2>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded p-2 text-sm"
              placeholder="Lý do từ chối..."
            ></textarea>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-200"
              >
                Hủy
              </button>

              <button
                disabled={!rejectReason.trim()}
                onClick={handleConfirmReject}
                className={`px-3 py-1.5 rounded !text-white ${rejectReason.trim()
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-red-300 cursor-not-allowed"
                  }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}


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
            className={`flex items-center gap-2 px-4 py-2 rounded-md !text-white text-sm ${isTraining
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
              key={img._id}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative w-full h-40 bg-gray-50">
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <div className="flex justify-between items-center mb-2">

                  {/* Badge type */}
                  <span
                    className={`
      text-xs font-medium px-2 py-0.5 rounded-full
      ${img.type === "safe"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-red-100 text-red-600"}
    `}
                  >
                    {img.type === "safe" ? "An toàn" : "Nhạy cảm"}
                  </span>

                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${img.status === "done"
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
                  Người gửi: <span className="font-medium">{img.sender?.userName}</span>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  Ngày gửi: <span className="font-medium">{new Date(img.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${img.status === "done"
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
                    onClick={() => {
                      setRejectId(img._id);
                      setRejectReason("");
                      setShowRejectModal(true);
                    }}
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
