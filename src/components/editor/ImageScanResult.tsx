"use client";
import { AlertTriangle } from "lucide-react";

export default function ImageScanResult({ images }: { images: string[] }) {
  return (
    <div className="bg-red-50 border border-red-200 p-4 rounded-lg mt-3">
      <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
        <AlertTriangle className="w-5 h-5" />
        Phát hiện hình ảnh vi phạm
      </div>
      <div className="grid grid-cols-2 gap-3">
        {images.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`Vi phạm ${idx + 1}`}
            className="w-full h-32 object-cover rounded-lg border border-red-300"
          />
        ))}
      </div>
    </div>
  );
}
