import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { roleAccess } from "./utils/roleAccess";

// Middleware bảo vệ route theo role
export function middleware(req: NextRequest) {
    // const { pathname } = req.nextUrl;
    // const token = req.cookies.get("token")?.value;
    // // Mặc định là khách vãng lai
    // let role = "guest";

    // // Nếu có token thì giải mã lấy role
    // if (token) {
    //     try {
    //         const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    //         role = payload.role || "guest";
    //     } catch (err) {
    //         console.error("Token decode error:", err);
    //     }
    // }

    // // Kiểm tra quyền cho từng route
    // for (const route in roleAccess) {
    //     if (pathname.startsWith(route)) {
    //         const allowedRoles = roleAccess[route];
    //         if (!allowedRoles.includes(role)) {
    //             return NextResponse.redirect(new URL("/unauthorized", req.url));
    //         }
    //     }
    // }

    return NextResponse.next();
}

// Áp dụng middleware cho route cần bảo vệ
export const config = {
    matcher: ["/editor/:path*", "/chief-editor/:path*", "/admin/:path*"],
};