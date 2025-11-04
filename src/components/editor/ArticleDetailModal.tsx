"use client";
import { useState } from "react";
import {
  X,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b bg-slate-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              📖 Chi tiết bài viết
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Tác giả:{" "}
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
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tiêu đề */}
          <h3 className="text-2xl font-bold text-gray-900 border-b pb-2">
            {article.title || "Không có tiêu đề"}
          </h3>

          {/* Bài viết */}
          <div
            className="prose prose-sm max-w-none border rounded-lg bg-slate-50 p-4 overflow-y-auto max-h-[45vh]"
            dangerouslySetInnerHTML={{
              __html: article.content || "<i>Chưa có nội dung</i>",
            }}
          />

          {/* Kết quả quét */}
          {Array.isArray(scanResult) && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                🔍 Kết quả quét hình ảnh
              </h4>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scanResult.map((item, i) => {
                  const isSensitive =
                    item.prediction?.toLowerCase() === "sensitive";
                  return (
                    <div
                      key={i}
                      className={`relative p-3 rounded-xl border shadow-sm flex items-center gap-3 transition hover:shadow-md ${
                        isSensitive
                          ? "border-red-300 bg-red-50"
                          : "border-green-300 bg-green-50"
                      }`}
                    >
                      <img
                        src={item.image_url}
                        alt={`Image ${i}`}
                        className="w-24 h-24 object-cover rounded-md border"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Kết quả:{" "}
                          <span
                            className={
                              isSensitive
                                ? "text-red-600 font-semibold"
                                : "text-green-600 font-semibold"
                            }
                          >
                            {item.prediction}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Độ tin cậy: {(item.confidence * 100).toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        {isSensitive ? (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        ) : (
                          <ShieldCheck className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-5 border-t bg-slate-50">
          <button
            onClick={handleScanImages}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300 transition disabled:opacity-50"
          >
            {scanning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            Quét hình ảnh
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
