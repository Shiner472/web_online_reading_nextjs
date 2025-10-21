import { useEffect } from "react";

export default function useReadingTracker(newsId: string, userId?: string) {
    useEffect(() => {
        if (!newsId) return;

        // Mỗi tab là một session riêng
        let sessionId = sessionStorage.getItem("sessionId");
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem("sessionId", sessionId);
        }

        let lastSentTime = Date.now();
        let hasSentFinal = false;

        const sendLog = (isFinal = false) => {
            const now = Date.now();
            const delta = Math.floor((now - lastSentTime) / 1000);
            if (delta <= 0) return;

            lastSentTime = now;

            const data = {
                news: newsId,
                user: userId || null,
                duration: delta,
                sessionId,
                isFinal,
                userAgent: navigator.userAgent,
            };

            const url = `${process.env.NEXT_PUBLIC_API_URL}/view-log`;

            if (isFinal) {
                try {
                    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
                    navigator.sendBeacon(url, blob);
                } catch {
                    fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                        keepalive: true,
                    }).catch(() => { });
                }
            } else {
                fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                }).catch(() => { });
            }
        };

        const interval = setInterval(() => {
            if (document.visibilityState === "visible") sendLog(false);
        }, 15000);

        const sendFinalLog = () => {
            if (hasSentFinal) return;
            hasSentFinal = true;
            sendLog(true);
        };

        window.addEventListener("pagehide", sendFinalLog);
        window.addEventListener("beforeunload", sendFinalLog);
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") sendFinalLog();
        });

        return () => {
            clearInterval(interval);
            sendFinalLog();
            window.removeEventListener("pagehide", sendFinalLog);
            window.removeEventListener("beforeunload", sendFinalLog);
        };
    }, [newsId, userId]);
}
