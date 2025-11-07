"use client";
import { useState } from "react";
import {
  X,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { ImageScanAPI } from "api/imageScanAPI";

function extractImageUrls(html: string): string[] {
  if (!html) return [];
  const div = document.createElement("div");
  div.innerHTML = html;
  const imgs = Array.from(div.querySelectorAll("img"));
  return imgs
    .map((img) => img.getAttribute("src") || "")
    .filter((src) => src && !src.startsWith("data:"));
}

type Props = {
  article: any;
  onClose: () => void;
};

export default function ArticleDetailModal({ article, onClose }: Props) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any[] | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);

  const handleScanImages = async () => {
    const imageUrls = extractImageUrls(article.content || "");
    if (imageUrls.length === 0) {
      toast.info("🖼 Bài viết không có hình ảnh để quét.");
      return;
    }

    setScanning(true);
    try {
      const data = await ImageScanAPI.scanImages(imageUrls);
      setScanResult(data);
      setShowRightPanel(true);

      const hasSensitive = data.some(
        (item: any) => item.prediction?.toLowerCase() === "sensitive"
      );
      if (hasSensitive) toast.warning("⚠️ Phát hiện hình ảnh vi phạm!");
      else toast.success("✅ Không phát hiện hình ảnh vi phạm.");
    } catch (err) {
      console.error(err);
      toast.error("❌ Lỗi khi quét hình ảnh.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      {/* Modal chính */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          width: showRightPanel ? "90%" : "70%",
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-2xl max-w-6xl max-h-[90vh] overflow-hidden flex relative transition-all"
      >
        {/* Nút đóng modal */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 shadow-sm transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Bên trái - Bài viết */}
        <motion.div
          animate={{ width: showRightPanel ? "50%" : "100%" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex flex-col bg-gradient-to-br from-slate-50 to-white"
        >
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {article.title || "Không có tiêu đề"}
            </h2>
            <p className="text-sm text-gray-500">
              ✍️ Tác giả:{" "}
              <span className="font-medium text-gray-700">
                {article.author?.userName || "Không rõ"}
              </span>{" "}
              •{" "}
              <span>
                {new Date(article.createdAt || Date.now()).toLocaleString(
                  "vi-VN"
                )}
              </span>
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div
              className="prose prose-sm max-w-none bg-white rounded-xl shadow-inner p-4 border border-slate-100"
              dangerouslySetInnerHTML={{
                __html: article.content || "<i>Chưa có nội dung</i>",
              }}
            />
          </div>

          <div className="p-5 border-t border-slate-200 flex justify-center">
            <button
              onClick={handleScanImages}
              disabled={scanning}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300 transition disabled:opacity-50 shadow-sm"
            >
              {scanning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-4 h-4" />
                  Quét hình ảnh
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Bên phải - Kết quả quét */}
        <AnimatePresence>
          {showRightPanel && (
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-1/2 bg-white border-l border-slate-200 overflow-y-auto p-6 flex flex-col relative"
            >
              {/* Nút đóng nửa phải */}
              <button
                onClick={() => setShowRightPanel(false)}
                className="absolute top-3 left-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 shadow-sm transition"
                title="Đóng kết quả quét"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2 justify-center">
                🔍 Kết quả quét hình ảnh
              </h3>

              {Array.isArray(scanResult) && scanResult.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {scanResult.map((item, i) => {
                    const isSensitive =
                      item.prediction?.toLowerCase() === "sensitive";
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className={`p-4 rounded-xl shadow-sm flex flex-col gap-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isSensitive
                            ? "border border-red-300 bg-red-50"
                            : "border border-green-300 bg-green-50"
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <img
                              src={item.image_url}
                              alt={`Ảnh ${i}`}
                              className={`w-24 h-24 object-cover rounded-lg border ${isSensitive
                                  ? "border-red-300"
                                  : "border-green-300"
                                }`}
                            />
                            <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md">
                              {isSensitive ? (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              ) : (
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                          </div>

                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {isSensitive ? (
                                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md text-xs font-semibold">
                                  Ảnh vi phạm 🚫
                                </span>
                              ) : (
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs font-semibold">
                                  An toàn ✅
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              Độ tin cậy:{" "}
                              <span className="font-semibold text-gray-800">
                                {(item.confidence * 100).toFixed(2)}%
                              </span>
                            </p>
                            <a
                              href={item.image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline break-all mt-1 block"
                            >
                              {item.image_url.length > 50
                                ? item.image_url.slice(0, 50) + "..."
                                : item.image_url}
                            </a>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const reason = prompt(
                              "Nhập lý do bạn cho rằng ảnh này không vi phạm:"
                            );
                            if (!reason) return;
                            toast.success("🚩 Đã gửi báo cáo cho Admin!");
                          }}
                          className="text-xs mt-2 text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1 rounded-md self-end transition"
                        >
                          🚩 Báo cáo ảnh không vi phạm
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic text-center mt-10">
                  Chưa có dữ liệu quét.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
