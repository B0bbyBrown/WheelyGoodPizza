import { useEffect, useState } from "react";

export function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isAppleDevice: /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent),
      isChrome: /Chrome/.test(navigator.userAgent),
      isSafari:
        /Safari/.test(navigator.userAgent) &&
        !/Chrome/.test(navigator.userAgent),
      localStorage: (() => {
        try {
          localStorage.setItem("test", "test");
          localStorage.removeItem("test");
          return "available";
        } catch {
          return "unavailable";
        }
      })(),
      cookies: navigator.cookieEnabled,
      online: navigator.onLine,
      language: navigator.language,
      timestamp: new Date().toISOString(),
      env: {
        supabaseUrl: !!(import.meta as any).env?.VITE_SUPABASE_URL,
        supabaseKey: !!(import.meta as any).env?.VITE_SUPABASE_ANON_KEY,
      },
    };
    setDebugInfo(info);
  }, []);

  if (!debugInfo) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🐛 Debug Info</h3>
      <div className="space-y-1">
        <div>
          <strong>Platform:</strong> {debugInfo.platform}
        </div>
        <div>
          <strong>Apple Device:</strong> {debugInfo.isAppleDevice ? "✅" : "❌"}
        </div>
        <div>
          <strong>Browser:</strong>{" "}
          {debugInfo.isChrome
            ? "Chrome"
            : debugInfo.isSafari
            ? "Safari"
            : "Other"}
        </div>
        <div>
          <strong>localStorage:</strong> {debugInfo.localStorage}
        </div>
        <div>
          <strong>Online:</strong> {debugInfo.online ? "✅" : "❌"}
        </div>
        <div>
          <strong>Env Vars:</strong>{" "}
          {debugInfo.env.supabaseUrl && debugInfo.env.supabaseKey ? "✅" : "❌"}
        </div>
      </div>
    </div>
  );
}
