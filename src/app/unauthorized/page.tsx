

export default function UnauthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-2">Không có quyền truy cập</h1>
            <p className="text-gray-600">Vui lòng đăng nhập bằng tài khoản có quyền phù hợp.</p>
        </div>
    );
}