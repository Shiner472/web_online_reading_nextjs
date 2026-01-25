"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Home, RotateCcw, TriangleAlert } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <TriangleAlert className="size-6" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600">Đã xảy ra lỗi</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                Có lỗi không mong muốn trong ứng dụng
              </h1>
              <p className="mt-2 text-slate-600">
                Bạn có thể thử lại thao tác vừa rồi. Nếu vẫn lỗi, hãy quay về trang chủ.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium !text-white hover:bg-slate-800 sm:w-auto"
            >
              <RotateCcw className="size-4" />
              Thử lại
            </button>

            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50 sm:w-auto"
            >
              <Home className="size-4" />
              Về trang chủ
            </Link>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-600">Thông tin kỹ thuật</p>
            <p className="mt-1 font-mono text-xs text-slate-900">
              {error?.digest ? `digest: ${error.digest}` : "digest: n/a"}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

