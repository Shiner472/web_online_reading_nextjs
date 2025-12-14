
"use client";

import { useRef, useState, useCallback, forwardRef, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import CategoryAPI from "api/categoryAPI";
import AuthAPI from "api/authAPI";
import NewsAPI from "api/newsAPI";
import { toast } from "react-toastify";
import { useLoading } from "context/loadingContext";

const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import("react-quill-new");
        return forwardRef<any, any>((props, ref) => <RQ {...props} ref={ref} />)
    },
    { ssr: false }
);

type Category = {
    _id: string;
    name: { vi: string; en: string };
};

type PostFormProps = {
    mode: "create" | "update";
    initialData?: any; // dữ liệu bài viết khi update
    onSuccess?: () => void; // callback khi thành công
};

function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={`px-4 py-2 rounded-xl bg-blue-600 !text-white font-medium shadow hover:shadow-md transition hover:bg-blue-700 disabled:opacity-50 ${props.className ?? ""}`}
        >
            {children}
        </button>
    );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={`border rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none ${props.className ?? ""}`}
            placeholder="Nhập vào đây..."
        />
    );
}

function Label({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
    return (
        <label {...props} className={`block mb-1 font-semibold text-gray-700 ${props.className ?? ""}`}>
            {children}
        </label>
    );
}

const toolbarOptions = [
    ["bold", "italic", "underline"],
    ["link", "image", "video"],
    [{ header: 1 }, { header: 2 }],
    [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ size: ["small", false, "large", "huge"] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ["clean"],
];

export default function PostForm({ mode, initialData, onSuccess }: PostFormProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [summary, setSummary] = useState(initialData?.summary || "");
    const [featured, setFeatured] = useState<string | null>(initialData?.featuredImage || null);
    const [category, setCategory] = useState<string>(initialData?.category || "");
    const [editorHtml, setEditorHtml] = useState(initialData?.content || "");

    const [listCategories, setListCategories] = useState<Category[]>([]);
    const [user, setUser] = useState<any>(null);

    const quillRef = useRef<any>(null);
    const cloudinaryWidgetRef = useRef<any>(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

    const { showLoading, hideLoading } = useLoading();

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || "");
            setSummary(initialData.summary || "");
            setFeatured(initialData.featuredImage || null);

            // Giữ category là _id
            if (typeof initialData.category === "object" && initialData.category._id) {
                setCategory(initialData.category._id);
            } else if (typeof initialData.category === "string") {
                setCategory(initialData.category);
            } else {
                setCategory("");
            }

            setEditorHtml(initialData.content || "");
        }
    }, [initialData]);

    // lấy user
    useEffect(() => {
        if (token) {
            AuthAPI.getMe({ token })
                .then((res) => setUser(res.data))
                .catch((err) => toast.error("❌ Đã xảy ra lỗi: " + (err as Error).message));
        }
    }, [token]);

    // lấy categories
    useEffect(() => {
        CategoryAPI.getAllCategories()
            .then((res) => setListCategories(res.data))
            .catch((err) => toast.error("❌ Đã xảy ra lỗi: " + (err as Error).message));
    }, []);

    // cloudinary widget
    useEffect(() => {
        // @ts-ignore
        const myWidget = cloudinary.createUploadWidget(
            {
                cloudName: "ddwqvmtmb",
                uploadPreset: "readNewspaper_web",
                sources: ["local", "url", "camera"],
                multiple: false,
                resourceType: "image",
            },
            // @ts-ignore
            (error, result) => {
                if (!error && result && result.event === "success") {
                    const imageUrl = result.info.secure_url;
                    const quill = quillRef.current?.getEditor();
                    const range = quill?.getSelection(true);
                    if (quill) {
                        quill.insertEmbed(range ? range.index : 0, "image", imageUrl);
                    }
                }
            }
        );

        // @ts-ignore
        const myVideoWidget = cloudinary.createUploadWidget(
            {
                cloudName: "ddwqvmtmb",
                uploadPreset: "readNewspaper_web",
                sources: ["local", "url", "camera"],
                multiple: false,
                resourceType: "video",
            },
            // @ts-ignore
            (error, result) => {
                if (!error && result && result.event === "success") {
                    const videoUrl = result.info.secure_url;
                    const quill = quillRef.current?.getEditor();
                    const range = quill?.getSelection(true);
                    if (quill) {
                        quill.insertEmbed(range ? range.index : 0, "video", videoUrl);
                    }
                }
            }
        );

        cloudinaryWidgetRef.current = { myWidget, videoWidget: myVideoWidget };
    }, []);

    const imageHandler = useCallback(() => cloudinaryWidgetRef.current?.myWidget?.open(), []);
    const videoHandler = useCallback(() => cloudinaryWidgetRef.current?.videoWidget?.open(), []);

    const featuredHandler = useCallback(() => {
        // @ts-ignore
        cloudinary.openUploadWidget(
            {
                cloudName: "ddwqvmtmb",
                uploadPreset: "readNewspaper_web",
                sources: ["local", "url", "camera"],
                multiple: false,
                resourceType: "image",
            },
            // @ts-ignore
            (error, result) => {
                if (!error && result && result.event === "success") {
                    setFeatured(result.info.secure_url);
                }
            }
        );
    }, []);

    const handleSubmit = () => {
        const payload = {
            title,
            summary,
            category,
            featuredImage: featured,
            content: editorHtml,
            author: user?._id,
        };
        showLoading();
        try {
            if (mode === "create") {
                NewsAPI.CreateNews(payload)
                    .then(() => {
                        toast.success("Tạo bài viết thành công!");
                        onSuccess?.();
                    })
                    .catch(() => toast.error("Tạo bài viết thất bại."));
            } else {
                NewsAPI.UpdateNews(initialData._id, payload)
                    .then(() => {
                        toast.success("Cập nhật bài viết thành công!");
                        onSuccess?.();
                    })
                    .catch(() => toast.error("Cập nhật thất bại."));
            }
        } catch (error) {
            toast.error("❌ Đã xảy ra lỗi: " + (error as Error).message);
        } finally {
            hideLoading();
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-800">
                    {mode === "create" ? "✍️ Tạo bài báo mới" : "📝 Chỉnh sửa bài báo"}
                </h1>

                {/* Title + Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label>Tiêu đề</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div>
                        <Label>Thể loại</Label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none cursor-pointer !text-black"
                        >
                            <option value="" disabled hidden>Chọn thể loại</option>
                            {listCategories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name.vi}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Summary */}
                <div>
                    <Label>Tóm tắt</Label>
                    <textarea
                        className="w-full border rounded-xl p-3 min-h-[100px] focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                    />
                </div>

                {/* Featured image */}
                <div>
                    <Label>Ảnh đại diện</Label>
                    <div className="flex items-center gap-4">
                        <div className="w-40 h-28 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
                            {featured ? <img src={featured} alt="featured" className="object-cover w-full h-full" /> : <span>Chưa có ảnh</span>}
                        </div>
                        <Button type="button" onClick={featuredHandler}>
                            📷 Chọn ảnh
                        </Button>
                    </div>
                </div>

                {/* Editor */}
                <div>
                    <Label>Nội dung</Label>
                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={editorHtml}
                        onChange={setEditorHtml}
                        modules={{
                            toolbar: { container: toolbarOptions, handlers: { image: imageHandler, video: videoHandler } },
                        }}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4">
                    <Button
                        className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                        onClick={() => {
                            setTitle("");
                            setSummary("");
                            setEditorHtml("");
                            setFeatured(null);
                        }}
                    >
                        Làm lại
                    </Button>
                    <Button onClick={handleSubmit}>
                        {mode === "create" ? "💾 Lưu" : "💾 Cập nhật"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
