"use client";

import { ChevronLeft, ChevronRight, Eye, Pencil, Send, Trash2 } from "lucide-react";


type ArticleBase = {
    _id: string;
    title: string;
    featuredImage?: string;
    summary?: string;
    status?: "draft" | "pending" | "published" | "rejected";
    category?: string | { name?: { vi?: string } };
    content?: string;
};

type Props<T> = {
    title: string;
    items: T[];
    page: number;
    totalPages: number;
    selectedItem?: T | null;
    onPageChange: (page: number) => void;
    renderActions: (item: T) => React.ReactNode;
    closeModal: () => void;
    renderButtons: (item: T) => React.ReactNode;
};

export default function ArticleListLayout<T extends ArticleBase>({
    title,
    items,
    page,
    totalPages,
    selectedItem,
    onPageChange,
    renderActions,
    closeModal,
    renderButtons,
}: Props<T>) {
    return (
        <div className="min-h-screen p-6 bg-slate-100">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">{title}</h1>
                    {renderButtons(null as any)}
                </div>
                <div className="bg-white p-6 rounded-2xl shadow">
                    {items.length === 0 ? (
                        <p>Không có bài viết</p>
                    ) : (
                        <div className="divide-y">
                            {items.map((a) => (
                                <div
                                    key={a._id}
                                    className="flex gap-4 py-4 px-3 hover:bg-slate-50 transition rounded-lg border-b last:border-0"
                                >
                                    {/* Thumbnail */}
                                    <div className="w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-200">
                                        <img
                                            src={a.featuredImage || "/placeholder.png"}
                                            alt={a.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col flex-1">
                                        <div className="font-semibold text-base text-slate-800 line-clamp-2">
                                            {a.title}
                                        </div>

                                        <div className="mt-1 flex items-center gap-2 text-xs">
                                            <span className="inline-block px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                                {typeof a.category === "string"
                                                    ? a.category
                                                    : a.category?.name?.vi}
                                            </span>

                                            {a.status === "draft" && (
                                                <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                                                    📝 Bản nháp
                                                </span>
                                            )}
                                            {a.status === "pending" && (
                                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                                    ⏳ Đang chờ duyệt
                                                </span>
                                            )}
                                            {a.status === "published" && (
                                                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                                    ✅ Đã xuất bản
                                                </span>
                                            )}
                                            {a.status === "rejected" && (
                                                <span className="px-2 py-0.5 rounded-full bg-red-100 text-green-700">
                                                    Bị từ chối
                                                </span>
                                            )}
                                        </div>

                                        {a.summary && (
                                            <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                                                {a.summary}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {renderActions(a)}
                                </div>
                            ))}
                        </div>
                    )}


                    <div className="flex justify-between items-center mt-4 text-sm">
                        <span>
                            Trang {page}/{totalPages}
                        </span>

                        <div className="flex gap-2">
                            <button
                                onClick={() => onPageChange(page - 1)}
                                disabled={page <= 1}
                                className="px-2 py-1 rounded-md border disabled:opacity-40"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => onPageChange(page + 1)}
                                disabled={page >= totalPages}
                                className="px-2 py-1 rounded-md border disabled:opacity-40"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal chi tiết */}
                {selectedItem && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">

                            <div className="flex items-center justify-between p-4 border-b">
                                <h2 className="text-lg font-semibold">📖 Chi tiết bài viết</h2>
                            </div>

                            <div className="overflow-y-auto flex-1 p-6">
                                <h3 className="text-xl font-bold">{selectedItem.title}</h3>

                                <div className="mt-2 flex items-center gap-3 text-sm">
                                    <span className="inline-block px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                        {typeof selectedItem.category === "string"
                                            ? selectedItem.category
                                            : selectedItem.category?.name?.vi}
                                    </span>

                                    {selectedItem.status === "draft" && (
                                        <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                                            📝 Bản nháp
                                        </span>
                                    )}
                                    {selectedItem.status === "pending" && (
                                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                            ⏳ Đang chờ duyệt
                                        </span>
                                    )}
                                    {selectedItem.status === "published" && (
                                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                            ✅ Đã xuất bản
                                        </span>
                                    )}
                                </div>

                                <div
                                    className="mt-6 prose prose-sm max-w-none text-slate-700"
                                    dangerouslySetInnerHTML={{
                                        __html: selectedItem.content || "",
                                    }}
                                />
                            </div>

                            <div className="flex justify-end gap-2 border-t p-4">
                                <button
                                    onClick={() => closeModal()}
                                    className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm hover:bg-slate-300"
                                >
                                    Đóng
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
