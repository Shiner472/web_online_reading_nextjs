'use client';
import SettingsAPI from "api/settingsAPI";
import dynamic from "next/dynamic";
import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return forwardRef<any, any>((props, ref) => <RQ {...props} ref={ref} />);
  },
  { ssr: false }
);

const SettingsAdminPage = () => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [nameWebsite, setNameWebsite] = useState<string>('');
  const [descriptionWebsite, setDescriptionWebsite] = useState<string>('');
  const [emailWebsite, setEmailWebsite] = useState<string>('');
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const quillRef = useRef<any>(null);
  const cloudinaryWidgetRef = useRef<any>(null);


  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await SettingsAPI.getSettings().then((res) => res.data);
        if (res) {
          setSettingsId(res._id);
          setLogoPreview(res.logo || null);
          setIconPreview(res.iconLogo || null);
          setNameWebsite(res.nameWebsite || '');
          setEmailWebsite(res.emailWebsite || '');
          setPhoneNumber(res.phoneWebsite || '');
          setDescriptionWebsite(res.descriptionWebsite || '');
        }
      } catch (error) {
        toast.error("❌ Có lỗi xảy ra khi tải cài đặt!");
      }
    };

    fetchSettings();
  }, []);

  const handleSaveChanges = async () => {
    const data = {
      logo: logoPreview,
      iconLogo: iconPreview,
      nameWebsite: nameWebsite,
      emailWebsite: emailWebsite,
      phoneWebsite: phoneNumber,
      descriptionWebsite: descriptionWebsite,
    };

    try {
      setLoading(true);
      if (settingsId) {
        // 🟡 Có ID → cập nhật
        await SettingsAPI.updateSettings(data);
        toast.success("✅ Cập nhật cài đặt thành công!");
      } else {
        // 🟢 Không có ID → tạo mới
        const res = await SettingsAPI.createSettings(data);
        setSettingsId(res.data._id);
        toast.success("✅ Tạo mới cài đặt thành công!");
      }
    } catch (error) {
      toast.error("❌ Có lỗi xảy ra khi lưu cài đặt!");
    } finally {
      setLoading(false);
    }
  };


  // ======= Cloudinary cho Quill =======
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
    cloudinaryWidgetRef.current = { myWidget };
  }, []);

  // ======= Cloudinary cho Logo =======
  const handleLogoUpload = useCallback(() => {
    // @ts-ignore
    const logoWidget = cloudinary.createUploadWidget(
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
          setLogoPreview(result.info.secure_url);
        }
      }
    );
    logoWidget.open();
  }, []);

  // ======= Cloudinary cho Icon =======
  const handleIconUpload = useCallback(() => {
    // @ts-ignore
    const iconWidget = cloudinary.createUploadWidget(
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
          setIconPreview(result.info.secure_url);
        }
      }
    );
    iconWidget.open();
  }, []);

  return (
    <div className="min-h-screen py-2 px-2">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          ⚙️ Cài đặt hệ thống
        </h1>

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Logo Upload */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Logo Website
              </h2>
              <p className="text-gray-500 mb-3 text-sm">
                Ảnh logo hiển thị ở đầu trang (header hoặc thanh điều hướng).
              </p>
              <div className="flex items-center space-x-6">
                <button
                  type="button"
                  onClick={handleLogoUpload}
                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
                >
                  Chọn ảnh logo
                </button>

                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="h-20 w-auto rounded-lg border border-gray-300 shadow-sm"
                  />
                ) : (
                  <div className="h-20 w-20 flex items-center justify-center border border-dashed border-gray-300 rounded-lg text-gray-400 text-sm">
                    Chưa có ảnh
                  </div>
                )}
              </div>
            </div>

            {/* Icon Upload */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Ảnh Icon (Favicon)
              </h2>
              <p className="text-gray-500 mb-3 text-sm">
                Icon nhỏ hiển thị trên tab trình duyệt hoặc ứng dụng.
              </p>
              <div className="flex items-center space-x-6">
                <button
                  type="button"
                  onClick={handleIconUpload}
                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
                >
                  Chọn ảnh icon
                </button>

                {iconPreview ? (
                  <img
                    src={iconPreview}
                    alt="Icon Preview"
                    className="h-12 w-12 rounded-lg border border-gray-300 shadow-sm"
                  />
                ) : (
                  <div className="h-12 w-12 flex items-center justify-center border border-dashed border-gray-300 rounded-lg text-gray-400 text-xs">
                    Chưa có ảnh
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Tên website
              </label>
              <input
                type="text"
                value={nameWebsite}
                onChange={(e) => setNameWebsite(e.target.value)}
                placeholder="Nhập tên website..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Địa chỉ website
              </label>
              <input
                type="text"
                placeholder="https://tenmiencuaban.vn"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email quản trị
              </label>
              <input
                type="email"
                value={emailWebsite}
                onChange={(e) => setEmailWebsite(e.target.value)}
                placeholder="admin@gmail.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0123 456 789"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Mô tả ngắn */}
        <div className="mt-10">
          <label className="block text-gray-700 font-medium mb-1">
            Mô tả ngắn về website
          </label>
          <textarea
            value={descriptionWebsite}
            onChange={(e) => setDescriptionWebsite(e.target.value)}
            rows={4}
            placeholder="Nhập mô tả ngắn gọn về trang web của bạn..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          ></textarea>
        </div>

        {/* Save Button */}
        <div className="pt-8 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSaveChanges}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 !text-white font-medium px-8 py-3 rounded-lg shadow">
            💾 Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsAdminPage;
