"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import InputField from "components/inputField/inputField";
import CategoryAPI from "api/categoryAPI";
import { toast } from "react-toastify";
import { useLoading } from "context/loadingContext";
import { useTranslations } from "next-intl";

type Category = {
    id: string;
    name: string;
};

const ManageCategoryPage = () => {
    const [categoryName, setCategoryName] = useState<string>("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [editing, setEditing] = useState<Category | null>(null);
    const { showLoading, hideLoading } = useLoading();
    const t = useTranslations('ManageCategoryPage');

    // --- Load categories ---
    useEffect(() => {
        CategoryAPI.getAllCategories()
            .then((response) => {
                const fetchedCategories = response.data.map((cat: any) => ({
                    id: cat._id,
                    name: cat.name.vi,
                }));
                setCategories(fetchedCategories);
            })
            .catch(() => {
                toast.error(t("networkError"));
            });
    }, []);

    // --- Pagination ---
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(categories.length / itemsPerPage);

    const paginatedCategories = categories.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // --- Create / Update ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryName.trim()) return;

        showLoading();

        if (editing) {
            // Update
            CategoryAPI.updateCategory({
                id: editing.id,
                name: { vi: categoryName, en: " " },
            })
                .then((response) => {
                    const updated = {
                        id: response.data._id,
                        name: response.data.name.vi,
                    };
                    setCategories((prev) =>
                        prev.map((c) => (c.id === editing.id ? updated : c))
                    );
                    setEditing(null);
                    toast.success(t("editCategorySucces"));
                })
                .catch(() => {
                    toast.error(t("editCategoryError"));
                })
                .finally(() => hideLoading());
        } else {
            // Create
            CategoryAPI.createCategory({
                name: { vi: categoryName, en: " " },
            })
                .then((response) => {
                    const newCategory: Category = {
                        id: response.data._id,
                        name: response.data.name.vi,
                    };
                    setCategories((prev) => [...prev, newCategory]);
                    toast.success(t("addCategorySuccess"));
                    setCurrentPage(1);
                })
                .catch(() => {
                    toast.error(t("addCategoryError"));
                })
                .finally(() => hideLoading());
        }

        setCategoryName("");
    };

    // --- Delete ---
    const handleDelete = (id: string) => {
        if (confirm(t("confirmDelete"))) {
            showLoading();
            try {
                CategoryAPI.deleteCategory(id)
                    .then(() => {
                        setCategories((prev) => prev.filter((c) => c.id !== id));
                        toast.success(t("deleteCategorySuccess"));

                        // Nếu xóa hết trang hiện tại thì lùi về trang trước
                        if (
                            (currentPage - 1) * itemsPerPage >= categories.length - 1 &&
                            currentPage > 1
                        ) {
                            setCurrentPage(currentPage - 1);
                        }
                    })
                    .catch(() => {
                        toast.error(t("deleteError"));
                    });
            } catch (error) {
                toast.error(t("deleteError"));
            } finally {
                hideLoading();
            }
        }
    };

    // --- Edit ---
    const handleEdit = (cat: Category) => {
        setEditing(cat);
        setCategoryName(cat.name);
    };

    return (
        <div className="p-2">
            <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>

            {/* Form thêm / sửa */}
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl"
            >
                <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="col-span-2">
                        <InputField
                            id="categoryName"
                            label={t("categoryName")}
                            type="text"
                            placeholder={t("categoryNamePlaceholder")}
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-end col-span-1">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 !text-white px-5 py-2 rounded-md text-sm font-medium shadow-sm transition flex items-center gap-2"
                        >
                            {editing ? (
                                <>
                                    <Pencil className="w-4 h-4" /> {t("update")}
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" /> {t("addCategory")}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* Danh sách danh mục */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">{t("categoryList")}</h2>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    STT
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("categoryName")}
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t("actions")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedCategories.map((cat, index) => (
                                <tr key={cat.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 text-sm text-gray-700">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-700">
                                        {cat.name}
                                    </td>
                                    <td className="px-6 py-3 text-center flex justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(cat)}
                                            className="px-3 py-1 bg-yellow-500 !text-white rounded-md text-sm hover:bg-yellow-600 flex items-center gap-1"
                                        >
                                            <Pencil className="w-4 h-4" /> {t("update")}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="px-3 py-1 bg-red-600 !text-white rounded-md text-sm hover:bg-red-700 flex items-center gap-1"
                                        >
                                            <Trash2 className="w-4 h-4" /> {t("delete")}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-6 py-4 text-center text-gray-500"
                                    >
                                        {t("noCategories")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {categories.length > itemsPerPage && (
                    <div className="flex justify-center mt-4 gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            {t("previous")}
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 border rounded ${currentPage === i + 1
                                    ? "bg-blue-600 !text-white"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.min(p + 1, totalPages))
                            }
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            {t("next")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageCategoryPage;
