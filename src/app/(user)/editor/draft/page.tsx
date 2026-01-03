"use client";

import { NewsRevisionAPI } from "api/newsRevisionAPI";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Draft = {
    id: string;
    image?: string;
    title: string;
};


export default function DraftEditorPage() {
    const router = useRouter();
    const [page] = useState(1);
    const params = useSearchParams();
    const rawParamPage = params?.get("newsId");
    const newsId = rawParamPage ? String(rawParamPage) : "";
    const [listDrafts, setListDrafts] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);

    const [openModal, setOpenModal] = useState(false);
    const [selectedDraft, setSelectedDraft] = useState<any>(null);


    useEffect(() => {
        try {
            NewsRevisionAPI.GetNewsRevisionByNewsId(newsId, page, 10).then((res) => {
                setListDrafts(res.data.items);
                setTotalPages(res.data.totalPages);
            });
        } catch (error) {
            console.log("Failed to fetch news revisions:", error);
        }
    }, [newsId, page]);

    const changePage = (newPage: number) => {
        newPage === 1 ? router.push(`/editor/draft`) : router.push(`/editor/draft?page=${newPage}`);
    };

    const handleApproveDraft = async (draftId: string) => {
        try {
            await NewsRevisionAPI.approveNewsRevision(draftId)
                .then(() => {
                    alert("Phê duyệt bản nháp thành công!");
                    // Refresh the list after approval
                    NewsRevisionAPI.GetNewsRevisionByNewsId(newsId, page, 10).then((res) => {
                        setListDrafts(res.data.items);
                        setTotalPages(res.data.totalPages);
                    });
                });
        } catch (error) {
            console.error("Failed to approve draft:", error);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-gray-800">
                        Quản lý bản nháp
                    </h1>
                </div>

                {/* Draft list */}
                <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                    {listDrafts.map((draft) => (
                        <div
                            key={draft._id}
                            className="flex items-center justify-between gap-4 border-b last:border-b-0 pb-4"
                        >
                            {/* Image + title */}
                            <div className="flex items-center gap-4">
                                {draft.image ? (
                                    <img
                                        src={draft.image}
                                        alt=""
                                        className="w-24 h-24 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                                        No Image
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <div className="font-medium">{draft.title}</div>
                                    <div className="text-sm text-gray-500">
                                        Thời gian tạo: {new Date(draft.createdAt).toLocaleDateString()}
                                    </div>

                                </div>


                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedDraft(draft);
                                        setOpenModal(true);
                                    }}
                                    className="px-3 py-1 rounded-md border border-purple-300
                  text-purple-700 hover:bg-purple-50 transition text-sm"
                                >
                                    Xem
                                </button>

                                {draft.status !== 'published' ? (
                                    <button
                                        onClick={() => handleApproveDraft(draft._id)}
                                        className="px-3 py-1 rounded-md border border-green-300
                  text-green-700 hover:bg-green-50 transition text-sm"
                                    >
                                        Phê duyệt
                                    </button>) : null}

                                <button
                                    className="px-3 py-1 rounded-md border border-red-300
                  text-red-600 hover:bg-red-50 transition text-sm"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-4 text-sm">
                        <span>Trang {page}/1</span>

                        <div className="flex gap-2">
                            <button
                                onClick={() => changePage(page - 1)}
                                disabled={page <= 1}
                                className="px-2 py-1 rounded-md border disabled:opacity-40"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => changePage(page + 1)}
                                disabled={page >= totalPages}
                                className="px-2 py-1 rounded-md border disabled:opacity-40"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {openModal && selectedDraft && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg overflow-hidden">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h2 className="text-lg font-semibold">
                                Chi tiết bản nháp
                            </h2>
                            <button
                                onClick={() => setOpenModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

                            {/* Image */}
                            {selectedDraft.image && (
                                <img
                                    src={selectedDraft.image}
                                    alt=""
                                    className="w-full max-h-[300px] object-cover rounded-lg"
                                />
                            )}

                            {/* Title */}
                            <h1 className="text-xl font-semibold">
                                {selectedDraft.title}
                            </h1>

                            {/* Meta */}
                            <div className="text-sm text-gray-500">
                                Ngày tạo:{" "}
                                {new Date(selectedDraft.createdAt).toLocaleString()}
                            </div>

                            {/* Divider */}
                            <hr />

                            {/* Nội dung bài viết */}
                            <div
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: selectedDraft.content || "<p>Không có nội dung</p>",
                                }}
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-2 px-6 py-4 border-t">
                            <button
                                onClick={() => setOpenModal(false)}
                                className="px-4 py-2 rounded-md border text-gray-600 hover:bg-gray-50"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
